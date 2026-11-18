import { describe, expect, it } from "vitest";
import {
  aktivitasTerbaru,
  gabungNyeri,
  LABEL_STATUS,
  angkaDashboard,
  barisDaftarPasien,
  type BarisSesiTerapis,
  gerakanTercatat,
  jamWib,
  kepatuhanHarian,
  labelRelatif,
  ringkasanUsang,
  ringkasSeri,
  selisihHari,
  seriProgres,
  statusPasien,
  tanggalWib,
  tautanPasien,
  tautanWhatsApp,
} from "@/lib/terapis/olah";

// 18 Nov 2026 10.00 WIB
const SEKARANG = new Date("2026-11-18T03:00:00.000Z");
const BUDI = "11111111-1111-4111-8111-111111111111";
const SITI = "22222222-2222-4222-8222-222222222222";

const g = (kode: string, puncak: number | null, target = 90) => ({
  kode_gerakan: kode,
  target_sudut: target,
  repetisi_target: 10,
  repetisi_selesai: 10,
  rep_capai_target: puncak != null && puncak >= target ? 6 : 0,
  rep_kompensasi: 1,
  puncak_maks: puncak,
});

let n = 0;
const sesi = (pasien: string, mulai: string, gerakan = [g("angkat_samping", 80)], nyeri = false): BarisSesiTerapis => ({
  id: `s${++n}`,
  pasien_id: pasien,
  mulai,
  dihentikan_nyeri: nyeri,
  sesi_gerakan: gerakan,
});

describe("tanggal WIB", () => {
  it("memakai UTC+7, bukan zona server", () => {
    expect(tanggalWib("2026-11-17T16:59:00.000Z")).toBe("2026-11-17");
    expect(tanggalWib("2026-11-17T17:00:00.000Z")).toBe("2026-11-18");
  });

  it("selisih hari kalender, bukan 24 jam", () => {
    expect(selisihHari("2026-11-17T16:30:00.000Z", "2026-11-17T17:30:00.000Z")).toBe(1);
    expect(selisihHari("2026-11-18T00:00:00.000Z", SEKARANG)).toBe(0);
  });

  it("label relatif & jam", () => {
    expect(labelRelatif("2026-11-18T01:00:00.000Z", SEKARANG)).toBe("hari ini");
    expect(labelRelatif("2026-11-17T01:00:00.000Z", SEKARANG)).toBe("kemarin");
    expect(labelRelatif("2026-11-14T01:00:00.000Z", SEKARANG)).toBe("4 hari lalu");
    expect(labelRelatif("2026-11-01T01:00:00.000Z", SEKARANG)).toBe("1 Nov");
    expect(jamWib("2026-11-18T02:12:00.000Z")).toBe("09.12");
  });
});

describe("seriProgres", () => {
  it("urut waktu, hanya sesi yang memuat gerakan itu, target dari sesi", () => {
    const data = [
      sesi(BUDI, "2026-11-10T02:00:00.000Z", [g("angkat_samping", 95, 100)]),
      sesi(BUDI, "2026-11-05T02:00:00.000Z", [g("angkat_samping", 72.44)]),
      sesi(BUDI, "2026-11-07T02:00:00.000Z", [g("tekuk_siku", 110, 120)], true),
    ];
    expect(seriProgres(data, "angkat_samping")).toEqual([
      { tanggal: "2026-11-05", puncak: 72.4, target: 90, nyeri: false },
      { tanggal: "2026-11-10", puncak: 95, target: 100, nyeri: false },
    ]);
    expect(seriProgres(data, "tekuk_siku")[0].nyeri).toBe(true);
    expect(seriProgres(data, "angkat_depan")).toEqual([]);
    expect(gerakanTercatat(data)).toEqual(["angkat_samping", "tekuk_siku"]);
  });

  it("ringkasSeri: awal, akhir, terbaik, capaian terhadap target masing-masing sesi", () => {
    const titik = [
      { tanggal: "2026-11-01", puncak: 72, target: 90, nyeri: false },
      { tanggal: "2026-11-02", puncak: null, target: 90, nyeri: true },
      { tanggal: "2026-11-03", puncak: 104, target: 90, nyeri: false },
      { tanggal: "2026-11-04", puncak: 98, target: 100, nyeri: false },
    ];
    expect(ringkasSeri(titik)).toEqual({ jumlahSesi: 4, awal: 72, akhir: 98, terbaik: 104, target: 100, sesiCapaiTarget: 1 });
    expect(ringkasSeri([])).toEqual({ jumlahSesi: 0, awal: null, akhir: null, terbaik: null, target: null, sesiCapaiTarget: 0 });
  });

  it("puncak kosong tetap jadi titik (null)", () => {
    expect(seriProgres([sesi(BUDI, "2026-11-10T02:00:00.000Z", [g("angkat_samping", null)])], "angkat_samping")[0].puncak).toBeNull();
  });
});

