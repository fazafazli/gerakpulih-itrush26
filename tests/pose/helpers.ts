import { JUMLAH_LANDMARK, LM, type Landmark } from "@/lib/pose";

export const LEBAR = 640;
export const TINGGI = 480;
const rad = (d: number) => (d * Math.PI) / 180;

export type OpsiTubuh = {
  /** Elevasi lengan kanan pasien dari posisi turun (0) ke samping (90). */
  bahuKanan?: number;
  /** Fleksi siku kanan: 0 lurus. */
  sikuKanan?: number;
  /** Kemiringan badan ke samping (derajat). */
  miring?: number;
  /** Bahu kanan terangkat (piksel). */
  shrug?: number;
  /** Geser seluruh tubuh (piksel). */
  geserX?: number;
  skala?: number;
  keyakinanPinggul?: number;
  keyakinan?: number;
};

/** Tubuh duduk menghadap kamera di bingkai 640×480 (koordinat ternormalisasi).
 * Sisi KANAN pasien tampil di KIRI gambar (x lebih kecil). */
export function tubuh(o: OpsiTubuh = {}): Landmark[] {
  const { bahuKanan = 10, sikuKanan = 0, miring = 0, shrug = 0, geserX = 0, skala = 1, keyakinanPinggul = 0.99, keyakinan = 0.99 } = o;
  const cx = 320 + geserX;
  const pinggulY = 330;
  const titik: Record<number, [number, number]> = {};

  const putar = (dx: number, dy: number): [number, number] => {
    const a = rad(miring);
    return [cx + (dx * Math.cos(a) - dy * Math.sin(a)) * skala, pinggulY + (dx * Math.sin(a) + dy * Math.cos(a)) * skala];
  };
  titik[LM.PINGGUL_KANAN] = [cx - 50 * skala, pinggulY];
  titik[LM.PINGGUL_KIRI] = [cx + 50 * skala, pinggulY];
  titik[LM.BAHU_KANAN] = putar(-50, -150 - shrug);
  titik[LM.BAHU_KIRI] = putar(50, -150);
  titik[LM.TELINGA_KANAN] = putar(-20, -205);
  titik[LM.TELINGA_KIRI] = putar(20, -205);
  titik[LM.HIDUNG] = putar(0, -195);

  // lengan kanan
  const [bx, by] = titik[LM.BAHU_KANAN];
  const arahLengan = rad(bahuKanan);
  const siku: [number, number] = [bx - Math.sin(arahLengan) * 80 * skala, by + Math.cos(arahLengan) * 80 * skala];
  const arahLengkung = arahLengan + rad(sikuKanan);
  titik[LM.SIKU_KANAN] = siku;
  titik[LM.PERGELANGAN_KANAN] = [siku[0] - Math.sin(arahLengkung) * 70 * skala, siku[1] + Math.cos(arahLengkung) * 70 * skala];

  // lengan kiri tetap turun
  const [kx, ky] = titik[LM.BAHU_KIRI];
  titik[LM.SIKU_KIRI] = [kx + 5, ky + 80 * skala];
  titik[LM.PERGELANGAN_KIRI] = [kx + 8, ky + 150 * skala];

  return Array.from({ length: JUMLAH_LANDMARK }, (_, i) => {
    const p = titik[i] ?? [cx, pinggulY + 60];
    const pinggul = i === LM.PINGGUL_KIRI || i === LM.PINGGUL_KANAN;
    return { x: p[0] / LEBAR, y: p[1] / TINGGI, z: 0, visibility: pinggul ? keyakinanPinggul : keyakinan };
  });
}

/** Gambar RGBA polos untuk uji statistik gambar. */
export function gambarPolos(lebar: number, tinggi: number, nilai: number): Uint8ClampedArray {
  const d = new Uint8ClampedArray(lebar * tinggi * 4);
  for (let i = 0; i < lebar * tinggi; i++) {
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = nilai;
    d[i * 4 + 3] = 255;
  }
  return d;
}

/** Urutan sudut satu repetisi (naik lalu turun) dengan derau kecil yang deterministik. */
export function lintasanRepetisi(istirahat: number, puncak: number, frame = 40): number[] {
  return Array.from({ length: frame }, (_, i) => istirahat + (puncak - istirahat) * Math.sin((Math.PI * i) / (frame - 1)) + Math.sin(i * 7.3) * 1.5);
}
