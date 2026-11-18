import "server-only";
import { notFound } from "next/navigation";
import { RingkasanSchema, type Ringkasan } from "@/lib/ai/schema";
import { wajibTerapis } from "@/lib/auth/terapis";
import { createClient } from "@/lib/supabase/server";
import { catatGalat } from "./galat";
import { type BarisSesiTerapis, gabungNyeri } from "./olah";
import { IdSchema } from "./schema";

/**
 * Pembacaan data dashboard terapis. Selalu lewat klien server atas nama terapis (RLS),
 * jadi terapis hanya bisa melihat pasiennya sendiri. Kolom pasien ditulis eksplisit (token_hash dikunci).
 */

/** Jendela data untuk dashboard & detail. Cukup untuk grafik progres beberapa minggu. */
const JENDELA_HARI = 90;

const KOLOM_SESI =
  "id, pasien_id, mulai, dihentikan_nyeri, sesi_gerakan(kode_gerakan, target_sudut, repetisi_target, repetisi_selesai, rep_capai_target, rep_kompensasi, puncak_maks)";

const sejak = () => new Date(Date.now() - JENDELA_HARI * 86_400_000).toISOString();

/** Riwayat laporan nyeri yang SUDAH ditindaklanjuti di halaman detail. Yang belum, selalu ditampilkan semua. */
const RIWAYAT_NYERI = 10;

class GalatData extends Error {
  constructor() {
    super("Data belum bisa dimuat. Periksa koneksi lalu muat ulang halaman.");
  }
}

/** Catat galat pertama di log server lalu lempar pesan ramah (ditangkap error.tsx). */
function periksa(konteks: string, ...hasil: { error: { code?: string; message?: string } | null }[]): void {
  const galat = hasil.find((h) => h.error)?.error;
  if (!galat) return;
  catatGalat(konteks, galat);
  throw new GalatData();
}

/** id di URL bukan uuid → pasti tidak ada; hindari galat 22P02 dari Postgres. */
function wajibUuid(id: string): void {
  if (!IdSchema.safeParse(id).success) notFound();
}

export type KejadianNyeri = {
  id: string;
  pasien_id: string;
  kode_gerakan: string | null;
  repetisi_ke: number | null;
  sudut: number | null;
  terjadi_pada: string;
  ditindaklanjuti: boolean;
  ditindaklanjuti_pada: string | null;
};

const KOLOM_KEJADIAN = "id, pasien_id, kode_gerakan, repetisi_ke, sudut, terjadi_pada, ditindaklanjuti, ditindaklanjuti_pada";

export async function dataDashboard() {
  const terapis = await wajibTerapis();
  const supabase = await createClient();
  const [pasien, sesi, nyeri] = await Promise.all([
    supabase.from("pasien").select("id, nama_tampilan, sisi_dilatih, aktif, is_demo").order("nama_tampilan"),
    supabase.from("sesi").select(KOLOM_SESI).gte("mulai", sejak()).order("mulai", { ascending: false }).limit(1000),
    supabase
      .from("kejadian")
      .select(KOLOM_KEJADIAN)
      .eq("jenis", "stop_nyeri")
      .eq("ditindaklanjuti", false)
      .order("terjadi_pada", { ascending: false }),
  ]);
  periksa("dataDashboard", pasien, sesi, nyeri);
  return {
    terapis,
    pasien: pasien.data ?? [],
    sesi: (sesi.data ?? []) satisfies BarisSesiTerapis[],
    nyeriTerbuka: (nyeri.data ?? []) satisfies KejadianNyeri[],
  };
}

export type RingkasanTersimpan = {
  isi: Ringkasan;
  sumber: "ai" | "template";
  dibuat: string;
  periode_mulai: string;
  periode_selesai: string;
};

export async function dataDetailPasien(id: string) {
  await wajibTerapis();
  wajibUuid(id);
  const supabase = await createClient();

  const hasilPasien = await supabase
    .from("pasien")
    .select("id, nama_tampilan, sisi_dilatih, aktif, is_demo, catatan, terakhir_aktif, dibuat, persetujuan_pada, persetujuan_versi")
    .eq("id", id)
    .maybeSingle();
  periksa("dataDetailPasien.pasien", hasilPasien);
  const pasien = hasilPasien.data;
  if (!pasien) notFound(); // bukan milik terapis ini (RLS) atau memang tidak ada

  const [program, sesi, nyeriTerbuka, nyeriRiwayat, ringkasan] = await Promise.all([
    supabase.from("program_gerakan").select("kode_gerakan, target_sudut, repetisi, urutan, aktif").eq("pasien_id", id).order("urutan"),
    supabase.from("sesi").select(KOLOM_SESI).eq("pasien_id", id).gte("mulai", sejak()).order("mulai"),
    // Laporan nyeri yang belum ditindaklanjuti tidak boleh terpotong batas jumlah.
    supabase
      .from("kejadian")
      .select(KOLOM_KEJADIAN)
      .eq("pasien_id", id)
      .eq("jenis", "stop_nyeri")
      .eq("ditindaklanjuti", false)
      .order("terjadi_pada", { ascending: false }),
    supabase
      .from("kejadian")
      .select(KOLOM_KEJADIAN)
      .eq("pasien_id", id)
      .eq("jenis", "stop_nyeri")
      .eq("ditindaklanjuti", true)
      .order("terjadi_pada", { ascending: false })
      .limit(RIWAYAT_NYERI),
    supabase
      .from("ringkasan_ai")
      .select("isi, sumber, dibuat, periode_mulai, periode_selesai")
      .eq("pasien_id", id)
      .order("dibuat", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  periksa("dataDetailPasien", program, sesi, nyeriTerbuka, nyeriRiwayat, ringkasan);

  const isi = ringkasan.data ? RingkasanSchema.safeParse(ringkasan.data.isi) : null;
  const ringkasanTerakhir: RingkasanTersimpan | null =
    ringkasan.data && isi?.success
      ? {
          isi: isi.data,
          sumber: ringkasan.data.sumber === "ai" ? "ai" : "template",
          dibuat: ringkasan.data.dibuat,
          periode_mulai: ringkasan.data.periode_mulai,
          periode_selesai: ringkasan.data.periode_selesai,
        }
      : null;

  return {
    pasien,
    program: program.data ?? [],
    sesi: (sesi.data ?? []) satisfies BarisSesiTerapis[],
    kejadian: gabungNyeri<KejadianNyeri>(nyeriTerbuka.data ?? [], nyeriRiwayat.data ?? []),
    ringkasan: ringkasanTerakhir,
  };
}

/** Untuk editor program. */
export async function dataProgramPasien(id: string) {
  await wajibTerapis();
  wajibUuid(id);
  const supabase = await createClient();
  const [pasien, program] = await Promise.all([
    supabase.from("pasien").select("id, nama_tampilan, sisi_dilatih, is_demo").eq("id", id).maybeSingle(),
    supabase.from("program_gerakan").select("kode_gerakan, target_sudut, repetisi, urutan, aktif").eq("pasien_id", id).order("urutan"),
  ]);
  periksa("dataProgramPasien", pasien, program);
  if (!pasien.data) notFound();
  return { pasien: pasien.data, program: program.data ?? [] };
}
