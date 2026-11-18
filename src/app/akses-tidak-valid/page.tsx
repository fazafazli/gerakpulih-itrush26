import type { Metadata } from "next";
import Link from "next/link";
import { HalamanStatus, kelasAksiKedua } from "@/components/shared/halaman-status";

export const metadata: Metadata = { title: "Link tidak berlaku · GerakPulih" };

export default function AksesTidakValid() {
  return (
    <HalamanStatus
      sudut={30}
      judul="Link latihan tidak berlaku"
      isi={
        <>
          <p>Link mungkin salah ketik, sudah diganti, atau sudah tidak aktif.</p>
          <p className="mt-3 font-semibold text-foreground">Hubungi terapis Anda untuk meminta link baru, lalu buka lewat Chrome.</p>
        </>
      }
      aksi={
        <>
          <Link href="/" className={kelasAksiKedua}>
            Tentang GerakPulih
          </Link>
          <Link
            href="/masuk"
            className="inline-flex min-h-11 items-center justify-center text-base font-semibold text-primary underline underline-offset-4"
          >
            Saya fisioterapis, masuk di sini
          </Link>
        </>
      }
    />
  );
}
