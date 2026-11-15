import type { KodeGerakan } from "@/lib/pose/exercises";
import type { SimpanSesi } from "./schema";

/** Batas kewajaran waktu sesi. Di luar ini kemungkinan jam perangkat salah atau data dimanipulasi. */
export const BATAS_SESI = {
  durasiMaksMs: 2 * 60 * 60 * 1000,
  /** Sesi tertunda (offline) masih diterima sampai 7 hari. */
  umurMaksMs: 7 * 24 * 60 * 60 * 1000,
  /** Toleransi jam perangkat yang sedikit lebih cepat. */
  majuMaksMs: 10 * 60 * 1000,
  /** Kejadian boleh tercatat sedikit di luar rentang mulai–selesai. */
  toleransiKejadianMs: 60 * 1000,
} as const;

export type ProgramPasien = { kode_gerakan: KodeGerakan; target_sudut: number; repetisi: number };

export type BarisSesi = {
  id: string;
  pasien_id: string;
  mulai: string;
  selesai: string;
  dihentikan_nyeri: boolean;
  info_teknis: SimpanSesi["info_teknis"];
};

export type BarisSesiGerakan = {
  sesi_id: string;
  kode_gerakan: KodeGerakan;
  target_sudut: number;
  repetisi_target: number;
  repetisi_selesai: number;
  rep_capai_target: number;
  rep_kompensasi: number;
  puncak_maks: number | null;
  puncak_rata: number | null;
};

export type BarisKejadian = {
  sesi_id: string;
  pasien_id: string;
  jenis: "stop_nyeri" | "kamera_terputus";
  kode_gerakan: KodeGerakan | null;
  repetisi_ke: number | null;
  sudut: number | null;
  terjadi_pada: string;
};

export type HasilOlahSesi =
  | { ok: true; sesi: BarisSesi; gerakan: BarisSesiGerakan[]; kejadian: BarisKejadian[] }
  | { ok: false; pesan: string };

const tolak = (pesan: string): HasilOlahSesi => ({ ok: false, pesan });

/**
 * Memeriksa data sesi terhadap program terapis lalu menyusun baris siap-simpan.
 * Murni (tanpa database) agar mudah diuji. Target & jumlah repetisi diambil dari PROGRAM,
 * sehingga klien tidak bisa mengubah target yang dinilai terapis.
 */
export function olahSesi(data: SimpanSesi, pasienId: string, program: readonly ProgramPasien[], sekarang: Date): HasilOlahSesi {
  const mulai = Date.parse(data.mulai);
  const selesai = Date.parse(data.selesai);
  const kini = sekarang.getTime();

  if (selesai < mulai) return tolak("Waktu sesi tidak valid.");
  if (selesai - mulai > BATAS_SESI.durasiMaksMs) return tolak("Durasi sesi terlalu panjang.");
  if (selesai > kini + BATAS_SESI.majuMaksMs) return tolak("Waktu sesi tidak valid. Periksa jam di HP.");
  if (mulai < kini - BATAS_SESI.umurMaksMs) return tolak("Sesi ini sudah terlalu lama untuk dikirim.");
  if (data.gerakan.length === 0 && data.kejadian.length === 0) return tolak("Belum ada latihan yang tercatat.");

  const peta = new Map(program.map((p) => [p.kode_gerakan, p]));

  const gerakan: BarisSesiGerakan[] = [];
  for (const g of data.gerakan) {
    const p = peta.get(g.kode_gerakan);
    if (!p) return tolak("Gerakan tidak ada dalam program latihan.");
    gerakan.push({
      sesi_id: data.id,
      kode_gerakan: g.kode_gerakan,
      target_sudut: p.target_sudut,
      repetisi_target: p.repetisi,
      repetisi_selesai: g.repetisi_selesai,
      rep_capai_target: g.rep_capai_target,
      rep_kompensasi: g.rep_kompensasi,
      puncak_maks: g.puncak_maks,
      puncak_rata: g.puncak_rata,
    });
  }

  const kejadian: BarisKejadian[] = [];
  for (const k of data.kejadian) {
    if (k.kode_gerakan && !peta.has(k.kode_gerakan)) return tolak("Gerakan tidak ada dalam program latihan.");
    const t = Date.parse(k.terjadi_pada);
    if (t < mulai - BATAS_SESI.toleransiKejadianMs || t > selesai + BATAS_SESI.toleransiKejadianMs) {
      return tolak("Waktu kejadian tidak valid.");
    }
    kejadian.push({ sesi_id: data.id, pasien_id: pasienId, ...k });
  }

  // Laporan nyeri tidak boleh hilang: bendera sesi mengikuti kejadian, apa pun kiriman klien.
  const adaNyeri = kejadian.some((k) => k.jenis === "stop_nyeri");

  return {
    ok: true,
    sesi: {
      id: data.id,
      pasien_id: pasienId,
      mulai: data.mulai,
      selesai: data.selesai,
      dihentikan_nyeri: data.dihentikan_nyeri || adaNyeri,
      info_teknis: data.info_teknis,
    },
    gerakan,
    kejadian,
  };
}
