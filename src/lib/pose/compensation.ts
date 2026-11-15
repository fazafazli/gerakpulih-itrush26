import { kePiksel, kemiringanHorizontal, sudutDariVertikal, titikTengah } from "./geometry";
import { keyakinan, LM, sendiSisi, type Landmark, type Sisi } from "./landmarks";
import { AMBANG_KEYAKINAN } from "./metrics";

/** Postur pada satu frame. NaN = tidak terukur. */
export type Postur = {
  /** Kemiringan badan (garis pinggul-bahu) dari vertikal. */
  badan: number;
  /** Kemiringan garis bahu dari horizontal. */
  bahu: number;
  /** Jarak telinga ke bahu. Turun = bahu terangkat. */
  rasioShrug: number;
};

export function ukurPostur(lm: readonly Landmark[], sisi: Sisi, lebar: number, tinggi: number): Postur {
  const p = kePiksel(lm, lebar, tinggi);
  const s = sendiSisi(sisi);
  const lebarBahu = Math.hypot(p[LM.BAHU_KIRI][0] - p[LM.BAHU_KANAN][0], p[LM.BAHU_KIRI][1] - p[LM.BAHU_KANAN][1]) || 1;

  const pinggulTerlihat = Math.min(keyakinan(lm[LM.PINGGUL_KIRI]), keyakinan(lm[LM.PINGGUL_KANAN])) >= AMBANG_KEYAKINAN;
  const badan = pinggulTerlihat
    ? sudutDariVertikal(titikTengah(p[LM.PINGGUL_KIRI], p[LM.PINGGUL_KANAN]), titikTengah(p[LM.BAHU_KIRI], p[LM.BAHU_KANAN]))
    : Number.NaN;

  const telingaTerlihat = keyakinan(lm[s.telinga]) >= AMBANG_KEYAKINAN;
  const rasioShrug = telingaTerlihat ? (p[s.bahu][1] - p[s.telinga][1]) / lebarBahu : Number.NaN;

  return { badan, bahu: kemiringanHorizontal(p[LM.BAHU_KIRI], p[LM.BAHU_KANAN]), rasioShrug };
}

export type AmbangKompensasi = {
  badanDerajat: number;
  bahuDerajat: number;
  shrugPersen: number;
  bertahanMs: number;
};

export const AMBANG_KOMPENSASI_DEFAULT: AmbangKompensasi = {
  badanDerajat: 8,
  bahuDerajat: 8,
  shrugPersen: 25,
  bertahanMs: 300,
};

export type AlasanKompensasi = "badan_miring" | "bahu_miring" | "bahu_terangkat";

export type DeltaPostur = { badan: number; bahu: number; shrugPersen: number };

export function nilaiKompensasi(args: {
  postur: Postur;
  acuan: Postur | null;
  ambang?: AmbangKompensasi;
  periksaShrug: boolean;
  sedangNaik: boolean;
  sejak: number | null;
  t: number;
}): { aktif: boolean; alasan: AlasanKompensasi[]; delta: DeltaPostur; sejak: number | null } {
  const { postur, acuan, periksaShrug, sedangNaik, sejak, t } = args;
  const ambang = args.ambang ?? AMBANG_KOMPENSASI_DEFAULT;
  const dasar = (x: number | undefined) => (x == null || Number.isNaN(x) ? 0 : x);

  const delta: DeltaPostur = {
    badan: Number.isNaN(postur.badan) ? Number.NaN : Math.abs(postur.badan - dasar(acuan?.badan)),
    bahu: Math.abs(postur.bahu - dasar(acuan?.bahu)),
    shrugPersen:
      periksaShrug && acuan && acuan.rasioShrug > 0 && !Number.isNaN(postur.rasioShrug)
        ? ((acuan.rasioShrug - postur.rasioShrug) / acuan.rasioShrug) * 100
        : Number.NaN,
  };

  const alasan: AlasanKompensasi[] = [];
  if (delta.badan > ambang.badanDerajat) alasan.push("badan_miring");
  if (delta.bahu > ambang.bahuDerajat) alasan.push("bahu_miring");
  if (delta.shrugPersen > ambang.shrugPersen) alasan.push("bahu_terangkat");

  const kandidat = sedangNaik && alasan.length > 0;
  const sejakBaru = kandidat ? (sejak ?? t) : null;
  const aktif = sejakBaru != null && t - sejakBaru >= ambang.bertahanMs;
  return { aktif, alasan: aktif ? alasan : [], delta, sejak: sejakBaru };
}
