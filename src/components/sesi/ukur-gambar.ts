import type { Landmark } from "@/lib/pose/landmarks";
import { hitungStatistikGambar, type StatistikGambar } from "@/lib/pose/readiness";

const LEBAR = 160;

/**
 * Memperkecil frame video ke 160 px lalu menghitung kecerahan & ketajaman.
 * Gambar kecil ini hanya ada di memori sesaat — tidak disimpan dan tidak dikirim.
 */
export function ukurGambar(video: HTMLVideoElement, kanvas: HTMLCanvasElement, landmark: readonly Landmark[] | null): StatistikGambar | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const tinggi = Math.max(1, Math.round((LEBAR * video.videoHeight) / video.videoWidth));
  if (kanvas.width !== LEBAR) kanvas.width = LEBAR;
  if (kanvas.height !== tinggi) kanvas.height = tinggi;
  const ctx = kanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, LEBAR, tinggi);
  return hitungStatistikGambar(ctx.getImageData(0, 0, LEBAR, tinggi).data, LEBAR, tinggi, landmark);
}
