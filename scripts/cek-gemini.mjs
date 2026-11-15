// Cek API key & daftar model yang bisa dipakai, lalu uji satu panggilan.
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("✗ GEMINI_API_KEY belum diisi di .env.local");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

console.log("Model yang mendukung generateContent (cari yang berlabel flash / flash-lite):\n");
const pager = await ai.models.list();
for await (const m of pager) {
  if (m.supportedActions?.includes("generateContent")) {
    console.log(`  ${m.name?.replace("models/", "").padEnd(42)} ${m.displayName ?? ""}`);
  }
}

const model = process.env.GEMINI_MODEL;
if (!model) {
  console.log("\n! GEMINI_MODEL belum diisi. Pilih salah satu nama di atas, isi ke .env.local, lalu jalankan lagi.");
  process.exit(0);
}

console.log(`\nUji panggilan ke ${model} …`);
const t0 = Date.now();
try {
  const res = await ai.models.generateContent({
    model,
    contents: 'Balas JSON {"ok": true} saja.',
    config: { responseMimeType: "application/json", temperature: 0, httpOptions: { timeout: 15000 } },
  });
  console.log(`✓ Berhasil dalam ${Date.now() - t0} ms →`, res.text);
} catch (e) {
  console.error(`✗ Gagal (HTTP ${e?.status ?? "?"}):`, e?.message ?? e);
  if (e?.status === 429) console.error("  Kuota habis/terbatas. Cek limit di Google AI Studio → Usage / Rate limits.");
  if (e?.status === 404) console.error("  Nama model salah atau tidak tersedia untuk akun ini.");
  process.exit(1);
}
