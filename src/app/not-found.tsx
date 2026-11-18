import type { Metadata } from "next";
import Link from "next/link";
import { HalamanStatus, kelasAksiUtama } from "@/components/shared/halaman-status";

export const metadata: Metadata = { title: "Halaman tidak ditemukan · GerakPulih" };

export default function TidakDitemukan() {
  return (
    <HalamanStatus
      judul="Halaman tidak ditemukan"
      isi="Alamat ini mungkin salah ketik atau halamannya sudah dipindah."
      aksi={
        <Link href="/" className={kelasAksiUtama}>
          Ke halaman utama
        </Link>
      }
    />
  );
}
