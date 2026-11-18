import "server-only";
import QRCode from "qrcode";

/**
 * QR dikirim sebagai gambar data-URL, yang tidak bisa membaca CSS variable.
 * Nilainya sama dengan token --foreground dan --card di globals.css (kontras tinggi agar mudah dipindai).
 */
const WARNA_QR = { dark: "#173b3a", light: "#ffffff" } as const;

/** QR SVG sebagai data-URL, dirender di server sehingga tidak menambah JS di browser. */
export async function qrDataUrl(url: string): Promise<string> {
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: WARNA_QR });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
