import { tanggalWib } from "@/lib/terapis/olah";

export type HariMinggu = { tanggal: string; ada: boolean };
export type RingkasanMinggu = { jumlah: number; hariIni: boolean; hari: HariMinggu[] };

/** Ringkasan 7 hari terakhir (hari ini paling kanan) untuk beranda pasien. Tanggal menurut WIB. */
export function ringkasMingguIni(mulai: readonly string[], sekarang: Date): RingkasanMinggu {
  const hariIni = Date.parse(tanggalWib(sekarang));
  const hari: HariMinggu[] = Array.from({ length: 7 }, (_, i) => ({
    tanggal: new Date(hariIni - (6 - i) * 86_400_000).toISOString().slice(0, 10),
    ada: false,
  }));
  const indeks = new Map(hari.map((h, i) => [h.tanggal, i]));
  let jumlah = 0;
  for (const m of mulai) {
    const i = indeks.get(tanggalWib(m));
    if (i == null) continue;
    hari[i].ada = true;
    jumlah += 1;
  }
  return { jumlah, hariIni: hari[6].ada, hari };
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** "Sen", "Sel", … dari "YYYY-MM-DD". */
export const namaHariPendek = (tanggal: string): string => HARI[new Date(`${tanggal}T00:00:00Z`).getUTCDay()];
