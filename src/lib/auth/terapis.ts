import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type TerapisSaatIni = { id: string; nama: string; institusi: string | null; email: string | null };

export const getTerapisSaatIni = cache(async (): Promise<TerapisSaatIni | null> => {
  // Data terapis selalu per permintaan. Tanpa ini, runtime prefetch (partialPrefetching) ikut menjalankan
  // pemeriksaan sesi Supabase yang memakai Date.now() → galat "unstable value" saat prerender.
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("terapis").select("nama, institusi").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return { id: user.id, nama: data.nama, institusi: data.institusi, email: user.email ?? null };
});

export async function wajibTerapis(): Promise<TerapisSaatIni> {
  const terapis = await getTerapisSaatIni();
  if (!terapis) redirect("/masuk");
  return terapis;
}
