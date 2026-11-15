import { ApiError, GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse } from "@google/genai";
import { kalimatNyeri, alasanPerhatian, ringkasanTemplate } from "./fallback";
import { buatPrompt, SYSTEM_INSTRUCTION } from "./prompts";
import { RINGKASAN_JSON_SCHEMA, RingkasanSchema, type InputRingkasan, type Ringkasan } from "./schema";

export type HasilRingkasan = {
  isi: Ringkasan;
  sumber: "ai" | "template";
  model: string | null;
  alasanFallback?: string;
};

/** Antarmuka minimal klien, agar bisa diganti klien palsu saat testing. */
export type KlienGemini = {
  models: { generateContent: (p: GenerateContentParameters) => Promise<Pick<GenerateContentResponse, "text">> };
};

let klienDefault: KlienGemini | null = null;
function ambilKlien(): KlienGemini {
  if (!klienDefault) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY belum diisi");
    klienDefault = new GoogleGenAI({ apiKey });
  }
  return klienDefault;
}

const tunggu = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pengaman deterministik di atas output AI: */
function terapkanPengaman(isi: Ringkasan, input: InputRingkasan): Ringkasan {
  const poin = [...isi.poin];
  const nyeri = kalimatNyeri(input);
  if (nyeri && !poin.some((p) => /nyeri/i.test(p))) {
    if (poin.length >= 4) poin[3] = nyeri;
    else poin.push(nyeri);
  }
  const alasan = alasanPerhatian(input);
  const perlu = isi.perlu_perhatian || alasan.length > 0;
  return {
    poin,
    perlu_perhatian: perlu,
    alasan_perhatian: perlu ? isi.alasan_perhatian || alasan.join(", ") : "",
  };
}

/** Membuat ringkasan mingguan untuk fisioterapis. */
export async function buatRingkasan(
  input: InputRingkasan,
  opsi: { klien?: KlienGemini; model?: string; timeoutMs?: number; jedaUlangMs?: number } = {},
): Promise<HasilRingkasan> {
  const cadangan = (alasan: string): HasilRingkasan => ({
    isi: ringkasanTemplate(input),
    sumber: "template",
    model: null,
    alasanFallback: alasan,
  });

  const model = opsi.model ?? process.env.GEMINI_MODEL;
  if (!model) return cadangan("GEMINI_MODEL belum diisi");

  let klien: KlienGemini;
  try {
    klien = opsi.klien ?? ambilKlien();
  } catch (e) {
    return cadangan(e instanceof Error ? e.message : "klien AI gagal dibuat");
  }

  for (let percobaan = 1; percobaan <= 2; percobaan++) {
    try {
      const res = await klien.models.generateContent({
        model,
        contents: buatPrompt(input),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema: RINGKASAN_JSON_SCHEMA,
          httpOptions: { timeout: opsi.timeoutMs ?? 10_000 },
        },
      });
      const teks = res.text;
      if (!teks) return cadangan("respons AI kosong");

      let json: unknown;
      try {
        json = JSON.parse(teks);
      } catch {
        return cadangan("respons AI bukan JSON");
      }
      const parsed = RingkasanSchema.safeParse(json);
      if (!parsed.success) return cadangan("format respons AI tidak sesuai skema");

      return { isi: terapkanPengaman(parsed.data, input), sumber: "ai", model };
    } catch (e) {
      const status = e instanceof ApiError ? e.status : undefined;
      if (status !== undefined && status >= 500 && percobaan < 2) {
        await tunggu(opsi.jedaUlangMs ?? 800);
        continue;
      }
      if (status === 429) return cadangan("kuota AI habis (429)");
      return cadangan(`gagal memanggil AI${status ? ` (HTTP ${status})` : ""}`);
    }
  }
  return cadangan("gagal memanggil AI");
}
