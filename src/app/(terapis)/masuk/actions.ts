"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type StatusMasuk = { pesan: string | null };

const SkemaMasuk = z.object({
  email: z.email(),
  password: z.string().min(1),
  lanjut: z.string().optional(),
});

/** Cegah open redirect */
const tujuanAman = (lanjut?: string) => (lanjut && lanjut.startsWith("/") && !lanjut.startsWith("//") ? lanjut : "/dashboard");

export async function masuk(_sebelumnya: StatusMasuk, formData: FormData): Promise<StatusMasuk> {
  const hasil = SkemaMasuk.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    lanjut: String(formData.get("lanjut") ?? "") || undefined,
  });
  if (!hasil.success) return { pesan: "Isi email dan kata sandi dengan benar." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: hasil.data.email, password: hasil.data.password });
  if (error) {
    return { pesan: error.status === 429 ? "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." : "Email atau kata sandi salah." };
  }
  redirect(tujuanAman(hasil.data.lanjut));
}

/**
 * Akun demo sengaja publik (tombol satu klik untuk juri), jadi kredensialnya bukan rahasia.
 * Env tetap diutamakan agar sandi bisa diganti tanpa mengubah kode.
 */
const DEMO_BAWAAN = { email: "demo-terapis@example.com", password: "demoterapis" } as const;

export async function masukDemo(): Promise<void> {
  const email = process.env.DEMO_TERAPIS_EMAIL || DEMO_BAWAAN.email;
  const password = process.env.DEMO_TERAPIS_PASSWORD || DEMO_BAWAAN.password;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`[masuk-demo] gagal: ${error.status ?? "-"} ${error.code ?? ""} ${error.message}`);
    redirect("/masuk?galat=demo");
  }
  redirect("/dashboard");
}

export async function keluar(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
