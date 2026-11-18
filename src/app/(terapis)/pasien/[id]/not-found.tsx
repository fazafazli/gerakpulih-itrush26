import Link from "next/link";
import { HalamanStatus, kelasAksiUtama } from "@/components/shared/halaman-status";

export default function PasienTidakDitemukan() {
  return (
    <HalamanStatus
      judul="Pasien tidak ditemukan"
      isi="Pasien ini tidak ada atau bukan pasien Anda."
      aksi={
        <Link href="/dashboard" className={kelasAksiUtama}>
          Kembali ke dashboard
        </Link>
      }
    />
  );
}
