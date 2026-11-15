import { describe, expect, it } from "vitest";
import { GERAKAN, haluskan, hitungMetrik, KODE_GERAKAN, median, sudut3 } from "@/lib/pose";
import { KODE_GERAKAN as KODE_AI } from "@/lib/ai/schema";
import { LEBAR, TINGGI, tubuh } from "./helpers";

describe("geometri", () => {
  it("sudut3 menghitung sudut siku-siku & lurus", () => {
    expect(sudut3([1, 0, 0], [0, 0, 0], [0, 1, 0])).toBeCloseTo(90);
    expect(sudut3([1, 0, 0], [0, 0, 0], [-1, 0, 0])).toBeCloseTo(180);
    expect(sudut3([0, 0, 0], [0, 0, 0], [1, 0, 0])).toBeNaN();
  });

  it("median mengabaikan NaN; haluskan meredam lonjakan", () => {
    expect(median([3, Number.NaN, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(haluskan(null, 50, 0.35)).toBe(50);
    expect(haluskan(50, 100, 0.35)).toBeCloseTo(67.5);
    expect(haluskan(50, Number.NaN, 0.35)).toBe(50);
  });
});

describe("hitungMetrik", () => {
  const ukur = (opsi: Parameters<typeof tubuh>[0], gerakan = GERAKAN.angkat_samping, acuan: "otomatis" | "vertikal" | "pinggul" = "otomatis") =>
    hitungMetrik({ landmark: tubuh(opsi), gerakan, sisi: "kanan", lebar: LEBAR, tinggi: TINGGI, acuan });

  it.each([0, 45, 90, 120])("elevasi bahu %i° terukur akurat (±2°)", (d) => {
    expect(ukur({ bahuKanan: d }).nilai).toBeCloseTo(d, 0);
  });

  it("memakai acuan pinggul bila terlihat, vertikal bila tertutup", () => {
    expect(ukur({ bahuKanan: 90 }).acuan).toBe("pinggul");
    const tertutup = ukur({ bahuKanan: 90, keyakinanPinggul: 0.2 });
    expect(tertutup.acuan).toBe("vertikal");
    expect(tertutup.nilai).toBeCloseTo(90, 0);
  });

  it("fleksi siku: 0 lurus, makin besar makin tertekuk", () => {
    expect(ukur({ sikuKanan: 0 }, GERAKAN.tekuk_siku).nilai).toBeCloseTo(0, 0);
    expect(ukur({ sikuKanan: 110 }, GERAKAN.tekuk_siku).nilai).toBeCloseTo(110, 0);
    expect(ukur({}, GERAKAN.tekuk_siku).acuan).toBe("tidak_perlu");
  });

  it("melaporkan keyakinan sendi lengan", () => {
    expect(ukur({ keyakinan: 0.3 }).keyakinan).toBeCloseTo(0.3);
  });

  it("daftar kode gerakan sama dengan modul AI & database", () => {
    expect([...KODE_GERAKAN]).toEqual([...KODE_AI]);
  });
});
