import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Akses pasien TANPA akun:
 *  - Terapis membuat link /mulai/<token>. Token acak 24 byte; database hanya menyimpan sha256-nya.
 *  - Saat link dibuka, server memberi cookie bertanda tangan HMAC berisi id pasien + masa berlaku.
 * Fungsi di file ini murni (tanpa Next.js) agar mudah diuji.
 */

export const COOKIE_PASIEN = "gp_pasien";
export const UMUR_SESI_PASIEN_DETIK = 60 * 60 * 24 * 90; // 90 hari: pasien latihan rutin, tak perlu buka link tiap hari

/** Format token yang diterima di URL (base64url). */
export const POLA_TOKEN = /^[A-Za-z0-9_-]{8,128}$/;

export const buatTokenPasien = (): string => randomBytes(24).toString("base64url");

/** Sama dengan `encode(sha256(token::bytea), 'hex')` di seed.sql. */
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export type IsiSesiPasien = { pid: string; exp: number };

function cekRahasia(rahasia: string): void {
  if (!rahasia || rahasia.length < 32) throw new Error("PASIEN_TOKEN_SECRET belum diisi atau terlalu pendek (min. 32 karakter)");
}

const tandaTangan = (data: string, rahasia: string) => createHmac("sha256", rahasia).update(data).digest();

export function tandatanganiSesi(isi: IsiSesiPasien, rahasia: string): string {
  cekRahasia(rahasia);
  const data = Buffer.from(JSON.stringify(isi)).toString("base64url");
  return `${data}.${tandaTangan(data, rahasia).toString("base64url")}`;
}

/** null bila kosong, dipalsukan, rusak, atau kedaluwarsa. */
export function verifikasiSesi(nilai: string | undefined, rahasia: string, sekarangDetik = Math.floor(Date.now() / 1000)): IsiSesiPasien | null {
  cekRahasia(rahasia);
  if (!nilai) return null;
  const bagian = nilai.split(".");
  if (bagian.length !== 2) return null;
  const [data, ttd] = bagian;

  const harapan = tandaTangan(data, rahasia);
  const diterima = Buffer.from(ttd, "base64url");
  if (diterima.length !== harapan.length || !timingSafeEqual(diterima, harapan)) return null;

  try {
    const isi: unknown = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!isi || typeof isi !== "object") return null;
    const { pid, exp } = isi as Record<string, unknown>;
    if (typeof pid !== "string" || typeof exp !== "number" || exp < sekarangDetik) return null;
    return { pid, exp };
  } catch {
    return null;
  }
}
