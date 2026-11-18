"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { HalamanStatus, kelasAksiKedua, kelasAksiUtama } from "@/components/shared/halaman-status";

/** Galat tak terduga di luar ruang terapis: pesan ramah tanpa detail teknis. */
export default function Galat({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <HalamanStatus
      sudut={20}
      judul="Ada yang tidak beres"
      isi="Halaman belum bisa ditampilkan. Periksa internet, lalu coba lagi."
      aksi={
        <>
          <button type="button" onClick={reset} className={kelasAksiUtama}>
            <RefreshCw aria-hidden className="size-5" /> Coba lagi
          </button>
          <Link href="/" className={kelasAksiKedua}>
            Ke halaman utama
          </Link>
        </>
      }
    />
  );
}
