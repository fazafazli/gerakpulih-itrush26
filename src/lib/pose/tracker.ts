import {
  type Baseline,
  hitungBaseline,
  kalibrasiSelesai,
  type Kalibrasi,
  mulaiKalibrasi,
  sisaKalibrasiMs,
  tambahSampelKalibrasi,
} from "./calibration";
import { type AlasanKompensasi, type AmbangKompensasi, AMBANG_KOMPENSASI_DEFAULT, nilaiKompensasi, ukurPostur } from "./compensation";
import { GERAKAN, type DefinisiGerakan, type KodeGerakan } from "./exercises";
import { haluskan } from "./geometry";
import type { Landmark, Sisi } from "./landmarks";
import { type AcuanDipakai, AMBANG_KEYAKINAN, hitungMetrik, type ModeKoordinat, type PilihanAcuan } from "./metrics";
import { pilihOrang, type Pusat } from "./pick-pose";
import { type KejadianRepetisi, KONFIG_REPETISI_DEFAULT, perbaruiRepetisi, type StatusRepetisi, statusRepetisiAwal } from "./rep-counter";

export type KonfigPelacak = {
  gerakan: KodeGerakan;
  sisi: Sisi;
  targetSudut: number;
  mode?: ModeKoordinat;
  acuan?: PilihanAcuan;
  alpha?: number;
  ambangKompensasi?: Partial<AmbangKompensasi>;
  durasiKalibrasiMs?: number;
};

/** Satu hasil deteksi MediaPipe yang sudah disederhanakan. */
export type Bingkai = {
  landmark: readonly (readonly Landmark[])[];
  dunia?: readonly (readonly Landmark[])[];
  lebar: number;
  tinggi: number;
  t: number;
};

export type KeluaranBingkai = {
  adaOrang: boolean;
  jumlahOrang: number;
  indeksOrang: number;
  sudut: number | null;
  keyakinan: number;
  acuan: AcuanDipakai | null;
  fase: StatusRepetisi["fase"];
  jumlahRepetisi: number;
  kalibrasi: { aktif: boolean; sisaMs: number };
  kompensasi: { aktif: boolean; alasan: AlasanKompensasi[] };
  repetisiBaru?: KejadianRepetisi & { alasanKompensasi: AlasanKompensasi[] };
  baselineBaru?: Baseline | null;
};

/** Ringkasan satu gerakan untuk disimpan ke tabel sesi_gerakan. */
export type RingkasanGerakan = {
  kode_gerakan: KodeGerakan;
  target_sudut: number;
  repetisi_selesai: number;
  rep_capai_target: number;
  rep_kompensasi: number;
  puncak_maks: number | null;
  puncak_rata: number | null;
};

const bulat1 = (x: number) => Math.round(x * 10) / 10;

export class PelacakGerakan {
  readonly gerakan: DefinisiGerakan;
  private readonly konfig: Required<Omit<KonfigPelacak, "ambangKompensasi">> & { ambangKompensasi: AmbangKompensasi };
  private status: StatusRepetisi = statusRepetisiAwal();
  private halus: number | null = null;
  private kunci: Pusat | null = null;
  private kalibrasi: Kalibrasi | null = null;
  private baseline: Baseline | null = null;
  private kompensasiSejak: number | null = null;
  private alasanTerakhir: AlasanKompensasi[] = [];

  constructor(konfig: KonfigPelacak) {
    this.gerakan = GERAKAN[konfig.gerakan];
    this.konfig = {
      mode: "2d",
      acuan: "otomatis",
      alpha: 0.35,
      durasiKalibrasiMs: 3000,
      ...konfig,
      ambangKompensasi: { ...AMBANG_KOMPENSASI_DEFAULT, ...konfig.ambangKompensasi },
    };
  }

  mulaiKalibrasi(t: number): void {
    this.kalibrasi = mulaiKalibrasi(t, this.konfig.durasiKalibrasiMs);
  }

  get sudahKalibrasi(): boolean {
    return this.baseline != null;
  }