describe("kepatuhanHarian", () => {
  it("grid 28 hari berakhir hari ini, dibagi 4 minggu", () => {
    const k = kepatuhanHarian(
      [
        { mulai: "2026-11-18T01:00:00.000Z", dihentikan_nyeri: false },
        { mulai: "2026-11-18T05:00:00.000Z", dihentikan_nyeri: true },
        { mulai: "2026-11-12T01:00:00.000Z", dihentikan_nyeri: false },
        { mulai: "2026-10-01T01:00:00.000Z", dihentikan_nyeri: false }, // di luar jendela
      ],
      SEKARANG,
    );
    expect(k.hari).toHaveLength(28);
    expect(k.hari.at(-1)).toEqual({ tanggal: "2026-11-18", jumlahSesi: 2, nyeri: true });
    expect(k.hari[0].tanggal).toBe("2026-10-22");
    expect(k.hariLatihan).toBe(2);
    expect(k.perMinggu).toHaveLength(4);
    expect(k.perMinggu.at(-1)).toEqual({ mulai: "2026-11-12", selesai: "2026-11-18", jumlahSesi: 3, hariLatihan: 2 });
    expect(k.perMinggu[0].jumlahSesi).toBe(0);
  });

  it("tanpa sesi → semua nol", () => {
    const k = kepatuhanHarian([], SEKARANG, 14);
    expect(k.hariLatihan).toBe(0);
    expect(k.perMinggu.map((m) => m.jumlahSesi)).toEqual([0, 0]);
  });
});

describe("statusPasien", () => {
  const dasar = { aktif: true, nyeriTerbuka: 0, terakhirSesi: "2026-11-17T02:00:00.000Z", sekarang: SEKARANG };
  it("nyeri terbuka paling diutamakan, walau link nonaktif", () => {
    expect(statusPasien({ ...dasar, nyeriTerbuka: 1, aktif: false })).toBe("nyeri");
  });
  it("nonaktif, belum mulai, jeda, rutin", () => {
    expect(statusPasien({ ...dasar, aktif: false })).toBe("nonaktif");
    expect(statusPasien({ ...dasar, terakhirSesi: null })).toBe("belum_mulai");
    expect(statusPasien({ ...dasar, terakhirSesi: "2026-11-15T02:00:00.000Z" })).toBe("tidak_latihan");
    expect(statusPasien({ ...dasar, terakhirSesi: "2026-11-16T02:00:00.000Z" })).toBe("baik");
    expect(statusPasien(dasar)).toBe("baik");
  });
});

describe("barisDaftarPasien & angkaDashboard", () => {
  const pasien = [
    { id: SITI, nama_tampilan: "Bu Siti", sisi_dilatih: "kiri", aktif: true, is_demo: true },
    { id: BUDI, nama_tampilan: "Pak Budi", sisi_dilatih: "kanan", aktif: true, is_demo: true },
  ];
  const data = [
    sesi(BUDI, "2026-11-05T02:00:00.000Z"),
    sesi(BUDI, "2026-11-17T02:00:00.000Z", [g("angkat_samping", 104), g("tekuk_siku", 100, 120)]),
    sesi(BUDI, "2026-11-17T08:00:00.000Z", [g("angkat_samping", 99)]),
    sesi(SITI, "2026-11-10T02:00:00.000Z"),
  ];
  const baris = barisDaftarPasien({ pasien, sesi: data, nyeriTerbuka: [{ pasien_id: BUDI }], sekarang: SEKARANG });

  it("yang perlu ditinjau di atas, dengan hitungan 7 hari", () => {
    expect(baris.map((b) => [b.nama, b.status])).toEqual([
      ["Pak Budi", "nyeri"],
      ["Bu Siti", "tidak_latihan"],
    ]);
    expect(baris[0].sesi7Hari).toBe(2);
    expect(baris[0].terakhirSesi).toBe("2026-11-17T08:00:00.000Z");
    expect(baris[1].sesi7Hari).toBe(0);
  });

  it("sorotan = gerakan dengan capaian terendah di sesi terakhir", () => {
    const b = barisDaftarPasien({ pasien, sesi: data.slice(0, 2), nyeriTerbuka: [], sekarang: SEKARANG });
    expect(b.find((x) => x.id === BUDI)?.sorotan).toEqual({ kode: "tekuk_siku", nama: "Tekuk siku", puncak: 100, target: 120 });
  });

  it("sesi terakhir tanpa data gerakan (langsung dihentikan) → pakai sesi sebelumnya", () => {
    const kosong = sesi(BUDI, "2026-11-18T01:00:00.000Z", [], true);
    const b = barisDaftarPasien({ pasien, sesi: [...data.slice(0, 2), kosong], nyeriTerbuka: [], sekarang: SEKARANG });
    expect(b.find((x) => x.id === BUDI)?.sorotan?.kode).toBe("tekuk_siku");
    expect(b.find((x) => x.id === BUDI)?.terakhirSesi).toBe(kosong.mulai);
  });

  it("angka ringkas: kepatuhan = hari unik berlatih ÷ 7 per pasien aktif", () => {
    expect(angkaDashboard(baris, data, SEKARANG)).toEqual({ pasienAktif: 2, sesi7Hari: 2, persenKepatuhan: 7, perluTindakLanjut: 2 });
    expect(angkaDashboard([], [], SEKARANG).persenKepatuhan).toBeNull();
  });

  it("aktivitas terbaru: paling baru dulu, total repetisi", () => {
    const a = aktivitasTerbaru(data, new Map([[BUDI, "Pak Budi"]]), 2);
    expect(a.map((x) => x.mulai)).toEqual(["2026-11-17T08:00:00.000Z", "2026-11-17T02:00:00.000Z"]);
    expect(a[1]).toMatchObject({ nama: "Pak Budi", repetisi: 20, repetisiTarget: 20, capaiTarget: 6 });
    expect(aktivitasTerbaru(data, new Map(), 10).at(-1)?.nama).toBe("Pasien");
  });
});

