import { NextResponse, type NextRequest } from "next/server";
import { nilaiCookiePasien, opsiCookiePasien } from "@/lib/pasien/sesi";
import { COOKIE_PASIEN, hashToken, POLA_TOKEN } from "@/lib/pasien/token";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /mulai/<token> — link yang dikirim terapis lewat WhatsApp.
 * Token valid → cookie pasien + arahkan ke /beranda. Token tidak dikenal → halaman penjelasan.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const gagal = NextResponse.redirect(new URL("/akses-tidak-valid", request.url));
  if (!POLA_TOKEN.test(kode)) return gagal;

  const admin = createAdminClient();
  const { data: pasien } = await admin.from("pasien").select("id, aktif").eq("token_hash", hashToken(kode)).maybeSingle();
  if (!pasien || !pasien.aktif) return gagal;

  await admin.from("pasien").update({ terakhir_aktif: new Date().toISOString() }).eq("id", pasien.id);

  const res = NextResponse.redirect(new URL("/beranda", request.url));
  res.cookies.set(COOKIE_PASIEN, nilaiCookiePasien(pasien.id), opsiCookiePasien);
  res.headers.set("Referrer-Policy", "no-referrer"); // token di URL tidak bocor lewat header Referer
  res.headers.set("Cache-Control", "no-store");
  return res;
}
