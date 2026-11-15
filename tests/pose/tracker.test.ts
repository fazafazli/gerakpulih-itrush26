import { describe, expect, it } from "vitest";
import { PelacakGerakan, suaraRepetisi, type Bingkai } from "@/lib/pose";
import { LEBAR, lintasanRepetisi, TINGGI, tubuh, type OpsiTubuh } from "./helpers";

/** Simulasi sesi: kalibrasi 3 detik lalu beberapa repetisi */
function simulasi(opsi: { repetisi: number; istirahat: number; puncak: number; tambahan?: (i: number) => OpsiTubuh; pinggul?: number }) {
  const p = new PelacakGerakan({ gerakan: "angkat_samping", sisi: "kanan", targetSudut: 90 });
  let t = 0;
  const frame = (o: OpsiTubuh): Bingkai => ({ landmark: [tubuh({ keyakinanPinggul: opsi.pinggul, ...o })], lebar: LEBAR, tinggi: TINGGI, t: (t += 50) });
  const suara: string[] = [];

  p.mulaiKalibrasi(t);
  let kalibrasi;
  for (let i = 0; i < 70; i++) kalibrasi = p.proses(frame({ bahuKanan: opsi.istirahat })).baselineBaru ?? kalibrasi;

  for (let r = 0; r < opsi.repetisi; r++) {
    const lintasan = [...lintasanRepetisi(opsi.istirahat, opsi.puncak), ...Array(15).fill(opsi.istirahat)];
    lintasan.forEach((sudut, i) => {
      const k = p.proses(frame({ bahuKanan: sudut, ...opsi.tambahan?.(i) }));
      if (k.repetisiBaru) suara.push(suaraRepetisi(k.repetisiBaru, k.repetisiBaru.alasanKompensasi, true));
    });
  }
  return { p, kalibrasi, suara };
}

describe("PelacakGerakan (integrasi)", () => {
  it("kalibrasi → 10 repetisi → ringkasan siap disimpan ke sesi_gerakan", () => {
    const { p, kalibrasi, suara } = simulasi({ repetisi: 10, istirahat: 12, puncak: 100 });
    expect(kalibrasi?.nilai).toBeCloseTo(12, 0);
    const r = p.ringkasan();
    expect(r.repetisi_selesai).toBe(10);
    expect(r.rep_capai_target).toBe(10);
    expect(r.rep_kompensasi).toBe(0);
    expect(r.puncak_maks).toBeGreaterThan(95);
    expect(suara[0]).toBe("satu");
    expect(suara[9]).toBe("sepuluh");
  });

  it("tetap menghitung saat pinggul tertutup meja (acuan vertikal)", () => {
    const { p } = simulasi({ repetisi: 5, istirahat: 12, puncak: 100, pinggul: 0.2 });
    expect(p.ringkasan().repetisi_selesai).toBe(5);
  });

  it("badan ikut miring saat mengangkat → repetisi ditandai & suara mengingatkan", () => {
    const { p, suara } = simulasi({
      repetisi: 3,
      istirahat: 12,
      puncak: 100,
      tambahan: (i) => (i > 8 && i < 32 ? { miring: 15 } : {}),
    });
    expect(p.ringkasan().rep_kompensasi).toBe(3);
    expect(suara[0]).toMatch(/tegak/);
  });

  it("tidak ada orang → keluaran aman tanpa sudut", () => {
    const p = new PelacakGerakan({ gerakan: "tekuk_siku", sisi: "kanan", targetSudut: 120 });
    const k = p.proses({ landmark: [], lebar: LEBAR, tinggi: TINGGI, t: 0 });
    expect(k.adaOrang).toBe(false);
    expect(k.sudut).toBeNull();
    expect(p.ringkasan().puncak_maks).toBeNull();
  });
});
