import { describe, expect, it } from "vitest";
import type { RingkasanGerakan } from "@/lib/pose/tracker";
import { olahSesi, type ProgramPasien } from "@/lib/sesi/olah";
import { bangunKirimanSesi, gabungRingkasan, modelAwal, PemantauFps, PenilaiStabil } from "@/lib/sesi/pemantau";
import { type SimpanSesi, SimpanSesiSchema } from "@/lib/sesi/schema";
import { namaDenganSisi, petunjukPosisi } from "@/lib/sesi/teks";

const ID = "6f1c2b9e-3a4d-4c5e-9f00-1a2b3c4d5e6f";
const PASIEN = "11111111-2222-4333-8444-555555555555";
const SEKARANG = new Date("2026-11-16T03:00:00.000Z");
const PROGRAM: ProgramPasien[] = [
  { kode_gerakan: "angkat_samping", target_sudut: 90, repetisi: 10 },
  { kode_gerakan: "tekuk_siku", target_sudut: 120, repetisi: 8 },
];

const ringkasan = (o: Partial<RingkasanGerakan> = {}): RingkasanGerakan => ({
  kode_gerakan: "angkat_samping",
  target_sudut: 90,
  repetisi_selesai: 10,
  rep_capai_target: 7,
  rep_kompensasi: 2,
  puncak_maks: 98.4,
  puncak_rata: 91.2,
  ...o,
});

type ArgKiriman = Parameters<typeof bangunKirimanSesi>[0];
const buat = (o: Partial<ArgKiriman> = {}): SimpanSesi =>
  bangunKirimanSesi({
    id: ID,
    mulai: new Date("2026-11-16T02:50:00.000Z"),
    selesai: new Date("2026-11-16T02:58:00.000Z"),
    gerakan: [ringkasan()],
    kejadian: [],
    info: { model: "full", delegasi: "GPU", fps_rata: 21.37, turun_model: 0 },
    ...o,
  });
const kiriman = (o: Partial<SimpanSesi> = {}): SimpanSesi => ({ ...buat(), ...o });

describe("skema kiriman sesi", () => {
  it("menerima kiriman dari bangunKirimanSesi", () => {
    expect(SimpanSesiSchema.safeParse(kiriman()).success).toBe(true);
  });

  it("membuang field yang tidak dikenal (mis. pasien_id palsu, target dari klien)", () => {
    const k = { ...kiriman(), pasien_id: "palsu", gerakan: [{ ...kiriman().gerakan[0], target_sudut: 5 }] };
    const hasil = SimpanSesiSchema.parse(k);
    expect(hasil).not.toHaveProperty("pasien_id");
    expect(hasil.gerakan[0]).not.toHaveProperty("target_sudut");
  });

  it("menolak repetisi tidak konsisten, gerakan ganda, dan kode asing", () => {
    const g = kiriman().gerakan[0];
    expect(SimpanSesiSchema.safeParse({ ...kiriman(), gerakan: [{ ...g, rep_capai_target: 11 }] }).success).toBe(false);
    expect(SimpanSesiSchema.safeParse({ ...kiriman(), gerakan: [g, g] }).success).toBe(false);
    expect(SimpanSesiSchema.safeParse({ ...kiriman(), gerakan: [{ ...g, kode_gerakan: "lompat" }] }).success).toBe(false);
  });
});