describe("tautan", () => {
  it("link pasien & WhatsApp", () => {
    expect(tautanPasien("https://gp.app/", "abc_DEF-123")).toBe("https://gp.app/mulai/abc_DEF-123");
    const wa = tautanWhatsApp("Pak Budi", "https://gp.app/mulai/x");
    expect(wa.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(wa.split("text=")[1])).toContain("https://gp.app/mulai/x");
  });
});

describe("gabungNyeri", () => {
  const k = (id: string, terjadi_pada: string, ditindaklanjuti: boolean) => ({ id, terjadi_pada, ditindaklanjuti });

  it("semua yang terbuka di atas (tanpa batas), lalu riwayat; terbaru dulu, tanpa duplikat", () => {
    const terbuka = Array.from({ length: 25 }, (_, i) => k(`b${i}`, `2026-10-${String(i + 1).padStart(2, "0")}T01:00:00.000Z`, false));
    const riwayat = [k("r1", "2026-11-10T01:00:00.000Z", true), k("r2", "2026-11-12T01:00:00.000Z", true)];
    const h = gabungNyeri(terbuka, riwayat);
    expect(h).toHaveLength(27);
    expect(h.slice(0, 25).every((x) => !x.ditindaklanjuti)).toBe(true);
    expect(h[0].id).toBe("b24");
    expect(h.slice(25).map((x) => x.id)).toEqual(["r2", "r1"]);
  });

  it("mengabaikan baris yang salah kelompok", () => {
    const h = gabungNyeri([k("a", "2026-11-01T00:00:00.000Z", true)], [k("b", "2026-11-02T00:00:00.000Z", false)]);
    expect(h).toEqual([]);
  });
});

describe("ringkasanUsang", () => {
  const dibuat = "2026-11-15T10:00:00.000Z";
  it("nyeri baru diutamakan, lalu sesi baru, selain itu null", () => {
    const nyeriBaru = [{ terjadi_pada: "2026-11-16T01:00:00.000Z" }];
    expect(ringkasanUsang({ dibuat, nyeriTerbuka: nyeriBaru, sesiTerakhir: "2026-11-17T01:00:00.000Z" })).toBe("nyeri");
    expect(ringkasanUsang({ dibuat, nyeriTerbuka: [{ terjadi_pada: "2026-11-01T01:00:00.000Z" }], sesiTerakhir: "2026-11-17T01:00:00.000Z" })).toBe("sesi");
    expect(ringkasanUsang({ dibuat, nyeriTerbuka: [], sesiTerakhir: "2026-11-14T01:00:00.000Z" })).toBeNull();
    expect(ringkasanUsang({ dibuat, nyeriTerbuka: [], sesiTerakhir: null })).toBeNull();
  });
});

describe("label status", () => {
  it("tanpa sesi dalam jendela data tidak diklaim 'belum mulai'", () => {
    expect(LABEL_STATUS.belum_mulai).toBe("Belum ada sesi");
  });
});
