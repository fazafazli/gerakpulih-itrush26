import type { Postur } from "./compensation";
import { median } from "./geometry";

export type Baseline = Postur & { nilai: number };

export type Kalibrasi = {
  mulai: number;
  selesaiPada: number;
  sampel: Baseline[];
};

export const DURASI_KALIBRASI_MS = 3000;
const SAMPEL_MINIMAL = 10;

export function mulaiKalibrasi(t: number, durasiMs = DURASI_KALIBRASI_MS): Kalibrasi {
  return { mulai: t, selesaiPada: t + durasiMs, sampel: [] };
}

export function tambahSampelKalibrasi(k: Kalibrasi, sampel: Baseline): Kalibrasi {
  return { ...k, sampel: [...k.sampel, sampel] };
}

export const kalibrasiSelesai = (k: Kalibrasi, t: number): boolean => t >= k.selesaiPada;
export const sisaKalibrasiMs = (k: Kalibrasi, t: number): number => Math.max(0, k.selesaiPada - t);

/** Median tiap komponen. null bila sampel terlalu sedikit (orang tak terdeteksi selama kalibrasi). */
export function hitungBaseline(k: Kalibrasi): Baseline | null {
  const nilai = k.sampel.map((s) => s.nilai).filter((x) => !Number.isNaN(x));
  if (nilai.length < SAMPEL_MINIMAL) return null;
  return {
    nilai: median(nilai),
    badan: median(k.sampel.map((s) => s.badan)),
    bahu: median(k.sampel.map((s) => s.bahu)),
    rasioShrug: median(k.sampel.map((s) => s.rasioShrug)),
  };
}
