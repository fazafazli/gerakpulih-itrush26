import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { buatTokenPasien, hashToken } from "@/lib/pasien/token";
import { pilihOrigin } from "@/lib/situs";
import { tautanPasien } from "./olah";

/**
 * QR dikirim sebagai gambar data-URL, yang tidak bisa membaca CSS variable.
 * Nilainya sama dengan token --foreground dan --card di globals.css (kontras tinggi agar mudah dipindai).
 */
const WARNA_QR = { dark: "#173b3a", light: "#ffffff" } as const;

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
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: WARNA_QR,
  });
  return { url, qr: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
}
