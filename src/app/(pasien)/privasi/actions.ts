"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { wajibPasien } from "@/lib/pasien/sesi";
import {
  COOKIE_PERSETUJUAN,
  perluCatatPersetujuan,
  tujuanSetelahSetuju,
  UMUR_PERSETUJUAN_DETIK,
  VERSI_PERSETUJUAN,
} from "@/lib/pasien/persetujuan";
import { createAdminClient } from "@/lib/supabase/admin";

export type StatusSetuju = { pesan: string | null };

/**
 * "Saya mengerti dan setuju". pasien_id dari cookie bertanda tangan (wajibPasien), bukan dari form.
 * Bukti persetujuan dicatat di database hanya bila kosong atau versinya lama (persetujuan pertama tidak ditimpa).
 * Bila pencatatan gagal, cookie TIDAK disetel: persetujuan tanpa bukti tidak dianggap sah.
 */
export async function setujui(_s: StatusSetuju, fd: FormData): Promise<StatusSetuju> {
  const pasien = await wajibPasien();
  const db = createAdminClient();

  const { data, error } = await db.from("pasien").select("persetujuan_versi").eq("id", pasien.id).maybeSingle();
  if (error || !data) {
    console.error(`[privasi] baca persetujuan: ${error?.code ?? "tidak ada"} ${error?.message ?? ""}`);
    return { pesan: "Belum bisa menyimpan. Periksa internet, lalu ketuk lagi." };
  }

  if (perluCatatPersetujuan(data.persetujuan_versi)) {
    const { error: galat } = await db
      .from("pasien")
      .update({ persetujuan_pada: new Date().toISOString(), persetujuan_versi: VERSI_PERSETUJUAN })
      .eq("id", pasien.id);
    if (galat) {
      console.error(`[privasi] simpan persetujuan: ${galat.code} ${galat.message}`);
      return { pesan: "Belum bisa menyimpan. Periksa internet, lalu ketuk lagi." };
    }
  }

  (await cookies()).set(COOKIE_PERSETUJUAN, VERSI_PERSETUJUAN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UMUR_PERSETUJUAN_DETIK,
  });
  redirect(tujuanSetelahSetuju(String(fd.get("lanjut") ?? "")));
}
