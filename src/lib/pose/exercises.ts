export const KODE_GERAKAN = ["angkat_samping", "angkat_depan", "tekuk_siku"] as const;
export type KodeGerakan = (typeof KODE_GERAKAN)[number];

export type DefinisiGerakan = {
  kode: KodeGerakan;
  nama: string;
  instruksi: string;
  sendi: "bahu" | "siku";
  posisiKamera: "depan" | "samping";
  amplitudoMin: number;
  targetDefault: number;
  repetisiDefault: number;
  periksaShrug: boolean;
};

export const GERAKAN: Record<KodeGerakan, DefinisiGerakan> = {
  angkat_samping: {
    kode: "angkat_samping",
    nama: "Angkat tangan ke samping",
    instruksi: "Angkat tangan ke samping pelan-pelan, lalu turunkan. Badan tetap tegak.",
    sendi: "bahu",
    posisiKamera: "depan",
    amplitudoMin: 35,
    targetDefault: 90,
    repetisiDefault: 10,
    periksaShrug: true,
  },
  angkat_depan: {
    kode: "angkat_depan",
    nama: "Angkat tangan ke depan",
    instruksi: "Angkat tangan lurus ke depan pelan-pelan, lalu turunkan. Badan tetap tegak.",
    sendi: "bahu",
    posisiKamera: "samping",
    amplitudoMin: 35,
    targetDefault: 90,
    repetisiDefault: 10,
    periksaShrug: true,
  },
  tekuk_siku: {
    kode: "tekuk_siku",
    nama: "Tekuk siku",
    instruksi: "Tekuk siku sampai tangan mendekati bahu, lalu luruskan lagi.",
    sendi: "siku",
    posisiKamera: "depan",
    amplitudoMin: 35,
    targetDefault: 120,
    repetisiDefault: 10,
    periksaShrug: false,
  },
};

export const isKodeGerakan = (k: string): k is KodeGerakan => (KODE_GERAKAN as readonly string[]).includes(k);
