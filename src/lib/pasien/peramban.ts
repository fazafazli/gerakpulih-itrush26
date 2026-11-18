/**
 * Deteksi peramban dari user-agent. Murni (tanpa request/DOM) agar mudah diuji.
 * Dipakai di /mulai (bot pratinjau & browser dalam aplikasi) dan layar pasien (peringatan kamera).
 */

/**
 * Pengambil pratinjau link (WhatsApp, Facebook, Telegram, dll). Mereka membuka link saat terapis MENGIRIM
 * pesan, jadi tidak boleh dianggap pasien: tanpa cookie dan tanpa memperbarui terakhir_aktif.
 * WhatsApp: pengambil pratinjau ber-UA "WhatsApp/x.y", sedangkan webview-nya diawali "Mozilla/".
 */
const POLA_BOT =
  /^WhatsApp\/|facebookexternalhit|Facebot|TelegramBot|Slackbot|Twitterbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterest|redditbot|Embedly|Applebot|Googlebot|bingbot|vkShare|Iframely|Mastodon|Bluesky/i;

export function apakahBotPratinjau(ua: string | null | undefined): boolean {
  return Boolean(ua && POLA_BOT.test(ua));
}

export type AplikasiDalam = "WhatsApp" | "Instagram" | "Facebook" | "LINE" | "TikTok";
export type SistemOperasi = "android" | "ios" | "lain";
export type InfoPeramban = { aplikasi: AplikasiDalam | null; os: SistemOperasi };

/** Urutan penting: Instagram juga memuat "FBAV" di sebagian versi. */
const POLA_APLIKASI: readonly [AplikasiDalam, RegExp][] = [
  ["Instagram", /Instagram/i],
  ["Facebook", /FBAN|FBAV|FB_IAB|FBIOS|FB4A/],
  ["LINE", /\bLine\//],
  ["TikTok", /musical_ly|BytedanceWebview|TikTok|trill_/i],
  ["WhatsApp", /WhatsApp/i],
];

/** Browser bawaan aplikasi chat/sosial: kamera & suara sering tidak berfungsi di sini. */
export function deteksiPeramban(ua: string | null | undefined): InfoPeramban {
  const teks = ua ?? "";
  const os: SistemOperasi = /Android/i.test(teks) ? "android" : /iPhone|iPad|iPod/i.test(teks) ? "ios" : "lain";
  if (!teks.startsWith("Mozilla/") || apakahBotPratinjau(teks)) return { aplikasi: null, os };
  const cocok = POLA_APLIKASI.find(([, pola]) => pola.test(teks));
  return { aplikasi: cocok?.[0] ?? null, os };
}

/** Tautan Android yang membuka URL langsung di Chrome; bila Chrome tidak ada, kembali ke URL biasa. */
export function tautanIntentChrome(url: string): string {
  const u = new URL(url);
  const tanpaSkema = `${u.host}${u.pathname}${u.search}`;
  return `intent://${tanpaSkema}#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

/** Halaman untuk bot pratinjau. Sengaja tanpa parameter: tidak mungkin memuat nama pasien atau token. */
export function htmlPratinjau(): string {
  const judul = "Link latihan GerakPulih";
  const deskripsi = "Latihan lengan di rumah, dipandu kamera HP. Video tidak pernah meninggalkan HP. Buka di HP untuk mulai.";
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${judul}</title>
<meta name="description" content="${deskripsi}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GerakPulih">
<meta property="og:title" content="${judul}">
<meta property="og:description" content="${deskripsi}">
<meta name="twitter:card" content="summary">
</head>
<body><h1>${judul}</h1><p>${deskripsi}</p></body>
</html>`;
}

/** iPhone memakai Safari (kamera berfungsi); selain itu Chrome. */
export const namaBrowserDisarankan = (os: SistemOperasi): "Safari" | "Chrome" => (os === "ios" ? "Safari" : "Chrome");

/** Langkah singkat keluar dari browser dalam aplikasi, sesuai OS. Kalimat pendek untuk lansia/pendamping. */
export function langkahBukaBrowser(info: InfoPeramban): string[] {
  const browser = namaBrowserDisarankan(info.os);
  const menu = info.os === "ios" ? "titik tiga (•••) atau ikon kompas" : "titik tiga (⋮)";
  return [
    `Ketuk tombol ${menu} di pojok layar ${info.aplikasi ?? "aplikasi ini"}.`,
    `Pilih “Buka di ${browser}” atau “Buka di browser”.`,
    `Latihan akan terbuka di ${browser}. Izinkan kamera bila diminta.`,
  ];
}
