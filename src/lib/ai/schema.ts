import { z } from "zod";

export const KODE_GERAKAN = ["angkat_samping", "angkat_depan", "tekuk_siku"] as const;
export type KodeGerakan = (typeof KODE_GERAKAN)[number];

export const NAMA_GERAKAN: Record<KodeGerakan, string> = {
  angkat_samping: "Angkat tangan ke samping",
  angkat_depan: "Angkat tangan ke depan",
  tekuk_siku: "Tekuk siku",
};

/** Data yang dikirim ke AI: HANYA angka agregat. Tidak ada nama, ID, institusi, atau teks bebas dari pengguna. */
export const InputRingkasanSchema = z.object({
  periode_hari: z.number().int().positive(),
  sesi_direncanakan: z.number().int().nonnegative(),
  sesi_dilakukan: z.number().int().nonnegative(),
  gerakan: z.array(
    z.object({
      kode: z.enum(KODE_GERAKAN),
      nama: z.string(),
      target_sudut: z.number(),
      jumlah_sesi: z.number().int().nonnegative(),
      puncak_awal: z.number().nullable(),
      puncak_akhir: z.number().nullable(),
      puncak_terbaik: z.number().nullable(),
      sesi_pertama_capai_target: z.number().int().nullable(),
      persen_kompensasi_awal: z.number().nullable(),
      persen_kompensasi_akhir: z.number().nullable(),
    }),
  ),
  kejadian_nyeri: z.array(
    z.object({
      gerakan: z.string(),
      sudut: z.number().nullable(),
      repetisi_ke: z.number().int().nullable(),
    }),
  ),
});
export type InputRingkasan = z.infer<typeof InputRingkasanSchema>;

/** Bentuk ringkasan yang disimpan di ringkasan_ai.isi dan ditampilkan di dashboard. */
export const RingkasanSchema = z.object({
  poin: z.array(z.string().trim().min(5).max(300)).min(1).max(4),
  perlu_perhatian: z.boolean(),
  alasan_perhatian: z.string().max(200).default(""),
});
export type Ringkasan = z.infer<typeof RingkasanSchema>;

/** JSON Schema untuk `responseJsonSchema` Gemini.*/
export const RINGKASAN_JSON_SCHEMA = {
  type: "object",
  properties: {
    poin: {
      type: "array",
      description: "2 sampai 4 kalimat ringkas untuk fisioterapis.",
      items: { type: "string" },
      minItems: 1,
      maxItems: 4,
    },
    perlu_perhatian: {
      type: "boolean",
      description: "true bila ada nyeri, kehadiran rendah, atau jangkauan menurun.",
    },
    alasan_perhatian: {
      type: "string",
      description: "Alasan singkat bila perlu_perhatian true; string kosong bila tidak.",
    },
  },
  required: ["poin", "perlu_perhatian", "alasan_perhatian"],
} as const;
