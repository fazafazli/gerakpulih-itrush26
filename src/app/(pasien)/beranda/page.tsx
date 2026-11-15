import type { Metadata } from "next";
import { Suspense } from "react";
import { wajibPasien } from "@/lib/pasien/sesi";
import { GERAKAN, isKodeGerakan } from "@/lib/pose/exercises";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Latihan hari ini · GerakPulih" };

export default function HalamanBeranda() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 py-6 text-[#0F1E2E]">
      <Suspense fallback={<p className="text-lg text-[#3D4C5C]">Menyiapkan latihan…</p>}>
        <IsiBeranda />
      </Suspense>
    </main>
  );
}

async function IsiBeranda() {
  const pasien = await wajibPasien();
  const { data: program } = await createAdminClient()
    .from("program_gerakan")
    .select("kode_gerakan, target_sudut, repetisi, urutan")
    .eq("pasien_id", pasien.id)
    .eq("aktif", true)
    .order("urutan");

  const daftar = (program ?? []).filter((g) => isKodeGerakan(g.kode_gerakan));

  return (
    <>
      <h1 className="text-[32px] font-extrabold leading-tight">Halo, {pasien.nama_tampilan}</h1>
      <section className="flex flex-col gap-3 rounded-2xl border border-[#DDE4EB] bg-white p-4">
        <h2 className="text-lg font-bold">Latihan hari ini</h2>
        <ol className="flex flex-col gap-2 text-[17px]">
          {daftar.map((g, i) => (
            <li key={g.kode_gerakan} className="flex justify-between">
              <span>
                {i + 1}. {isKodeGerakan(g.kode_gerakan) ? GERAKAN[g.kode_gerakan].nama : g.kode_gerakan}
              </span>
              <b>{g.repetisi}×</b>
            </li>
          ))}
        </ol>
        <p className="border-t border-[#E7ECF1] pt-2 text-sm text-[#3D4C5C]">
          Tangan yang dilatih: <b className="text-[#0F1E2E]">{pasien.sisi_dilatih}</b> (diatur oleh terapis)
        </p>
      </section>
    </>
  );
}
