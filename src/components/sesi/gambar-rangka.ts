import { LM, keyakinan, sendiSisi, type Landmark, type Sisi } from "@/lib/pose/landmarks";

export const WARNA_RANGKA = { normal: "#2E90FA", kompensasi: "#F79009", redup: "rgba(255,255,255,0.55)" } as const;

/**
 * Menggambar lengan yang dilatih + garis bahu di atas video (bukan seluruh 33 titik:
 * pasien cukup melihat bagian yang dinilai). Kanvas berukuran sama dengan video.
 */
export function gambarRangka(
  ctx: CanvasRenderingContext2D,
  landmark: readonly Landmark[] | null,
  sisi: Sisi,
  warna: string = WARNA_RANGKA.normal,
): void {
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  if (!landmark) return;

  const s = sendiSisi(sisi);
  const titik = (i: number) => {
    const p = landmark[i];
    return p && keyakinan(p) > 0.3 ? { x: p.x * w, y: p.y * h } : null;
  };
  const tebal = Math.max(4, w / 90);
  const garis = (a: number, b: number, c: string, lebar: number) => {
    const p = titik(a);
    const q = titik(b);
    if (!p || !q) return;
    ctx.strokeStyle = c;
    ctx.lineWidth = lebar;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  };

  garis(LM.BAHU_KIRI, LM.BAHU_KANAN, WARNA_RANGKA.redup, tebal * 0.6);
  garis(s.bahu, s.pinggul, WARNA_RANGKA.redup, tebal * 0.6);
  garis(s.bahu, s.siku, warna, tebal);
  garis(s.siku, s.pergelangan, warna, tebal);

  for (const i of [s.bahu, s.siku, s.pergelangan]) {
    const p = titik(i);
    if (!p) continue;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, tebal * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = warna;
    ctx.beginPath();
    ctx.arc(p.x, p.y, tebal * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}
