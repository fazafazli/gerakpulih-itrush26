"use client";

import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { type RefObject, useEffect, useEffectEvent } from "react";
import type { MesinPose } from "@/lib/pose/engine";

export type BingkaiMentah = {
  hasil: PoseLandmarkerResult;
  video: HTMLVideoElement;
  lebar: number;
  tinggi: number;
  /** performance.now() saat frame diproses. */
  t: number;
};

/**
 * Loop deteksi: satu frame video baru → satu deteksi, dibatasi `fpsMaks` agar HP tidak panas.
 * Callback dibungkus useEffectEvent sehingga selalu membaca state terbaru tanpa memulai ulang loop.
 */
export function useLoopPose(args: {
  videoRef: RefObject<HTMLVideoElement | null>;
  mesin: MesinPose | null;
  berjalan: boolean;
  fpsMaks?: number;
  onBingkai: (b: BingkaiMentah) => void;
}) {
  const { videoRef, mesin, berjalan, fpsMaks = 24 } = args;
  const onBingkai = useEffectEvent(args.onBingkai);

  useEffect(() => {
    if (!berjalan || !mesin) return;
    let id = 0;
    let terakhir = -Infinity;
    let waktuVideo = -1;
    const selangMin = 1000 / fpsMaks;

    const langkah = (t: number) => {
      id = requestAnimationFrame(langkah);
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;
      if (t - terakhir < selangMin || video.currentTime === waktuVideo) return;
      terakhir = t;
      waktuVideo = video.currentTime;
      let hasil: PoseLandmarkerResult;
      try {
        hasil = mesin.deteksi(video, t);
      } catch {
        return; // satu frame gagal tidak menghentikan latihan
      }
      onBingkai({ hasil, video, lebar: video.videoWidth, tinggi: video.videoHeight, t });
    };

    id = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(id);
  }, [berjalan, mesin, fpsMaks, videoRef]);
}
