import { describe, expect, it } from "vitest";
import {
  GERAKAN,
  hitungBaseline,
  hitungStatistikGambar,
  kemiringanHp,
  mulaiKalibrasi,
  nilaiKesiapan,
  nilaiKompensasi,
  pilihOrang,
  tambahSampelKalibrasi,
  ukurPostur,
} from "@/lib/pose";
import { gambarPolos, LEBAR, TINGGI, tubuh } from "./helpers";

const postur = (o: Parameters<typeof tubuh>[0]) => ukurPostur(tubuh(o), "kanan", LEBAR, TINGGI);

describe("postur & kompensasi", () => {
  it("mengukur kemiringan badan", () => {
    expect(postur({}).badan).toBeCloseTo(0, 0);
    expect(Math.abs(postur({ miring: 12 }).badan)).toBeCloseTo(12, 0);
    expect(postur({ keyakinanPinggul: 0.1 }).badan).toBeNaN();
  });

  const nilai = (p: ReturnType<typeof postur>, acuan: ReturnType<typeof postur> | null, sejak: number | null, t: number, naik = true) =>
    nilaiKompensasi({ postur: p, acuan, periksaShrug: true, sedangNaik: naik, sejak, t });

  it("aktif hanya bila bertahan ≥ 300 ms dan sedang naik", () => {
    const miring = postur({ miring: 15 });
    const a = nilai(miring, null, null, 0);
    expect(a.aktif).toBe(false);
    const b = nilai(miring, null, a.sejak, 350);
    expect(b.aktif).toBe(true);
    expect(b.alasan).toContain("badan_miring");
    expect(nilai(miring, null, null, 0, false).sejak).toBeNull();
  });

  it("relatif terhadap kalibrasi: pasien yang sudah miring 10° tidak dianggap salah", () => {
    const acuan = postur({ miring: 10 });
    const r = nilai(postur({ miring: 12 }), acuan, 0, 1000);
    expect(r.aktif).toBe(false);
  });

  it("mendeteksi bahu terangkat (shrug) setelah kalibrasi", () => {
    const acuan = postur({});
    const r = nilai(postur({ shrug: 25 }), acuan, 0, 1000);
    expect(r.alasan).toContain("bahu_terangkat");
  });

  it("baseline kalibrasi = median; null bila sampel kurang", () => {
    let k = mulaiKalibrasi(0);
    for (let i = 0; i < 30; i++) k = tambahSampelKalibrasi(k, { nilai: 30 + (i % 3), ...postur({}) });
    expect(hitungBaseline(k)?.nilai).toBe(31);
    expect(hitungBaseline(mulaiKalibrasi(0))).toBeNull();
  });
});

describe("cek kesiapan", () => {
  const gerakan = GERAKAN.angkat_samping;

  it("ruangan gelap → satu instruksi utama: nyalakan lampu", () => {
    const statistik = hitungStatistikGambar(gambarPolos(160, 120, 20), 160, 120);
    const r = nilaiKesiapan({ statistik, landmark: tubuh(), jumlahOrang: 1, gerakan, sisi: "kanan" });
    expect(r.siap).toBe(false);
    expect(r.instruksiUtama?.kode).toBe("cahaya");
    expect(r.instruksiUtama?.pesan).toMatch(/lampu/);
  });

  it("gambar polos terbaca buram (ketajaman 0)", () => {
    expect(hitungStatistikGambar(gambarPolos(160, 120, 128), 160, 120).ketajaman).toBe(0);
  });

  it("tidak ada orang → minta duduk di depan kamera", () => {
    const r = nilaiKesiapan({ landmark: null, jumlahOrang: 0, gerakan, sisi: "kanan" });
    expect(r.instruksiUtama?.kode).toBe("orang");
  });

  it("terlalu dekat → minta mundur; posisi normal → siap", () => {
    expect(nilaiKesiapan({ landmark: tubuh({ skala: 3 }), jumlahOrang: 1, gerakan, sisi: "kanan" }).siap).toBe(false);
    const ok = nilaiKesiapan({ landmark: tubuh(), jumlahOrang: 1, kemiringanHp: 2, gerakan, sisi: "kanan" });
    expect(ok.siap).toBe(true);
    expect(ok.instruksiUtama).toBeNull();
  });

  it("HP miring terdeteksi; pinggul tertutup hanya info (tidak memblokir)", () => {
    expect(nilaiKesiapan({ landmark: tubuh(), jumlahOrang: 1, kemiringanHp: 20, gerakan, sisi: "kanan" }).instruksiUtama?.kode).toBe("hp_tegak");
    const r = nilaiKesiapan({ landmark: tubuh({ keyakinanPinggul: 0.1 }), jumlahOrang: 1, gerakan, sisi: "kanan" });
    expect(r.siap).toBe(true);
    expect(r.item.some((i) => i.kode === "pinggul" && i.status === "info")).toBe(true);
  });

  it("kemiringan HP memperhitungkan orientasi layar", () => {
    expect(kemiringanHp(85, 5, 0)).toBe(5);
    expect(kemiringanHp(3, 80, 90)).toBe(3);
  });
});

describe("pilihOrang", () => {
  it("mengunci pasien walau orang lain lewat di dekat kamera", () => {
    const pasien = tubuh();
    const lewat = tubuh({ geserX: 200, skala: 1.4 });
    const awal = pilihOrang([pasien], null);
    const r = pilihOrang([lewat, pasien], awal.kunci);
    expect(r.indeks).toBe(1);
  });

  it("tanpa kunci memilih orang terdekat kamera (bahu terlebar)", () => {
    expect(pilihOrang([tubuh(), tubuh({ skala: 1.5 })], null).indeks).toBe(1);
    expect(pilihOrang([], null).indeks).toBe(-1);
  });
});

describe("aturan membelakangi cahaya (dilonggarkan)", () => {
  const dasar = { jumlahOrang: 1, gerakan: GERAKAN.angkat_samping, sisi: "kanan" as const };
  const terang = (kecerahanTubuh: number) => ({ kecerahan: 160, ketajaman: 60, kecerahanTubuh });

  it("tidak menunda latihan bila pose tetap terbaca (hanya info)", () => {
    const h = nilaiKesiapan({ ...dasar, statistik: terang(60), landmark: tubuh() });
    expect(h.siap).toBe(true);
    expect(h.item.find((i) => i.kode === "membelakangi_cahaya")?.status).toBe("info");
  });

  it("menghalangi bila backlight membuat lengan tidak terbaca", () => {
    const h = nilaiKesiapan({ ...dasar, statistik: terang(60), landmark: tubuh({ keyakinan: 0.2 }) });
    expect(h.siap).toBe(false);
    expect(h.item.find((i) => i.kode === "membelakangi_cahaya")?.status).toBe("gagal");
  });

  it("tubuh sedikit lebih gelap (baju gelap) bukan backlight", () => {
    const h = nilaiKesiapan({ ...dasar, statistik: terang(95), landmark: tubuh() });
    expect(h.item.some((i) => i.kode === "membelakangi_cahaya")).toBe(false);
  });
});
