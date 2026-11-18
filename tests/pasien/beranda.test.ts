import { describe, expect, it } from "vitest";
import { namaHariPendek, ringkasMingguIni } from "@/lib/pasien/beranda";

// Rabu 18 Nov 2026, 10.00 WIB
const SEKARANG = new Date("2026-11-18T03:00:00.000Z");

describe("ringkasMingguIni", () => {
  it("7 hari berakhir hari ini (WIB), menghitung semua sesi dalam jendela", () => {
    const r = ringkasMingguIni(
      [
        "2026-11-18T01:00:00.000Z",
        "2026-11-17T18:00:00.000Z", // 18 Nov 01.00 WIB
        "2026-11-13T02:00:00.000Z",
        "2026-11-11T16:59:00.000Z", // 11 Nov 23.59 WIB: di luar jendela
      ],
      SEKARANG,
    );
    expect(r.hari.map((h) => h.tanggal)).toEqual(["2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18"]);
    expect(r.jumlah).toBe(3);
    expect(r.hariIni).toBe(true);
    expect(r.hari.filter((h) => h.ada).map((h) => h.tanggal)).toEqual(["2026-11-13", "2026-11-18"]);
  });

  it("tanpa sesi", () => {
    expect(ringkasMingguIni([], SEKARANG)).toMatchObject({ jumlah: 0, hariIni: false });
  });

  it("nama hari pendek", () => {
    expect(namaHariPendek("2026-11-18")).toBe("Rab");
    expect(namaHariPendek("2026-11-15")).toBe("Min");
  });
});
