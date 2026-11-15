import { describe, expect, it } from "vitest";
import { ApiError } from "@google/genai";
import { bangunInput } from "@/lib/ai/agregat";
import { ringkasanTemplate } from "@/lib/ai/fallback";
import { buatRingkasan, type KlienGemini } from "@/lib/ai/gemini";
import { hashInput } from "@/lib/ai/hash";
import { buatPrompt } from "@/lib/ai/prompts";
import { RingkasanSchema } from "@/lib/ai/schema";

const puncak = [72, 75, 78, 80, 84, 83, 88, 91, 95, 97, 101, 104];
const kompen = [3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1];

function dataContoh(denganNyeri = true) {
  return bangunInput({
    periodeHari: 14,
    program: [
      { kode_gerakan: "angkat_samping", target_sudut: 90, aktif: true },
      { kode_gerakan: "tekuk_siku", target_sudut: 120, aktif: true },
      { kode_gerakan: "angkat_depan", target_sudut: 90, aktif: false },
    ],
    sesi: puncak.map((p, i) => ({
      mulai: `2026-11-${String(i + 1).padStart(2, "0")}T09:00:00Z`,
      sesi_gerakan: [
        { kode_gerakan: "angkat_samping", repetisi_selesai: 10, rep_kompensasi: kompen[i], puncak_maks: p },
        { kode_gerakan: "tekuk_siku", repetisi_selesai: 10, rep_kompensasi: 0, puncak_maks: 100 + i },
      ],
    })),
    kejadian: denganNyeri
      ? [{ jenis: "stop_nyeri", kode_gerakan: "angkat_samping", sudut: 82, repetisi_ke: 4 }]
      : [],
  });
}

const klienPalsu = (fn: () => Promise<{ text: string | undefined }>): KlienGemini => ({
  models: { generateContent: fn },
});

describe("bangunInput", () => {
  it("menghitung tren & mengabaikan gerakan nonaktif", () => {
    const input = dataContoh();
    expect(input.gerakan.map((g) => g.kode)).toEqual(["angkat_samping", "tekuk_siku"]);
    const samping = input.gerakan[0];
    expect(samping.puncak_awal).toBe(72);
    expect(samping.puncak_akhir).toBe(104);
    expect(samping.sesi_pertama_capai_target).toBe(8);
    expect(samping.persen_kompensasi_awal).toBe(30);
    expect(samping.persen_kompensasi_akhir).toBe(10);
    expect(input.sesi_dilakukan).toBe(12);
  });

  it("tidak membawa data identitas apa pun ke prompt", () => {
    const prompt = buatPrompt(dataContoh());
    expect(prompt).not.toMatch(/pasien_id|nama_tampilan|Budi|terapis|@/i);
  });
});

describe("ringkasanTemplate", () => {
  it("selalu valid terhadap skema dan menyebut nyeri", () => {
    const r = ringkasanTemplate(dataContoh());
    expect(RingkasanSchema.safeParse(r).success).toBe(true);
    expect(r.poin.some((p) => /nyeri/i.test(p))).toBe(true);
    expect(r.perlu_perhatian).toBe(true);
  });

  it("tetap menghasilkan ringkasan saat data kosong", () => {
    const r = ringkasanTemplate(bangunInput({ periodeHari: 14, program: [], sesi: [], kejadian: [] }));
    expect(r.poin.length).toBeGreaterThan(0);
  });
});

describe("buatRingkasan", () => {
  const opsi = { model: "model-uji", jedaUlangMs: 0 };

  it("memakai hasil AI bila valid", async () => {
    const klien = klienPalsu(async () => ({
      text: JSON.stringify({
        poin: ["Jangkauan angkat ke samping naik dari 72° ke 104°.", "Ada laporan nyeri di 82°."],
        perlu_perhatian: true,
        alasan_perhatian: "ada nyeri",
      }),
    }));
    const h = await buatRingkasan(dataContoh(), { ...opsi, klien });
    expect(h.sumber).toBe("ai");
    expect(h.isi.poin).toHaveLength(2);
  });

  it("menambahkan kalimat nyeri bila AI lupa menyebutnya", async () => {
    const klien = klienPalsu(async () => ({
      text: JSON.stringify({ poin: ["Jangkauan naik dari 72° ke 104°."], perlu_perhatian: false, alasan_perhatian: "" }),
    }));
    const h = await buatRingkasan(dataContoh(), { ...opsi, klien });
    expect(h.sumber).toBe("ai");
    expect(h.isi.poin.some((p) => /nyeri/i.test(p))).toBe(true);
    expect(h.isi.perlu_perhatian).toBe(true);
  });

  it("beralih ke template saat kuota habis (429)", async () => {
    const klien = klienPalsu(async () => {
      throw new ApiError({ message: "quota", status: 429 });
    });
    const h = await buatRingkasan(dataContoh(), { ...opsi, klien });
    expect(h.sumber).toBe("template");
    expect(h.alasanFallback).toMatch(/429/);
  });

  it("mencoba ulang sekali untuk error 5xx", async () => {
    let panggilan = 0;
    const klien = klienPalsu(async () => {
      panggilan++;
      if (panggilan === 1) throw new ApiError({ message: "busy", status: 503 });
      return { text: JSON.stringify({ poin: ["Kehadiran baik, 12 sesi."], perlu_perhatian: false, alasan_perhatian: "" }) };
    });
    const h = await buatRingkasan(dataContoh(false), { ...opsi, klien });
    expect(panggilan).toBe(2);
    expect(h.sumber).toBe("ai");
  });

  it("beralih ke template bila JSON rusak atau tidak sesuai skema", async () => {
    const rusak = await buatRingkasan(dataContoh(), { ...opsi, klien: klienPalsu(async () => ({ text: "bukan json" })) });
    expect(rusak.sumber).toBe("template");
    const salah = await buatRingkasan(dataContoh(), {
      ...opsi,
      klien: klienPalsu(async () => ({ text: JSON.stringify({ poin: [] }) })),
    });
    expect(salah.sumber).toBe("template");
  });

  it("beralih ke template bila model belum diatur", async () => {
    const h = await buatRingkasan(dataContoh(), { model: "", klien: klienPalsu(async () => ({ text: "{}" })) });
    expect(h.sumber).toBe("template");
  });
});

describe("hashInput", () => {
  it("stabil terhadap urutan key dan berubah bila versi prompt berubah", () => {
    const a = hashInput({ b: 1, a: [1, { y: 2, x: 1 }] }, "v1");
    const b = hashInput({ a: [1, { x: 1, y: 2 }], b: 1 }, "v1");
    expect(a).toBe(b);
    expect(hashInput({ a: 1 }, "v1")).not.toBe(hashInput({ a: 1 }, "v2"));
  });
});