  proses(b: Bingkai): KeluaranBingkai {
    const { indeks, kunci } = pilihOrang(b.landmark, this.kunci);
    this.kunci = kunci;
    const dasar: KeluaranBingkai = {
      adaOrang: indeks >= 0,
      jumlahOrang: b.landmark.length,
      indeksOrang: indeks,
      sudut: null,
      keyakinan: 0,
      acuan: null,
      fase: this.status.fase,
      jumlahRepetisi: this.status.jumlah,
      kalibrasi: { aktif: this.kalibrasi != null, sisaMs: this.kalibrasi ? sisaKalibrasiMs(this.kalibrasi, b.t) : 0 },
      kompensasi: { aktif: false, alasan: [] },
    };
    if (indeks < 0) {
      this.kompensasiSejak = null;
      return dasar;
    }

    const lm = b.landmark[indeks];
    const metrik = hitungMetrik({
      landmark: lm,
      dunia: b.dunia?.[indeks] ?? null,
      gerakan: this.gerakan,
      sisi: this.konfig.sisi,
      lebar: b.lebar,
      tinggi: b.tinggi,
      mode: this.konfig.mode,
      acuan: this.konfig.acuan,
    });
    this.halus = haluskan(this.halus, metrik.nilai, this.konfig.alpha);
    const sudut = this.halus;
    const postur = ukurPostur(lm, this.konfig.sisi, b.lebar, b.tinggi);

    let baselineBaru: Baseline | null | undefined;
    if (this.kalibrasi) {
      this.kalibrasi = tambahSampelKalibrasi(this.kalibrasi, { nilai: sudut, ...postur });
      if (kalibrasiSelesai(this.kalibrasi, b.t)) {
        baselineBaru = hitungBaseline(this.kalibrasi);
        this.kalibrasi = null;
        if (baselineBaru) {
          this.baseline = baselineBaru;
          this.status = statusRepetisiAwal(baselineBaru.nilai);
        }
      }
      return {
        ...dasar,
        sudut,
        keyakinan: metrik.keyakinan,
        acuan: metrik.acuan,
        kalibrasi: { aktif: this.kalibrasi != null, sisaMs: this.kalibrasi ? sisaKalibrasiMs(this.kalibrasi, b.t) : 0 },
        baselineBaru,
      };
    }

    const komp = nilaiKompensasi({
      postur,
      acuan: this.baseline,
      ambang: this.konfig.ambangKompensasi,
      periksaShrug: this.gerakan.periksaShrug,
      sedangNaik: this.status.fase === "naik",
      sejak: this.kompensasiSejak,
      t: b.t,
    });
    this.kompensasiSejak = komp.sejak;
    if (komp.aktif) this.alasanTerakhir = komp.alasan;

    let repetisiBaru: KeluaranBingkai["repetisiBaru"];
    if (metrik.keyakinan >= AMBANG_KEYAKINAN) {
      const hasil = perbaruiRepetisi(this.status, sudut, komp.aktif, b.t, {
        ...KONFIG_REPETISI_DEFAULT,
        amplitudoMin: this.gerakan.amplitudoMin,
        targetSudut: this.konfig.targetSudut,
      });
      this.status = hasil.status;
      if (hasil.repetisi) {
        repetisiBaru = { ...hasil.repetisi, alasanKompensasi: hasil.repetisi.kompensasi ? this.alasanTerakhir : [] };
        this.alasanTerakhir = [];
      }
    }

    return {
      ...dasar,
      sudut,
      keyakinan: metrik.keyakinan,
      acuan: metrik.acuan,
      fase: this.status.fase,
      jumlahRepetisi: this.status.jumlah,
      kompensasi: { aktif: komp.aktif, alasan: komp.alasan },
      repetisiBaru,
    };
  }

  ringkasan(): RingkasanGerakan {
    const p = this.status.daftarPuncak;
    return {
      kode_gerakan: this.gerakan.kode,
      target_sudut: this.konfig.targetSudut,
      repetisi_selesai: this.status.jumlah,
      rep_capai_target: this.status.capaiTarget,
      rep_kompensasi: this.status.denganKompensasi,
      puncak_maks: p.length ? bulat1(Math.max(...p)) : null,
      puncak_rata: p.length ? bulat1(p.reduce((s, x) => s + x, 0) / p.length) : null,
    };
  }
}
