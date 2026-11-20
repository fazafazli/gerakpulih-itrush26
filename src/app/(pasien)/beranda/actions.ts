"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_PASIEN } from "@/lib/pasien/token";

/**
 * Keluar dari akun pasien demo (dipakai juri untuk mencoba ulang dari landing).
 * Hanya menghapus cookie di perangkat ini; pasien sungguhan bisa masuk lagi lewat link dari terapis.
 */
export async function keluarPasien(): Promise<void> {
  (await cookies()).delete(COOKIE_PASIEN);
  redirect("/");
}
