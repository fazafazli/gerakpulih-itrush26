import type { Landmark, Titik } from "./landmarks";

const KE_DERAJAT = 180 / Math.PI;

export function sudut3(a: Titik, b: Titik, c: Titik): number {
  const v1 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const v2 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const n = Math.hypot(v1[0], v1[1], v1[2]) * Math.hypot(v2[0], v2[1], v2[2]);
  if (!n) return Number.NaN;
  const cos = (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / n;
  return Math.acos(Math.min(1, Math.max(-1, cos))) * KE_DERAJAT;
}

export function sudutDariVertikal(dari: Titik, ke: Titik): number {
  return Math.atan2(ke[0] - dari[0], -(ke[1] - dari[1])) * KE_DERAJAT;
}

export function kemiringanHorizontal(a: Titik, b: Titik): number {
  let s = Math.atan2(a[1] - b[1], a[0] - b[0]) * KE_DERAJAT;
  if (s > 90) s -= 180;
  if (s < -90) s += 180;
  return s;
}

export function kePiksel(lm: readonly Landmark[], lebar: number, tinggi: number): Titik[] {
  return lm.map((p) => [p.x * lebar, p.y * tinggi, 0] as const);
}

/** World landmark (meter, 3D) → titik. */
export function keDunia(lm: readonly Landmark[]): Titik[] {
  return lm.map((p) => [p.x, p.y, p.z] as const);
}

export const titikTengah = (a: Titik, b: Titik): Titik => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

/** Median */
export function median(nilai: readonly number[]): number {
  const s = nilai.filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  if (!s.length) return Number.NaN;
  const t = Math.floor(s.length / 2);
  return s.length % 2 ? s[t] : (s[t - 1] + s[t]) / 2;
}

/** Penghalusan eksponensial */
export function haluskan(sebelum: number | null, nilai: number, alpha: number): number {
  if (sebelum == null || Number.isNaN(sebelum)) return nilai;
  if (Number.isNaN(nilai)) return sebelum;
  const a = Math.min(1, Math.max(0.05, alpha));
  return sebelum * (1 - a) + nilai * a;
}
