import { ArrowLeft, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { type BarisProgramForm, FormProgram } from "@/components/terapis/form-program";
import { KepalaTerapis } from "@/components/terapis/kepala-terapis";
import { MemuatHalaman } from "@/components/terapis/memuat";
import { getTerapisSaatIni } from "@/lib/auth/terapis";
import { GERAKAN, KODE_GERAKAN } from "@/lib/pose/exercises";
import { dataProgramPasien } from "@/lib/terapis/data";

export const metadata: Metadata = { title: "Atur program · GerakPulih" };

export default function HalamanProgram({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<MemuatHalaman />}>
      <IsiProgram params={params} />
    </Suspense>
  );
}

async function IsiProgram({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pasien, program } = await dataProgramPasien(id);
  const terapis = await getTerapisSaatIni();

  // Semua gerakan ditampilkan; yang belum ada di program memakai nilai bawaan dan nonaktif.
  const baris: BarisProgramForm[] = KODE_GERAKAN.map((kode, i) => {
    const p = program.find((x) => x.kode_gerakan === kode);
    return p
      ? { kode, aktif: p.aktif, target_sudut: p.target_sudut, repetisi: p.repetisi, urutan: p.urutan }
      : { kode, aktif: false, target_sudut: GERAKAN[kode].targetDefault, repetisi: GERAKAN[kode].repetisiDefault, urutan: i + 1 };
  }).sort((a, b) => a.urutan - b.urutan);

  return (
    <>
      {terapis && <KepalaTerapis nama={terapis.nama} institusi={terapis.institusi} />}
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Link href={`/pasien/${pasien.id}`} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4" /> Kembali ke {pasien.nama_tampilan}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight">Program latihan {pasien.nama_tampilan}</h1>
          <p className="text-muted-foreground">Lengan {pasien.sisi_dilatih}. Pasien tidak bisa mengubah gerakan, target, maupun sisi tubuh.</p>
        </div>
        <FormProgram pasienId={pasien.id} baris={baris} />
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          Target sudut dipakai untuk menghitung &ldquo;repetisi mencapai target&rdquo;. Target dan repetisi sepenuhnya keputusan Anda; pasien
          tidak bisa mengubahnya.
        </p>
      </main>
    </>
  );
}
