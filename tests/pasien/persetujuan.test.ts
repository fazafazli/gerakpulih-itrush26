import { describe, expect, it } from "vitest";
import { modePrivasi, perluCatatPersetujuan, sudahSetuju, tujuanSetelahSetuju, VERSI_PERSETUJUAN } from "@/lib/pasien/persetujuan";

describe("persetujuan privasi", () => {
  it("cookie: hanya versi berlaku atau lebih baru yang dianggap setuju", () => {
    expect(VERSI_PERSETUJUAN).toBe("v1");
    expect(sudahSetuju("v1")).toBe(true);
    expect(sudahSetuju("v2")).toBe(true);
    expect(sudahSetuju("v0")).toBe(false);
    expect(sudahSetuju("ya")).toBe(false);
    expect(sudahSetuju(undefined)).toBe(false);
  });

  it("database: diisi bila kosong/versi lama; persetujuan yang sudah ada tidak ditimpa", () => {
    expect(perluCatatPersetujuan(null)).toBe(true);
    expect(perluCatatPersetujuan("v0")).toBe(true);
    expect(perluCatatPersetujuan("v1")).toBe(false);
    expect(perluCatatPersetujuan("v2")).toBe(false);
  });

  it("tujuan setelah setuju hanya halaman pasien yang dikenal", () => {
    expect(tujuanSetelahSetuju("/sesi")).toBe("/sesi");
    expect(tujuanSetelahSetuju("https://jahat.example")).toBe("/beranda");
    expect(tujuanSetelahSetuju("//jahat.example")).toBe("/beranda");
    expect(tujuanSetelahSetuju(null)).toBe("/beranda");
  });
});

describe("modePrivasi (halaman /privasi publik)", () => {
  it("tanpa cookie pasien sah → hanya baca, apa pun cookie persetujuannya", () => {
    expect(modePrivasi({ pasienSah: false, nilaiCookieSetuju: undefined })).toBe("baca");
    expect(modePrivasi({ pasienSah: false, nilaiCookieSetuju: "v1" })).toBe("baca");
  });

  it("pasien sah → form bila belum setuju (atau versi lama), 'sudah' bila setuju versi berlaku", () => {
    expect(modePrivasi({ pasienSah: true, nilaiCookieSetuju: null })).toBe("form");
    expect(modePrivasi({ pasienSah: true, nilaiCookieSetuju: "v0" })).toBe("form");
    expect(modePrivasi({ pasienSah: true, nilaiCookieSetuju: "v1" })).toBe("sudah");
  });
});
