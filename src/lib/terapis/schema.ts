import { z } from "zod";
import { KODE_GERAKAN } from "@/lib/pose/exercises";

/** Batas di sini sama dengan CHECK di supabase/migrations, agar galat tertangkap sebelum ke database. */

const unik = <T>(xs: readonly T[]) => new Set(xs).size === xs.length;

export const PasienBaruSchema = z.object({
  nama_tampilan: z
    .string()
    .trim()
    .min(1, "Isi nama panggilan pasien.")
    .max(60, "Nama panggilan maksimal 60 karakter."),
  sisi_dilatih: z.enum(["kiri", "kanan"], "Pilih sisi tubuh yang dilatih."),
  catatan: z
    .string()
    .trim()
    .max(280, "Catatan maksimal 280 karakter.")
    .transform((v) => v || null),
  gerakan: z
    .array(z.enum(KODE_GERAKAN))
    .min(1, "Pilih minimal satu gerakan.")
    .refine(unik, "Gerakan ganda."),
});
export type PasienBaru = z.infer<typeof PasienBaruSchema>;

export const GerakanProgramSchema = z.object({
  kode_gerakan: z.enum(KODE_GERAKAN),
  aktif: z.boolean(),
  target_sudut: z.number("Isi target sudut.").int("Target sudut harus bilangan bulat.").min(10, "Target minimal 10°.").max(180, "Target maksimal 180°."),
  repetisi: z.number("Isi jumlah repetisi.").int("Repetisi harus bilangan bulat.").min(1, "Repetisi minimal 1.").max(50, "Repetisi maksimal 50."),
  urutan: z.number().int().min(1).max(20),
});

export const ProgramSchema = z.object({
  pasien_id: z.uuid(),
  gerakan: z
    .array(GerakanProgramSchema)
    .min(1)
    .max(KODE_GERAKAN.length)
    .refine((g) => unik(g.map((x) => x.kode_gerakan)), "Gerakan ganda.")
    .refine((g) => g.some((x) => x.aktif), "Aktifkan minimal satu gerakan agar pasien bisa berlatih."),
});
export type Program = z.infer<typeof ProgramSchema>;

const angka = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? Number.NaN : Number(s);
};

/** FormData form tambah pasien → objek untuk PasienBaruSchema. */
export function dariFormPasienBaru(fd: FormData) {
  return {
    nama_tampilan: String(fd.get("nama_tampilan") ?? ""),
    sisi_dilatih: String(fd.get("sisi_dilatih") ?? ""),
    catatan: String(fd.get("catatan") ?? ""),
    gerakan: fd.getAll("gerakan").map(String),
  };
}

/** FormData editor program (field `<kode>.aktif`, `<kode>.target_sudut`, …) → objek untuk ProgramSchema. */
export function dariFormProgram(fd: FormData) {
  return {
    pasien_id: String(fd.get("pasien_id") ?? ""),
    gerakan: KODE_GERAKAN.filter((k) => fd.has(`${k}.target_sudut`)).map((k) => ({
      kode_gerakan: k,
      aktif: fd.get(`${k}.aktif`) === "on",
      target_sudut: angka(fd.get(`${k}.target_sudut`)),
      repetisi: angka(fd.get(`${k}.repetisi`)),
      urutan: angka(fd.get(`${k}.urutan`)),
    })),
  };
}

/** Pesan pertama dari galat Zod, untuk ditampilkan di form. */
export const pesanPertama = (e: z.ZodError) => e.issues[0]?.message ?? "Data belum lengkap.";

/** Pesan galat database yang ramah (tanpa detail teknis). */
export function pesanGalatDb(galat: { code?: string; message?: string } | null | undefined): string {
  if (galat?.message?.includes("pasien_demo_terlindungi")) {
    return "Pasien contoh dijaga tetap aktif agar semua juri bisa mencobanya. Silakan coba fitur ini pada pasien baru.";
  }
  return "Gagal menyimpan. Periksa koneksi lalu coba lagi.";
}
