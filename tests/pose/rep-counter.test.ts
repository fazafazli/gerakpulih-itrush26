import { describe, expect, it } from "vitest";
import { type KejadianRepetisi, type KonfigRepetisi, perbaruiRepetisi, type StatusRepetisi, statusRepetisiAwal } from "@/lib/pose";
import { lintasanRepetisi } from "./helpers";

const KONFIG: KonfigRepetisi = { amplitudoMin: 35, persenKembali: 0.65, durasiMinMs: 600, targetSudut: 90 };

function jalankan(nilai: number[], dtMs = 50, awal: StatusRepetisi = statusRepetisiAwal()) {
  let s = awal;
  let t = 0;
  for (const v of nilai) {
    s = perbaruiRepetisi(s, v, false, t, KONFIG).status;
    t += dtMs;
  }
  return s;
}

const ulangi = (n: number, f: () => number[]) => Array.from({ length: n }, f).flat();

describe("penghitung repetisi relatif", () => {
  it("menghitung 10 repetisi dengan tangan istirahat di samping badan (≈10°)", () => {
    const s = jalankan(ulangi(10, () => [...lintasanRepetisi(10, 100), ...Array(15).fill(10)]));
    expect(s.jumlah).toBe(10);
    expect(s.capaiTarget).toBe(10);
  });

  it("menghitung 10 repetisi dengan tangan istirahat di paha (≈35°) — bug v1", () => {
    const s = jalankan(ulangi(10, () => [...lintasanRepetisi(35, 110), ...Array(15).fill(35)]));
    expect(s.jumlah).toBe(10);
  });

  it("tidak menghitung getaran/gerak kecil", () => {
    const getar = Array.from({ length: 2000 }, (_, i) => 35 + Math.sin(i * 1.7) * 6);
    expect(jalankan(getar).jumlah).toBe(0);
  });

  it("mengabaikan gerakan yang terlalu cepat (< 600 ms)", () => {
    const s = jalankan([...lintasanRepetisi(10, 100, 8), ...Array(10).fill(10)]);
    expect(s.jumlah).toBe(0);
  });

  it("mencatat repetisi yang tidak mencapai target", () => {
    const s = jalankan(ulangi(3, () => [...lintasanRepetisi(10, 70), ...Array(15).fill(10)]));
    expect(s.jumlah).toBe(3);
    expect(s.capaiTarget).toBe(0);
  });

  it("mencatat kompensasi yang terjadi kapan pun selama fase naik", () => {
    let s = statusRepetisiAwal();
    const lintasan = [...lintasanRepetisi(10, 100), ...Array(10).fill(10)];
    let kejadian: KejadianRepetisi | undefined;
    lintasan.forEach((v, i) => {
      const r = perbaruiRepetisi(s, v, i === 20, i * 50, KONFIG);
      s = r.status;
      kejadian ??= r.repetisi;
    });
    expect(kejadian?.kompensasi).toBe(true);
    expect(s.denganKompensasi).toBe(1);
  });

  it("memakai lembah dari kalibrasi", () => {
    const s = jalankan([...lintasanRepetisi(40, 120), ...Array(15).fill(40)], 50, statusRepetisiAwal(40));
    expect(s.jumlah).toBe(1);
    expect(s.daftarPuncak[0]).toBeGreaterThan(115);
  });
});
