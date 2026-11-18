"use server";

import { refresh } from "next/cache";
import { wajibTerapis } from "@/lib/auth/terapis";
import { GERAKAN } from "@/lib/pose/exercises";
import { createClient } from "@/lib/supabase/server";
import { catatGalat } from "@/lib/terapis/galat";
import { type LinkBaru, linkUntuk, tokenBaru } from "@/lib/terapis/link";
import {
  dariFormPasienBaru,
  dariFormProgram,
  IdSchema,
  PasienBaruSchema,
  pesanGalatDb,
  pesanPertama,
  ProgramSchema,
  StatusLinkSchema,
} from "@/lib/terapis/schema";

/**
 * Semua aksi: wajibTerapis() → validasi Zod → tulis lewat klien RLS (bukan admin).
 * terapis_id selalu dari sesi login, tidak pernah dari form.
 */

export type StatusAksi = { status: "awal" } | { status: "galat"; pesan: string } | { status: "ok"; pesan: string };
export type StatusLink =
  | { status: "awal" }
  | { status: "galat"; pesan: string }
  | ({ status: "ok"; pasienId: string; nama: string } & LinkBaru);

const galat = (pesan: string) => ({ status: "galat" as const, pesan });

/** Galat database: dicatat di log server, pengguna hanya melihat pesan ramah. */
function galatDb(konteks: string, e: { code?: string; message?: string } | null) {
  catatGalat(konteks, e);
  return galat(pesanGalatDb(e));
}

export async function tambahPasien(_s: StatusLink, fd: FormData): Promise<StatusLink> {
  const terapis = await wajibTerapis();
  const data = PasienBaruSchema.safeParse(dariFormPasienBaru(fd));
  if (!data.success) return galat(pesanPertama(data.error));

  const supabase = await createClient();
  const { token, hash } = tokenBaru();
  const { data: pasien, error } = await supabase
    .from("pasien")
    .insert({
      terapis_id: terapis.id,
      nama_tampilan: data.data.nama_tampilan,
      sisi_dilatih: data.data.sisi_dilatih,
      catatan: data.data.catatan,
      token_hash: hash,
    })
    .select("id")
    .single();
  if (error || !pasien) return galatDb("tambahPasien", error);

  // Program awal memakai target & repetisi bawaan; terapis bisa mengubahnya setelah ini.
  const { error: galatProgram } = await supabase.from("program_gerakan").insert(
    data.data.gerakan.map((kode, i) => ({
      pasien_id: pasien.id,
      kode_gerakan: kode,
      target_sudut: GERAKAN[kode].targetDefault,
      repetisi: GERAKAN[kode].repetisiDefault,
      urutan: i + 1,
    })),
  );
  if (galatProgram) {
    // Tanpa transaksi di PostgREST: hapus pasien agar tidak ada pasien tanpa program.
    const { error: galatHapus } = await supabase.from("pasien").delete().eq("id", pasien.id);
    catatGalat("tambahPasien.rollback", galatHapus);
    return galatDb("tambahPasien.program", galatProgram);
  }

  return { status: "ok", pasienId: pasien.id, nama: data.data.nama_tampilan, ...(await linkUntuk(token)) };
}

export async function buatLinkBaru(_s: StatusLink, fd: FormData): Promise<StatusLink> {
  await wajibTerapis();
  const id = IdSchema.safeParse(fd.get("pasien_id"));
  if (!id.success) return galat("Pasien tidak ditemukan.");

  const supabase = await createClient();
  const { token, hash } = tokenBaru();
  const { data, error } = await supabase
    .from("pasien")
    .update({ token_hash: hash })
    .eq("id", id.data)
    .select("id, nama_tampilan")
    .maybeSingle();
  if (error) return galatDb("buatLinkBaru", error);
  if (!data) return galat("Pasien tidak ditemukan.");

  return { status: "ok", pasienId: data.id, nama: data.nama_tampilan, ...(await linkUntuk(token)) };
}

export async function ubahStatusLink(_s: StatusAksi, fd: FormData): Promise<StatusAksi> {
  await wajibTerapis();
  const input = StatusLinkSchema.safeParse({ pasien_id: fd.get("pasien_id"), aktif: fd.get("aktif") });
  if (!input.success) return galat("Permintaan tidak valid. Muat ulang halaman lalu coba lagi.");
  const { pasien_id, aktif } = input.data;

  const supabase = await createClient();
  const { data, error } = await supabase.from("pasien").update({ aktif }).eq("id", pasien_id).select("id").maybeSingle();
  if (error) return galatDb("ubahStatusLink", error);
  if (!data) return galat("Pasien tidak ditemukan.");

  refresh();
  return { status: "ok", pesan: aktif ? "Link diaktifkan kembali." : "Link dinonaktifkan. Pasien tidak bisa membuka latihan." };
}

export async function simpanProgram(_s: StatusAksi, fd: FormData): Promise<StatusAksi> {
  await wajibTerapis();
  const data = ProgramSchema.safeParse(dariFormProgram(fd));
  if (!data.success) return galat(pesanPertama(data.error));

  const supabase = await createClient();
  const { pasien_id, gerakan } = data.data;
  const { data: pasien, error: galatPasien } = await supabase.from("pasien").select("id").eq("id", pasien_id).maybeSingle();
  if (galatPasien) return galatDb("simpanProgram.pasien", galatPasien);
  if (!pasien) return galat("Pasien tidak ditemukan.");

  const { error } = await supabase
    .from("program_gerakan")
    .upsert(
      gerakan.map((g) => ({ pasien_id, ...g })),
      { onConflict: "pasien_id,kode_gerakan" },
    );
  if (error) return galatDb("simpanProgram", error);

  refresh();
  return { status: "ok", pesan: "Program tersimpan. Pasien melihatnya saat membuka latihan berikutnya." };
}

export async function tandaiDitindaklanjuti(_s: StatusAksi, fd: FormData): Promise<StatusAksi> {
  await wajibTerapis();
  const id = IdSchema.safeParse(fd.get("kejadian_id"));
  if (!id.success) return galat("Laporan tidak ditemukan.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kejadian")
    .update({ ditindaklanjuti: true, ditindaklanjuti_pada: new Date().toISOString() })
    .eq("id", id.data)
    .select("id")
    .maybeSingle();
  if (error) return galatDb("tandaiDitindaklanjuti", error);
  if (!data) return galat("Laporan tidak ditemukan.");

  refresh();
  return { status: "ok", pesan: "Ditandai sudah ditindaklanjuti." };
}
