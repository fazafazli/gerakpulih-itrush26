import "server-only";
import { headers } from "next/headers";
import { buatTokenPasien, hashToken } from "@/lib/pasien/token";
import { qrDataUrl } from "@/lib/qr";
import { pilihOrigin } from "@/lib/situs";
import { tautanPasien } from "./olah";

export type LinkBaru = { url: string; qr: string };

/** Token acak baru: yang asli hanya dikembalikan ke terapis sekali, database menyimpan hash-nya. */
export function tokenBaru() {
  const token = buatTokenPasien();
  return { token, hash: hashToken(token) };
}

/** Origin situs: APP_URL bila diisi, selain itu dari permintaan Server Action. */
export async function originSitus(): Promise<string> {
  const h = await headers();
  return pilihOrigin({
    appUrl: process.env.APP_URL,
    origin: h.get("origin"),
    host: h.get("x-forwarded-host") ?? h.get("host"),
    proto: h.get("x-forwarded-proto"),
  });
}

/** URL link pasien + QR (data URL SVG, dirender di server sehingga tidak menambah JS di browser). */
export async function linkUntuk(token: string): Promise<LinkBaru> {
  const url = tautanPasien(await originSitus(), token);
  return { url, qr: await qrDataUrl(url) };
}
