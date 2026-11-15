import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_PASIEN } from "@/lib/pasien/token";

const RUTE_TERAPIS = ["/dashboard", "/pasien"];
const RUTE_PASIEN = ["/beranda", "/privasi", "/sesi", "/selesai"];
const cocok = (path: string, daftar: string[]) => daftar.some((p) => path === p || path.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (cocok(pathname, RUTE_PASIEN)) {
    if (!request.cookies.has(COOKIE_PASIEN)) return NextResponse.redirect(new URL("/akses-tidak-valid", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims memverifikasi JWT & memperbarui sesi bila perlu
  const { data } = await supabase.auth.getClaims();
  const sudahMasuk = Boolean(data?.claims?.sub);

  if (cocok(pathname, RUTE_TERAPIS) && !sudahMasuk) {
    const tujuan = new URL("/masuk", request.url);
    tujuan.searchParams.set("lanjut", pathname);
    return NextResponse.redirect(tujuan);
  }
  if (pathname === "/masuk" && sudahMasuk) return NextResponse.redirect(new URL("/dashboard", request.url));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/keepalive|mulai/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)"],
};
