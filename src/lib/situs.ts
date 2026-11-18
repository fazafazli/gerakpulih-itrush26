/**
 * Alamat situs untuk link yang dibagikan (link pasien, QR, WhatsApp).
 * APP_URL (server-only) diutamakan agar link yang dibuat dari localhost/preview tetap menunjuk domain produksi.
 * Bila kosong atau tidak valid, kembali ke origin permintaan.
 */
export function pilihOrigin(args: {
  appUrl?: string | null;
  origin?: string | null;
  host?: string | null;
  proto?: string | null;
}): string {
  const dariEnv = originValid(args.appUrl);
  if (dariEnv) return dariEnv;
  const dariHeader = originValid(args.origin);
  if (dariHeader) return dariHeader;
  const host = args.host && /^[a-z0-9.-]+(:\d+)?$/i.test(args.host) ? args.host : "localhost:3000";
  const proto = args.proto === "http" || args.proto === "https" ? args.proto : host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** "https://contoh.app/" → "https://contoh.app"; selain http(s) atau bila memuat path → null. */
function originValid(nilai: string | null | undefined): string | null {
  if (!nilai) return null;
  try {
    const u = new URL(nilai.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (u.pathname !== "/" || u.search || u.hash || u.username) return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Alamat publik untuk konten statis (landing, QR demo, metadata). Dihitung saat build, tanpa request:
 * APP_URL, lalu domain produksi Vercel (env sistem VERCEL_PROJECT_PRODUCTION_URL, tanpa skema), atau null.
 */
export function originPublik(env: Record<string, string | undefined> = process.env): string | null {
  return originValid(env.APP_URL) ?? originValid(env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : null);
}
