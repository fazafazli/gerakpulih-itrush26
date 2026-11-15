"use client";

import { useEffect } from "react";
import { kirimAntrean } from "@/lib/sesi/kirim";

/** Diletakkan di beranda pasien: mengirim ulang hasil sesi yang dulu gagal terkirim (tanpa tampilan). */
export function KirimTertunda({ pasienId }: { pasienId: string }) {
  useEffect(() => {
    void kirimAntrean(pasienId);
  }, [pasienId]);
  return null;
}
