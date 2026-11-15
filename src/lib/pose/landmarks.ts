/** Satu titik dari MediaPipe Pose. x,y ternormalisasi 0–1 (landmark) atau meter (world landmark). */
export type Landmark = { x: number; y: number; z: number; visibility?: number };
export type Titik = readonly [number, number, number];

/** Sisi tubuh PASIEN (bukan sisi layar). */
export type Sisi = "kiri" | "kanan";

export const LM = {
  HIDUNG: 0,
  TELINGA_KIRI: 7,
  TELINGA_KANAN: 8,
  BAHU_KIRI: 11,
  BAHU_KANAN: 12,
  SIKU_KIRI: 13,
  SIKU_KANAN: 14,
  PERGELANGAN_KIRI: 15,
  PERGELANGAN_KANAN: 16,
  PINGGUL_KIRI: 23,
  PINGGUL_KANAN: 24,
} as const;

export const JUMLAH_LANDMARK = 33;

export type SendiSisi = { bahu: number; siku: number; pergelangan: number; pinggul: number; telinga: number };

export function sendiSisi(sisi: Sisi): SendiSisi {
  return sisi === "kiri"
    ? { bahu: LM.BAHU_KIRI, siku: LM.SIKU_KIRI, pergelangan: LM.PERGELANGAN_KIRI, pinggul: LM.PINGGUL_KIRI, telinga: LM.TELINGA_KIRI }
    : { bahu: LM.BAHU_KANAN, siku: LM.SIKU_KANAN, pergelangan: LM.PERGELANGAN_KANAN, pinggul: LM.PINGGUL_KANAN, telinga: LM.TELINGA_KANAN };
}

/** Keyakinan deteksi satu titik (0–1). Titik yang tidak ada dianggap 0. */
export const keyakinan = (l: Landmark | undefined): number => l?.visibility ?? 0;

/** Keyakinan terendah dari beberapa titik. */
export const keyakinanMin = (lm: readonly Landmark[], indeks: readonly number[]): number =>
  indeks.length ? Math.min(...indeks.map((i) => keyakinan(lm[i]))) : 0;