describe("olahSesi", () => {
  it("mengambil target & repetisi dari program terapis, bukan dari klien", () => {
    const h = olahSesi(kiriman(), PASIEN, PROGRAM, SEKARANG);
    expect(h.ok).toBe(true);
    if (!h.ok) return;
    expect(h.sesi.pasien_id).toBe(PASIEN);
    expect(h.gerakan[0]).toMatchObject({ sesi_id: ID, target_sudut: 90, repetisi_target: 10, repetisi_selesai: 10 });
  });

  it("menolak gerakan yang tidak ada di program pasien", () => {
    const k = kiriman({ gerakan: [{ ...kiriman().gerakan[0], kode_gerakan: "angkat_depan" }] });
    expect(olahSesi(k, PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
  });

  it("menolak waktu tidak wajar dan sesi kosong", () => {
    expect(olahSesi(kiriman({ selesai: "2026-11-16T02:00:00.000Z" }), PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
    expect(olahSesi(kiriman({ selesai: "2026-11-16T09:00:00.000Z" }), PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
    expect(olahSesi(kiriman({ mulai: "2026-10-01T00:00:00.000Z" }), PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
    expect(olahSesi(kiriman({ gerakan: [], kejadian: [] }), PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
  });

  it("laporan nyeri selalu menandai sesi walau klien mengirim dihentikan_nyeri=false", () => {
    const k: SimpanSesi = {
      ...kiriman(),
      dihentikan_nyeri: false,
      kejadian: [{ jenis: "stop_nyeri", kode_gerakan: "angkat_samping", repetisi_ke: 4, sudut: 82, terjadi_pada: "2026-11-16T02:55:00.000Z" }],
    };
    const h = olahSesi(k, PASIEN, PROGRAM, SEKARANG);
    expect(h.ok && h.sesi.dihentikan_nyeri).toBe(true);
    expect(h.ok && h.kejadian[0]).toMatchObject({ pasien_id: PASIEN, sesi_id: ID, jenis: "stop_nyeri" });
  });

  it("menolak kejadian di luar rentang waktu sesi", () => {
    const k: SimpanSesi = {
      ...kiriman(),
      kejadian: [{ jenis: "kamera_terputus", kode_gerakan: null, repetisi_ke: null, sudut: null, terjadi_pada: "2026-11-15T02:55:00.000Z" }],
    };
    expect(olahSesi(k, PASIEN, PROGRAM, SEKARANG).ok).toBe(false);
  });
});

describe("bangunKirimanSesi & gabungRingkasan", () => {
  it("menggabungkan gerakan yang terbagi (kamera terputus lalu lanjut)", () => {
    const k = buat({
      gerakan: [
        ringkasan({ repetisi_selesai: 4, rep_capai_target: 2, rep_kompensasi: 1, puncak_maks: 95, puncak_rata: 90 }),
        ringkasan({ repetisi_selesai: 6, rep_capai_target: 5, rep_kompensasi: 0, puncak_maks: 101, puncak_rata: 95 }),
      ],
    });
    expect(k.gerakan).toHaveLength(1);
    expect(k.gerakan[0]).toMatchObject({ repetisi_selesai: 10, rep_capai_target: 7, rep_kompensasi: 1, puncak_maks: 101, puncak_rata: 93 });
  });

  it("gabungan tanpa repetisi tetap valid", () => {
    const g = gabungRingkasan(ringkasan({ repetisi_selesai: 0, rep_capai_target: 0, rep_kompensasi: 0, puncak_maks: null, puncak_rata: null }), ringkasan({ repetisi_selesai: 0, rep_capai_target: 0, rep_kompensasi: 0, puncak_maks: null, puncak_rata: null }));
    expect(g).toMatchObject({ repetisi_selesai: 0, puncak_maks: null, puncak_rata: null });
  });

  it("menandai nyeri dari kejadian & membulatkan fps", () => {
    const k = bangunKirimanSesi({
      id: ID,
      mulai: new Date("2026-11-16T02:50:00.000Z"),
      selesai: new Date("2026-11-16T02:51:00.000Z"),
      gerakan: [],
      kejadian: [{ jenis: "stop_nyeri", kode_gerakan: null, repetisi_ke: null, sudut: null, terjadi_pada: "2026-11-16T02:50:30.000Z" }],
      info: { model: "lite", delegasi: "CPU", fps_rata: 14.6666, turun_model: 1 },
    });
    expect(k.dihentikan_nyeri).toBe(true);
    expect(k.info_teknis.fps_rata).toBe(14.7);
    expect(SimpanSesiSchema.safeParse(k).success).toBe(true);
  });
});

describe("PenilaiStabil", () => {
  it("baru bernilai true setelah kondisi bertahan, dan ter-reset saat kondisi putus", () => {
    const s = new PenilaiStabil(1500);
    expect(s.perbarui(true, 0)).toBe(false);
    expect(s.perbarui(true, 1000)).toBe(false);
    expect(s.perbarui(false, 1200)).toBe(false);
    expect(s.perbarui(true, 1300)).toBe(false);
    expect(s.perbarui(true, 2799)).toBe(false);
    expect(s.perbarui(true, 2800)).toBe(true);
  });
});

describe("PemantauFps", () => {
  const jalankan = (p: PemantauFps, dari: number, sampai: number, selang: number) => {
    let turun = false;
    for (let t = dari; t <= sampai; t += selang) {
      p.catat(t);
      turun ||= p.perluTurun(t);
    }
    return turun;
  };

  it("tidak menurunkan model bila FPS cukup", () => {
    expect(jalankan(new PemantauFps(), 0, 15000, 1000 / 20)).toBe(false);
  });

  it("menurunkan model bila FPS rendah bertahan setelah pemanasan", () => {
    const p = new PemantauFps();
    expect(jalankan(p, 0, 2900, 200)).toBe(false); // masih pemanasan
    expect(jalankan(p, 3000, 12000, 200)).toBe(true); // 5 fps terus-menerus
    expect(p.fpsRata).toBeGreaterThan(4);
  });
});

describe("teks pasien", () => {
  it("menyebut sisi tubuh & posisi kamera", () => {
    expect(namaDenganSisi("angkat_samping", "kanan")).toBe("Angkat tangan kanan ke samping");
    expect(namaDenganSisi("tekuk_siku", "kiri")).toBe("Tekuk siku kiri");
    expect(petunjukPosisi("angkat_depan", "kiri")).toContain("menyamping");
    expect(modelAwal({ inti: 4 })).toBe("lite");
    expect(modelAwal({ inti: 8, memoriGb: 8 })).toBe("full");
  });
});
