"use client";

import { useEffect, useRef } from "react";
import { kemiringanHp } from "@/lib/pose/readiness";

/**
 * Kemiringan HP (derajat) dari sensor orientasi, disimpan di ref agar tidak memicu render tiap event.
 * Laptop / iPhone tanpa izin sensor → tetap null, dan pemeriksaan "HP tegak" dilewati.
 */
export function useKemiringanHp(aktif: boolean) {
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!aktif || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    const saatBerubah = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      ref.current = kemiringanHp(e.beta, e.gamma, window.screen.orientation?.angle ?? 0);
    };
    window.addEventListener("deviceorientation", saatBerubah);
    return () => {
      window.removeEventListener("deviceorientation", saatBerubah);
      ref.current = null;
    };
  }, [aktif]);

  return ref;
}
