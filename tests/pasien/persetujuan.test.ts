import { describe, expect, it } from "vitest";
import { perluCatatPersetujuan, sudahSetuju, tujuanSetelahSetuju, VERSI_PERSETUJUAN } from "@/lib/pasien/persetujuan";

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
