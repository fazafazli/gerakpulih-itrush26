import { NextResponse, type NextRequest } from "next/server";
import { apakahBotPratinjau, deteksiPeramban, htmlPratinjau } from "@/lib/pasien/peramban";
import { nilaiCookiePasien, opsiCookiePasien } from "@/lib/pasien/sesi";
import { COOKIE_PASIEN, hashToken, POLA_TOKEN } from "@/lib/pasien/token";
import { createAdminClient } from "@/lib/supabase/admin";

const tanpaJejak = (res: NextResponse) => {
  res.headers.set("Referrer-Policy", "no-referrer"); // token di URL tidak bocor lewat header Referer
  res.headers.set("Cache-Control", "no-store");
  return res;
};

/**
 * GET /mulai/<token> — link yang dikirim terapis lewat WhatsApp.
 * - Bot pratinjau (WhatsApp, Facebook, Telegram, …) → halaman og generik. Diperiksa SEBELUM token:
 *   tanpa query database, tanpa cookie, tanpa memperbarui terakhir_aktif.
 * - Token valid → cookie pasien. Browser dalam aplikasi → halaman "Buka di Chrome"; selain itu → /beranda.
 * - Token tidak dikenal → halaman penjelasan.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ kode: string }> }) {
  const ua = request.headers.get("user-agent");
  if (apakahBotPratinjau(ua)) {
    return new NextResponse(htmlPratinjau(), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
      },
    });
  }

  const { kode } = await params;
  const gagal = tanpaJejak(NextResponse.redirect(new URL("/akses-tidak-valid", request.url)));
  if (!POLA_TOKEN.test(kode)) return gagal;

  const admin = createAdminClient();
  const { data: pasien } = await admin.from("pasien").select("id, aktif").eq("token_hash", hashToken(kode)).maybeSingle();
  if (!pasien || !pasien.aktif) return gagal;

  await admin.from("pasien").update({ terakhir_aktif: new Date().toISOString() }).eq("id", pasien.id);

  // Cookie tetap disetel di browser dalam aplikasi agar "Lanjut di sini saja" berfungsi.
  const tujuan = deteksiPeramban(ua).aplikasi ? `/mulai/${encodeURIComponent(kode)}/buka-browser` : "/beranda";
  const res = NextResponse.redirect(new URL(tujuan, request.url));
  res.cookies.set(COOKIE_PASIEN, nilaiCookiePasien(pasien.id), opsiCookiePasien);
  return tanpaJejak(res);
}
