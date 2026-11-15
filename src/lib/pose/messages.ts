import type { AlasanKompensasi } from "./compensation";
import type { KejadianRepetisi } from "./rep-counter";

const ANGKA = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];

/** Angka yang mudah diucapkan mesin suara (1–10 sebagai kata). */
export const ucapkanAngka = (n: number): string => ANGKA[n] ?? String(n);

const PESAN_KOMPENSASI: Record<AlasanKompensasi, string> = {
  badan_miring: "Badan tetap tegak ya",
  bahu_miring: "Bahu tetap sejajar ya",
  bahu_terangkat: "Bahu jangan ikut terangkat",
};

export const pesanKompensasi = (alasan: readonly AlasanKompensasi[]): string =>
  alasan.length ? PESAN_KOMPENSASI[alasan[0]] : "";

/** Kalimat suara setelah satu repetisi selesai. Positif, singkat, satu pesan. */
export function suaraRepetisi(r: KejadianRepetisi, alasanKompensasi: readonly AlasanKompensasi[], adaTarget: boolean): string {
  const angka = ucapkanAngka(r.nomor);
  if (r.kompensasi && alasanKompensasi.length) return `${angka}. ${pesanKompensasi(alasanKompensasi)}`;
  if (adaTarget && !r.capaiTarget) return `${angka}. Sedikit lebih tinggi`;
  return angka;
}
