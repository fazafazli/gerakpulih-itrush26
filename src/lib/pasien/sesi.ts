import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Sisi } from "@/lib/pose/landmarks";
import { createAdminClient } from "@/lib/supabase/admin";
import { COOKIE_PASIEN, tandatanganiSesi, UMUR_SESI_PASIEN_DETIK, verifikasiSesi } from "./token";

const rahasia = () => process.env.PASIEN_TOKEN_SECRET ?? "";

export const opsiCookiePasien = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: UMUR_SESI_PASIEN_DETIK,
};

export function nilaiCookiePasien(pasienId: string): string {
  return tandatanganiSesi({ pid: pasienId, exp: Math.floor(Date.now() / 1000) + UMUR_SESI_PASIEN_DETIK }, rahasia());
}

export type PasienSaatIni = {
  id: string;
  nama_tampilan: string;
  sisi_dilatih: Sisi;
  is_demo: boolean;
};

export const getPasienSaatIni = cache(async (): Promise<PasienSaatIni | null> => {
  const isi = verifikasiSesi((await cookies()).get(COOKIE_PASIEN)?.value, rahasia());
  if (!isi) return null;
  const { data } = await createAdminClient()
    .from("pasien")
    .select("id, nama_tampilan, sisi_dilatih, is_demo, aktif")
    .eq("id", isi.pid)
    .maybeSingle();
  if (!data || !data.aktif) return null;
  return {
    id: data.id,
    nama_tampilan: data.nama_tampilan,
    sisi_dilatih: data.sisi_dilatih === "kiri" ? "kiri" : "kanan",
    is_demo: data.is_demo,
  };
});

export async function wajibPasien(): Promise<PasienSaatIni> {
  const pasien = await getPasienSaatIni();
  if (!pasien) redirect("/akses-tidak-valid");
  return pasien;
}
