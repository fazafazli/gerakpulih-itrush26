import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { type ProgramSesi, SesiLatihan } from "@/components/sesi/sesi-latihan";
import { wajibPasien } from "@/lib/pasien/sesi";
import { isKodeGerakan } from "@/lib/pose/exercises";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Latihan · GerakPulih" };

export default function HalamanSesi() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-5 text-lg text-[#3D4C5C]">Menyiapkan latihan…</main>
      }
    >
      <IsiSesi />
    </Suspense>
  );
}

async function IsiSesi() {
  const pasien = await wajibPasien();
  const { data } = await createAdminClient()
    .from("program_gerakan")
    .select("kode_gerakan, target_sudut, repetisi, urutan")
    .eq("pasien_id", pasien.id)
    .eq("aktif", true)
    .order("urutan");

  // Program, target, dan sisi tubuh selalu dari terapis — pasien tidak bisa memilihnya.
  const program: ProgramSesi[] = (data ?? []).flatMap((g) =>
    isKodeGerakan(g.kode_gerakan) ? [{ kode: g.kode_gerakan, target: g.target_sudut, repetisi: g.repetisi }] : [],
  );

  if (!program.length) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5 text-[#0F1E2E]">
        <h1 className="text-[28px] font-extrabold leading-tight">Belum ada latihan</h1>
        <p className="text-lg text-[#3D4C5C]">Terapis belum mengatur gerakan untukmu. Hubungi terapis untuk memulai.</p>
        <Link href="/beranda" className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[#DDE4EB] text-lg font-bold">
          Kembali
        </Link>
      </main>
    );
  }

  return <SesiLatihan pasienId={pasien.id} nama={pasien.nama_tampilan} sisi={pasien.sisi_dilatih} program={program} />;
}
