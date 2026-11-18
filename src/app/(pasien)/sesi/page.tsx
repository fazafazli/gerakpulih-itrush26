import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PeringatanBrowser } from "@/components/pasien/peringatan-browser";
import { type ProgramSesi, SesiLatihan } from "@/components/sesi/sesi-latihan";
import { COOKIE_PERSETUJUAN, sudahSetuju } from "@/lib/pasien/persetujuan";
import { wajibPasien } from "@/lib/pasien/sesi";
import { isKodeGerakan } from "@/lib/pose/exercises";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Latihan · GerakPulih" };

export default function HalamanSesi() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-5 text-xl text-muted-foreground">Menyiapkan latihan…</main>
      }
    >
      <IsiSesi />
    </Suspense>
  );
}

async function IsiSesi() {
  const pasien = await wajibPasien();
  // Persetujuan privasi wajib sebelum kamera dinyalakan (sekali per perangkat).
  if (!sudahSetuju((await cookies()).get(COOKIE_PERSETUJUAN)?.value)) redirect("/privasi?lanjut=/sesi");

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
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5">
        <ClipboardList aria-hidden className="size-12 text-primary" />
        <h1 className="font-heading text-[30px] leading-tight font-bold">Belum ada latihan</h1>
        <p className="text-xl leading-relaxed text-muted-foreground">Terapis belum mengatur gerakan untuk Anda. Hubungi terapis untuk memulai.</p>
        <Link
          href="/beranda"
          className="inline-flex min-h-16 items-center justify-center rounded-xl border-2 border-border bg-card text-xl font-bold hover:bg-mint-pucat"
        >
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-md px-4 pt-4 empty:hidden">
        <PeringatanBrowser />
      </div>
      <SesiLatihan pasienId={pasien.id} nama={pasien.nama_tampilan} sisi={pasien.sisi_dilatih} program={program} />
    </>
  );
}
