import type { RingkasanGerakan } from "@/lib/pose/tracker";
import type { GerakanSesi, InfoTeknis, KejadianSesi, SimpanSesi } from "./schema";

/**
 * Logika murni pendukung halaman sesi (tanpa React/DOM) — diuji di tests/sesi/.
 */

/** Model awal sesuai kemampuan perangkat. HP lemah langsung "lite" agar tidak tersendat di awal. */
export function modelAwal(perangkat: { inti?: number; memoriGb?: number }): "lite" | "full" {
  const lemah = (perangkat.inti != null && perangkat.inti <= 4) || (perangkat.memoriGb != null && perangkat.memoriGb <= 3);
  return lemah ? "lite" : "full";
}

/** Bernilai true bila suatu kondisi sudah bertahan terus-menerus selama `durasiMs`. */
export class PenilaiStabil {
  private sejak: number | null = null;
  constructor(private readonly durasiMs: number) {}

  perbarui(kondisi: boolean, t: number): boolean {
    if (!kondisi) {
      this.sejak = null;
      return false;
    }
    this.sejak ??= t;
    return t - this.sejak >= this.durasiMs;
  }

  /** Sisa waktu (ms) sampai stabil; null bila kondisi belum terpenuhi. */
  sisa(t: number): number | null {
    return this.sejak == null ? null : Math.max(0, this.durasiMs - (t - this.sejak));
  }

  reset(): void {
    this.sejak = null;
  }
}

export const AMBANG_FPS = {
  /** Di bawah ini gerakan cepat bisa terlewat. */
  minimal: 10,
  /** FPS awal tidak dinilai (model masih "pemanasan"). */
  pemanasanMs: 3000,
  /** FPS harus rendah terus selama ini sebelum model diturunkan. */
  bertahanMs: 4000,
} as const;

/** Mengukur FPS pemrosesan dan memutuskan kapan model perlu diturunkan (heavy → full → lite). */
export class PemantauFps {
  private terakhir: number | null = null;
  private mulai: number | null = null;
  private fpsHalus = 0;
  private total = 0;
  private bingkai = 0;
  private rendah = new PenilaiStabil(AMBANG_FPS.bertahanMs);

  /** Panggil setiap satu frame selesai diproses. */
  catat(t: number): void {
    this.mulai ??= t;
    if (this.terakhir != null) {
      const selang = t - this.terakhir;
      if (selang > 0 && selang < 2000) {
        const fps = 1000 / selang;
        this.fpsHalus = this.fpsHalus === 0 ? fps : this.fpsHalus * 0.9 + fps * 0.1;
        this.total += fps;
        this.bingkai++;
      }
    }
    this.terakhir = t;
  }

  get fps(): number {
    return this.fpsHalus;
  }

  get fpsRata(): number {
    return this.bingkai ? this.total / this.bingkai : 0;
  }

  /** true sekali saat FPS rendah sudah bertahan; setelah itu penilaian diulang dari awal. */
  perluTurun(t: number): boolean {
    if (this.mulai == null || t - this.mulai < AMBANG_FPS.pemanasanMs) return false;
    if (this.rendah.perbarui(this.fpsHalus > 0 && this.fpsHalus < AMBANG_FPS.minimal, t)) {
      this.rendah.reset();
      this.mulai = t; // beri waktu pemanasan untuk model baru
      this.fpsHalus = 0;
      this.terakhir = null;
      return true;
    }
    return false;
  }
}

/** Mengubah ringkasan pelacak menjadi baris kiriman (tanpa target — target diambil server dari program). */
export function keGerakanSesi(r: RingkasanGerakan): GerakanSesi {
  return {
    kode_gerakan: r.kode_gerakan,
    repetisi_selesai: r.repetisi_selesai,
    rep_capai_target: Math.min(r.rep_capai_target, r.repetisi_selesai),
    rep_kompensasi: Math.min(r.rep_kompensasi, r.repetisi_selesai),
    puncak_maks: r.puncak_maks,
    puncak_rata: r.puncak_rata,
  };
}

/** Menggabungkan dua bagian dari gerakan yang sama. Rata-rata puncak ditimbang dengan jumlah repetisi. */
export function gabungRingkasan(a: RingkasanGerakan, b: RingkasanGerakan): RingkasanGerakan {
  const n = a.repetisi_selesai + b.repetisi_selesai;
  const maks = [a.puncak_maks, b.puncak_maks].filter((x): x is number => x != null);
  const rata =
    n === 0
      ? null
      : Math.round((((a.puncak_rata ?? 0) * a.repetisi_selesai + (b.puncak_rata ?? 0) * b.repetisi_selesai) / n) * 10) / 10;
  return {
    kode_gerakan: a.kode_gerakan,
    target_sudut: b.target_sudut,
    repetisi_selesai: n,
    rep_capai_target: a.rep_capai_target + b.rep_capai_target,
    rep_kompensasi: a.rep_kompensasi + b.rep_kompensasi,
    puncak_maks: maks.length ? Math.max(...maks) : null,
    puncak_rata: rata,
  };
}

export function bangunKirimanSesi(args: {
  id: string;
  mulai: Date;
  selesai: Date;
  gerakan: readonly RingkasanGerakan[];
  kejadian: readonly KejadianSesi[];
  info: InfoTeknis;
}): SimpanSesi {
  // Satu baris per gerakan: bila gerakan terbagi (mis. kamera terputus lalu dilanjutkan), bagiannya digabung.
  const perKode = new Map<RingkasanGerakan["kode_gerakan"], RingkasanGerakan>();
  for (const g of args.gerakan) {
    const ada = perKode.get(g.kode_gerakan);
    perKode.set(g.kode_gerakan, ada ? gabungRingkasan(ada, g) : g);
  }
  return {
    id: args.id,
    mulai: args.mulai.toISOString(),
    selesai: args.selesai.toISOString(),
    dihentikan_nyeri: args.kejadian.some((k) => k.jenis === "stop_nyeri"),
    info_teknis: { ...args.info, fps_rata: Math.round(Math.min(args.info.fps_rata, 120) * 10) / 10 },
    gerakan: [...perKode.values()].map(keGerakanSesi),
    kejadian: args.kejadian.slice(0, 10),
  };
}
