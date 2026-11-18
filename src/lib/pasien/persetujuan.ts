/**
 * Persetujuan privasi pasien. Disimpan di dua tempat:
 * - cookie per perangkat (`gp_setuju`), karena video diproses di perangkat itu;
 * - kolom pasien.persetujuan_pada/_versi sebagai bukti untuk terapis (UU PDP: data kesehatan = data spesifik).
 * Naikkan VERSI_PERSETUJUAN bila isi halaman privasi berubah agar pasien diminta setuju ulang.
 */
export const VERSI_PERSETUJUAN = "v1";
export const COOKIE_PERSETUJUAN = "gp_setuju";
export const UMUR_PERSETUJUAN_DETIK = 60 * 60 * 24 * 365;

const nomorVersi = (v: string | null | undefined): number => {
  const m = /^v(\d+)$/.exec(v ?? "");
  return m ? Number(m[1]) : 0;
};

/** Cookie perangkat menyatakan setuju pada versi yang berlaku (atau lebih baru). */
export const sudahSetuju = (nilaiCookie: string | null | undefined): boolean =>
  nomorVersi(nilaiCookie) >= nomorVersi(VERSI_PERSETUJUAN);

/** Catatan database perlu diisi bila kosong atau versinya lebih lama. Persetujuan pertama tidak ditimpa. */
export const perluCatatPersetujuan = (versiDb: string | null | undefined): boolean =>
  nomorVersi(versiDb) < nomorVersi(VERSI_PERSETUJUAN);

/** Tujuan setelah setuju: hanya halaman pasien yang dikenal (mencegah open redirect). */
export function tujuanSetelahSetuju(lanjut: string | null | undefined): "/sesi" | "/beranda" {
  return lanjut === "/sesi" ? "/sesi" : "/beranda";
}
