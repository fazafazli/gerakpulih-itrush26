import type { InputRingkasan, Ringkasan } from "./schema";

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace(".", ","));

/** Kalimat wajib untuk kejadian nyeri. Dipakai template & sebagai pengaman output AI. */
export function kalimatNyeri(input: InputRingkasan): string | null {
  const n = input.kejadian_nyeri.length;
  if (!n) return null;
  const k = input.kejadian_nyeri[0];
  const di = k.sudut != null ? ` di ${fmt(k.sudut)}°` : "";
  const lain = n > 1 ? ` (total ${n} laporan)` : "";
  return `Pasien melaporkan nyeri saat ${k.gerakan.toLowerCase()}${di}${lain}. Pertimbangkan pemeriksaan langsung sebelum target dinaikkan.`;
}

/** Alasan "perlu perhatian" yang dihitung dengan aturan pasti (tanpa AI). */
export function alasanPerhatian(input: InputRingkasan): string[] {
  const alasan: string[] = [];
  if (input.kejadian_nyeri.length) alasan.push("ada laporan nyeri");
  if (input.sesi_direncanakan > 0 && input.sesi_dilakukan / input.sesi_direncanakan < 0.7) alasan.push("kehadiran di bawah 70%");
  if (input.gerakan.some((g) => g.puncak_awal != null && g.puncak_akhir != null && g.puncak_akhir < g.puncak_awal - 5)) {
    alasan.push("jangkauan gerak menurun");
  }
  return alasan;
}

export function ringkasanTemplate(input: InputRingkasan): Ringkasan {
  const poin: string[] = [];

  const berubah = input.gerakan
    .filter((g) => g.puncak_awal != null && g.puncak_akhir != null)
    .sort((a, b) => Math.abs(b.puncak_akhir! - b.puncak_awal!) - Math.abs(a.puncak_akhir! - a.puncak_awal!))
    .slice(0, 2);

  for (const g of berubah) {
    const selisih = g.puncak_akhir! - g.puncak_awal!;
    const arah = selisih >= 0 ? `naik ${fmt(selisih)}°` : `turun ${fmt(-selisih)}°`;
    const target = g.sesi_pertama_capai_target
      ? `target ${fmt(g.target_sudut)}° tercapai sejak sesi ke-${g.sesi_pertama_capai_target}`
      : `target ${fmt(g.target_sudut)}° belum tercapai`;
    poin.push(`${g.nama}: jangkauan ${fmt(g.puncak_awal!)}° → ${fmt(g.puncak_akhir!)}° (${arah}); ${target}.`);
  }

  const kompen = input.gerakan.find((g) => g.persen_kompensasi_awal != null && g.persen_kompensasi_akhir != null);
  if (kompen && poin.length < 3) {
    poin.push(
      `Gerakan dengan postur tidak tegak pada ${kompen.nama.toLowerCase()}: ${fmt(kompen.persen_kompensasi_awal!)}% → ${fmt(kompen.persen_kompensasi_akhir!)}% repetisi.`,
    );
  }

  const nyeri = kalimatNyeri(input);
  if (nyeri) poin.push(nyeri);
  else if (poin.length < 4) {
    poin.push(`Kehadiran latihan: ${input.sesi_dilakukan} dari ${input.sesi_direncanakan} sesi dalam ${input.periode_hari} hari.`);
  }

  if (!poin.length) poin.push("Belum ada data latihan pada periode ini.");

  const alasan = alasanPerhatian(input);
  return { poin: poin.slice(0, 4), perlu_perhatian: alasan.length > 0, alasan_perhatian: alasan.join(", ") };
}
