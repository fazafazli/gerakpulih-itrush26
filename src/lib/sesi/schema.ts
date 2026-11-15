import { z } from "zod";
import { KODE_GERAKAN } from "@/lib/pose/exercises";

/**
 * Bentuk data yang dikirim perangkat pasien setelah satu sesi.
 * Sengaja TIDAK memuat target_sudut, repetisi_target, atau pasien_id:
 * nilai itu diambil server dari program terapis & cookie, bukan dipercaya dari klien.
 * Hanya angka ringkasan — tidak ada video, gambar, atau landmark per frame.
 */

const sudut = z.number().min(0).max(200).nullable();
const jumlahRep = z.number().int().min(0).max(200);

export const GerakanSesiSchema = z
  .object({
    kode_gerakan: z.enum(KODE_GERAKAN),
    repetisi_selesai: jumlahRep,
    rep_capai_target: jumlahRep,
    rep_kompensasi: jumlahRep,
    puncak_maks: sudut,
    puncak_rata: sudut,
  })
  .refine((g) => g.rep_capai_target <= g.repetisi_selesai && g.rep_kompensasi <= g.repetisi_selesai, {
    message: "Jumlah repetisi tidak konsisten",
  });

export const KejadianSesiSchema = z.object({
  jenis: z.enum(["stop_nyeri", "kamera_terputus"]),
  kode_gerakan: z.enum(KODE_GERAKAN).nullable(),
  repetisi_ke: jumlahRep.nullable(),
  sudut,
  terjadi_pada: z.iso.datetime(),
});

/** Info teknis tanpa identitas perangkat (tidak ada user agent, model HP, atau resolusi asli). */
export const InfoTeknisSchema = z.object({
  model: z.enum(["lite", "full", "heavy"]),
  delegasi: z.enum(["GPU", "CPU"]),
  fps_rata: z.number().min(0).max(120),
  turun_model: z.number().int().min(0).max(5),
});

export const SimpanSesiSchema = z.object({
  /** Dibuat perangkat (crypto.randomUUID) agar pengiriman ulang tidak membuat sesi ganda. */
  id: z.uuid(),
  mulai: z.iso.datetime(),
  selesai: z.iso.datetime(),
  dihentikan_nyeri: z.boolean(),
  info_teknis: InfoTeknisSchema,
  gerakan: z
    .array(GerakanSesiSchema)
    .max(KODE_GERAKAN.length)
    .refine((d) => new Set(d.map((g) => g.kode_gerakan)).size === d.length, { message: "Gerakan ganda" }),
  kejadian: z.array(KejadianSesiSchema).max(10),
});

export type GerakanSesi = z.infer<typeof GerakanSesiSchema>;
export type KejadianSesi = z.infer<typeof KejadianSesiSchema>;
export type InfoTeknis = z.infer<typeof InfoTeknisSchema>;
export type SimpanSesi = z.infer<typeof SimpanSesiSchema>;
