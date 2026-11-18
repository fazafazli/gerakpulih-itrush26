import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormPasienBaru } from "@/components/terapis/form-pasien-baru";
import { MemuatHalaman } from "@/components/terapis/memuat";
import { wajibTerapis } from "@/lib/auth/terapis";

export const metadata: Metadata = { title: "Tambah pasien · GerakPulih" };

export default function HalamanPasienBaru() {
  return (
    <Suspense fallback={<MemuatHalaman />}>
      <IsiPasienBaru />
    </Suspense>
  );
}

async function IsiPasienBaru() {
  await wajibTerapis();
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Link href="/dashboard" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4" /> Kembali ke dashboard
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight">Tambah pasien</h1>
          <p className="text-muted-foreground">Isi seperlunya. Setelah disimpan, Anda mendapat link latihan untuk dikirim lewat WhatsApp.</p>
        </div>
        <FormPasienBaru />
      </main>
    </>
  );
}
