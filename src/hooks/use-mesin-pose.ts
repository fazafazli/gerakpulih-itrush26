"use client";

import { useCallback, useEffect, useState } from "react";
import type { MesinPose, VarianModel } from "@/lib/pose/engine";
import { modelAwal } from "@/lib/sesi/pemantau";

const URUTAN_TURUN: Record<VarianModel, VarianModel | null> = { heavy: "full", full: "lite", lite: null };

type Hasil = { tingkat: number; mesin: MesinPose | null; galat: string | null };

/**
 * Memuat MediaPipe Pose sekali, lalu dapat diturunkan ke model lebih ringan bila HP tersendat.
 * engine.ts di-import dinamis agar MediaPipe (browser-only) tidak pernah ikut dijalankan di server.
 * Dimulai segera saat halaman dibuka supaya model (± 6–9 MB) sudah siap ketika pasien selesai membaca panduan.
 */
export function useMesinPose() {
  const [tingkat, setTingkat] = useState(0);
  const [percobaan, setPercobaan] = useState(0);
  const [hasil, setHasil] = useState<Hasil | null>(null);

  useEffect(() => {
    let batal = false;
    let dibuat: MesinPose | null = null;

    (async () => {
      const { buatMesinPose } = await import("@/lib/pose/engine");
      const nav = navigator as Navigator & { deviceMemory?: number };
      let model: VarianModel = modelAwal({ inti: nav.hardwareConcurrency, memoriGb: nav.deviceMemory });
      for (let i = 0; i < tingkat; i++) model = URUTAN_TURUN[model] ?? model;
      const mesin = await buatMesinPose({ model });
      if (batal) {
        mesin.tutup();
        return;
      }
      dibuat = mesin;
      setHasil({ tingkat, mesin, galat: null });
    })().catch(() => {
      if (!batal) setHasil({ tingkat, mesin: null, galat: "Pendeteksi gerak gagal dimuat. Periksa internet, lalu coba lagi." });
    });

    return () => {
      batal = true;
      dibuat?.tutup();
    };
  }, [tingkat, percobaan]);

  const terkini = hasil?.tingkat === tingkat ? hasil : null;
  const mesin = terkini?.mesin ?? null;

  /** Turunkan model satu tingkat. false bila sudah paling ringan. */
  const turunkan = useCallback((): boolean => {
    if (!mesin || URUTAN_TURUN[mesin.model] == null) return false;
    setTingkat((t) => t + 1);
    return true;
  }, [mesin]);

  /** Coba muat ulang setelah gagal (mis. internet sempat putus). */
  const muatUlang = useCallback(() => {
    setHasil(null);
    setPercobaan((p) => p + 1);
  }, []);

  return { mesin, galat: terkini?.galat ?? null, turunkan, jumlahTurun: Math.min(tingkat, 5), muatUlang };
}
