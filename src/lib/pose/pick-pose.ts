import { LM, type Landmark } from "./landmarks";

export type Pusat = { x: number; y: number };

const pusatBahu = (l: readonly Landmark[]): Pusat => ({
  x: (l[LM.BAHU_KIRI].x + l[LM.BAHU_KANAN].x) / 2,
  y: (l[LM.BAHU_KIRI].y + l[LM.BAHU_KANAN].y) / 2,
});

/** Memilih satu orang dari beberapa yang terdeteksi dan lock */
export function pilihOrang(daftar: readonly (readonly Landmark[])[], kunci: Pusat | null): { indeks: number; kunci: Pusat | null } {
  if (!daftar.length) return { indeks: -1, kunci };
  let indeks = 0;
  if (daftar.length > 1) {
    if (kunci) {
      let terdekat = Infinity;
      daftar.forEach((l, i) => {
        const c = pusatBahu(l);
        const d = Math.hypot(c.x - kunci.x, c.y - kunci.y);
        if (d < terdekat) {
          terdekat = d;
          indeks = i;
        }
      });
    } else {
      let terlebar = -1;
      daftar.forEach((l, i) => {
        const w = Math.abs(l[LM.BAHU_KIRI].x - l[LM.BAHU_KANAN].x);
        if (w > terlebar) {
          terlebar = w;
          indeks = i;
        }
      });
    }
  }
  return { indeks, kunci: pusatBahu(daftar[indeks]) };
}
