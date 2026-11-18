"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { HalamanStatus, kelasAksiKedua, kelasAksiUtama } from "@/components/shared/halaman-status";

/** Galat tak terduga di halaman terapis: pesan ramah tanpa detail teknis. */
export default function GalatTerapis({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <HalamanStatus
      sudut={20}
      judul="Data belum bisa dimuat"
      isi="Periksa koneksi internet lalu coba lagi. Data pasien Anda tetap aman."
      aksi={
        <>
          <button type="button" onClick={reset} className={kelasAksiUtama}>
            <RefreshCw aria-hidden className="size-5" /> Coba lagi
          </button>
          <Link href="/dashboard" className={kelasAksiKedua}>
            Ke dashboard
          </Link>
        </>
      }
    />
  );
}
