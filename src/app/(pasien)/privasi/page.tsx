import { BarChart3, Bot, Eye, Hand, ShieldCheck, VideoOff } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { FormSetuju } from "@/components/pasien/form-setuju";
import { COOKIE_PERSETUJUAN, modePrivasi, tujuanSetelahSetuju } from "@/lib/pasien/persetujuan";
import { getPasienSaatIni } from "@/lib/pasien/sesi";

export const metadata: Metadata = { title: "Privasi & data · GerakPulih" };

/** Satu poin = satu ikon + satu kalimat pendek (layar pasien lansia). */
const POIN = [
  { ikon: VideoOff, judul: "Video tidak direkam", isi: "Kamera hanya dipakai di HP ini untuk menghitung gerakan. Video tidak disimpan dan tidak dikirim." },
  {
    ikon: BarChart3,
    judul: "Yang disimpan hanya angka",
    isi: "Waktu latihan, jumlah gerakan, sudut tertinggi, berapa kali badan miring, dan tombol “terasa sakit”.",
  },
  { ikon: Eye, judul: "Yang melihat: fisioterapis Anda", isi: "Tidak dibagikan ke orang lain." },
  { ikon: Bot, judul: "AI hanya membantu terapis", isi: "AI merangkum angka tanpa nama. Keputusan tetap di tangan fisioterapis." },
  { ikon: Hand, judul: "Boleh berhenti kapan saja", isi: "Tutup halaman ini kapan pun. Minta terapis menonaktifkan link atau menghapus data Anda." },
] as const;

export default function HalamanPrivasi({ searchParams }: { searchParams: Promise<{ lanjut?: string }> }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <div className="flex flex-col gap-2">
        <ShieldCheck aria-hidden className="size-12 text-primary" />
        <h1 className="font-heading text-[30px] leading-tight font-bold">Privasi latihan Anda</h1>
        <p className="text-xl text-muted-foreground">Apa yang terjadi dengan data saat berlatih dengan GerakPulih.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {POIN.map(({ ikon: Ikon, judul, isi }) => (
          <li key={judul} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-primary">
              <Ikon aria-hidden className="size-6" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-xl font-bold leading-snug">{judul}</span>
              <span className="text-lg leading-relaxed text-muted-foreground">{isi}</span>
            </span>
          </li>
        ))}
      </ul>

      <Suspense fallback={<div className="h-16" aria-hidden />}>
        <AksiPrivasi searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

/**
 * Halaman ini publik untuk dibaca. getPasienSaatIni() memeriksa tanda tangan cookie lebih dulu:
 * tanpa cookie pasien sah tidak ada query data pasien, tidak ada nama, dan tidak ada form.
 */
async function AksiPrivasi({ searchParams }: { searchParams: Promise<{ lanjut?: string }> }) {
  const [pasien, { lanjut }, jar] = await Promise.all([getPasienSaatIni(), searchParams, cookies()]);
  const mode = modePrivasi({ pasienSah: pasien != null, nilaiCookieSetuju: jar.get(COOKIE_PERSETUJUAN)?.value });

  if (mode === "baca") {
    return (
      <p className="rounded-2xl bg-cyan-lembut p-4 text-lg leading-relaxed text-secondary-foreground">
        Pasien akan diminta menyetujui ini saat membuka link latihan dari terapis.
      </p>
    );
  }
  if (mode === "sudah") {
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-sukses-bg p-4 text-lg font-semibold text-sukses-teks">
          <ShieldCheck aria-hidden className="size-6 shrink-0" /> Anda sudah menyetujui di HP ini.
        </p>
        <Link
          href={tujuanSetelahSetuju(lanjut)}
          className="inline-flex min-h-16 w-full items-center justify-center rounded-xl bg-primary px-5 text-xl font-bold text-primary-foreground hover:bg-primary/90"
        >
          {tujuanSetelahSetuju(lanjut) === "/sesi" ? "Lanjut latihan" : "Kembali ke beranda"}
        </Link>
      </div>
    );
  }
  return <FormSetuju lanjut={tujuanSetelahSetuju(lanjut)} />;
}
