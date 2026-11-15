import type { Metadata } from "next";
import { Suspense } from "react";
import { wajibTerapis } from "@/lib/auth/terapis";
import { createClient } from "@/lib/supabase/server";
import { keluar } from "../masuk/actions";

export const metadata: Metadata = { title: "Dashboard · GerakPulih" };

export default function HalamanDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8 text-[#0F1E2E]">
      <Suspense fallback={<p className="text-[#3D4C5C]">Memuat dashboard…</p>}>
        <IsiDashboard />
      </Suspense>
    </main>
  );
}

async function IsiDashboard() {
  const terapis = await wajibTerapis();
  const supabase = await createClient();
  // Kolom eksplisit: token_hash dikunci untuk terapis
  const { data: pasien } = await supabase
    .from("pasien")
    .select("id, nama_tampilan, sisi_dilatih, terakhir_aktif, aktif")
    .order("nama_tampilan");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Halo, {terapis.nama}</h1>
          {terapis.institusi && <p className="text-[#3D4C5C]">{terapis.institusi}</p>}
        </div>
        <form action={keluar}>
          <button type="submit" className="h-11 rounded-xl border border-[#C9D3DE] bg-white px-4 font-semibold">
            Keluar
          </button>
        </form>
      </div>
      <ul className="flex flex-col gap-2">
        {(pasien ?? []).map((p) => (
          <li key={p.id} className="flex justify-between rounded-xl border border-[#DDE4EB] bg-white px-4 py-3">
            <span className="font-semibold">{p.nama_tampilan}</span>
            <span className="text-sm text-[#3D4C5C]">sisi {p.sisi_dilatih}</span>
          </li>
        ))}
        {!pasien?.length && <li className="text-[#3D4C5C]">Belum ada pasien.</li>}
      </ul>
    </div>
  );
}
