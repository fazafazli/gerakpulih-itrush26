import { describe, expect, it } from "vitest";
import {
  dariFormPasienBaru,
  dariFormProgram,
  PasienBaruSchema,
  pesanGalatDb,
  ProgramSchema,
} from "@/lib/terapis/schema";

const PASIEN = "11111111-2222-4333-8444-555555555555";

const form = (isi: [string, string][]) => {
  const fd = new FormData();
  for (const [k, v] of isi) fd.append(k, v);
  return fd;
};

describe("PasienBaruSchema", () => {
  it("menerima data valid, catatan kosong → null, nama dipangkas", () => {
    const fd = form([
      ["nama_tampilan", "  Pak Budi "],
      ["sisi_dilatih", "kanan"],
      ["catatan", "  "],
      ["gerakan", "angkat_samping"],
      ["gerakan", "tekuk_siku"],
    ]);
    const h = PasienBaruSchema.parse(dariFormPasienBaru(fd));
    expect(h).toEqual({ nama_tampilan: "Pak Budi", sisi_dilatih: "kanan", catatan: null, gerakan: ["angkat_samping", "tekuk_siku"] });
  });

  it("menolak nama kosong/terlalu panjang, sisi asing, tanpa gerakan, gerakan asing", () => {
    const dasar = { nama_tampilan: "Bu Siti", sisi_dilatih: "kiri", catatan: "", gerakan: ["angkat_depan"] };
    expect(PasienBaruSchema.safeParse({ ...dasar, nama_tampilan: " " }).success).toBe(false);
    expect(PasienBaruSchema.safeParse({ ...dasar, nama_tampilan: "x".repeat(61) }).success).toBe(false);
    expect(PasienBaruSchema.safeParse({ ...dasar, sisi_dilatih: "keduanya" }).success).toBe(false);
    expect(PasienBaruSchema.safeParse({ ...dasar, gerakan: [] }).success).toBe(false);
    expect(PasienBaruSchema.safeParse({ ...dasar, gerakan: ["lompat"] }).success).toBe(false);
    expect(PasienBaruSchema.safeParse({ ...dasar, catatan: "x".repeat(281) }).success).toBe(false);
  });
});

describe("ProgramSchema", () => {
  const isi = (o: Record<string, string> = {}) =>
    form(
      Object.entries({
        pasien_id: PASIEN,
        "angkat_samping.aktif": "on",
        "angkat_samping.target_sudut": "95",
        "angkat_samping.repetisi": "12",
        "angkat_samping.urutan": "1",
        "tekuk_siku.target_sudut": "120",
        "tekuk_siku.repetisi": "10",
        "tekuk_siku.urutan": "2",
        ...o,
      }),
    );

  it("membaca form: checkbox kosong = nonaktif, gerakan tanpa field dilewati", () => {
    const h = ProgramSchema.parse(dariFormProgram(isi()));
    expect(h.gerakan).toEqual([
      { kode_gerakan: "angkat_samping", aktif: true, target_sudut: 95, repetisi: 12, urutan: 1 },
      { kode_gerakan: "tekuk_siku", aktif: false, target_sudut: 120, repetisi: 10, urutan: 2 },
    ]);
  });

  it("batas sama dengan CHECK database", () => {
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.target_sudut": "9" }))).success).toBe(false);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.target_sudut": "181" }))).success).toBe(false);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.repetisi": "0" }))).success).toBe(false);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.repetisi": "51" }))).success).toBe(false);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.repetisi": "" }))).success).toBe(false);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.target_sudut": "90.5" }))).success).toBe(false);
  });

  it("minimal satu gerakan aktif & pasien_id harus uuid", () => {
    const r = ProgramSchema.safeParse(dariFormProgram(isi({ "angkat_samping.aktif": "" })));
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/minimal satu gerakan/);
    expect(ProgramSchema.safeParse(dariFormProgram(isi({ pasien_id: "x" }))).success).toBe(false);
  });
});

describe("pesanGalatDb", () => {
  it("galat pelindung demo → pesan khusus, lainnya → pesan umum tanpa detail teknis", () => {
    expect(pesanGalatDb({ code: "P0001", message: "pasien_demo_terlindungi" })).toMatch(/Pasien contoh/);
    expect(pesanGalatDb({ code: "42501", message: "permission denied for table pasien" })).not.toMatch(/permission/);
    expect(pesanGalatDb(null)).toMatch(/Gagal menyimpan/);
  });
});
