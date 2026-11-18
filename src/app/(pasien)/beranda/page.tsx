import { CalendarCheck, Check, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PeringatanBrowser } from "@/components/pasien/peringatan-browser";
import { KirimTertunda } from "@/components/sesi/kirim-tertunda";
import { Logo } from "@/components/terapis/kepala-terapis";
import { namaHariPendek, ringkasMingguIni } from "@/lib/pasien/beranda";
import { wajibPasien } from "@/lib/pasien/sesi";
import { isKodeGerakan } from "@/lib/pose/exercises";
import { namaDenganSisi } from "@/lib/sesi/teks";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Latihan hari ini · GerakPulih" };

export default function HalamanBeranda() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-6">
      <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
        <Logo /> GerakPulih
      </div>
      <Suspense fallback={<p className="text-xl text-muted-foreground">Menyiapkan latihan…</p>}>
        <IsiBeranda />
      </Suspense>
    </main>
  );
}

async function IsiBeranda() {
  const pasien = await wajibPasien();
  const db = createAdminClient();
  const sekarang = new Date();
  // 8 hari cukup untuk 7 kotak hari (WIB) tanpa terpotong zona waktu.
  const sejak = new Date(sekarang.getTime() - 8 * 86_400_000).toISOString();
  const [{ data: program }, { data: sesi }] = await Promise.all([
    db.from("program_gerakan").select("kode_gerakan, repetisi, urutan").eq("pasien_id", pasien.id).eq("aktif", true).order("urutan"),
    db.from("sesi").select("mulai").eq("pasien_id", pasien.id).gte("mulai", sejak),
  ]);

  const daftar = (program ?? []).flatMap((g) => (isKodeGerakan(g.kode_gerakan) ? [{ ...g, kode: g.kode_gerakan }] : []));
  const minggu = ringkasMingguIni((sesi ?? []).map((s) => s.mulai), sekarang);

  return (
    <>
      <PeringatanBrowser />

      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] leading-tight font-bold">Halo, {pasien.nama_tampilan}</h1>
        <p className="text-xl text-muted-foreground">{minggu.hariIni ? "Latihan hari ini sudah tercatat. Hebat!" : "Siap latihan hari ini?"}</p>
      </div>

      <section aria-labelledby="judul-minggu" className="flex flex-col gap-4 rounded-2xl bg-mint p-5">
        <h2 id="judul-minggu" className="flex items-center gap-2 text-xl font-bold">
          <CalendarCheck aria-hidden className="size-6 text-primary" />
          Minggu ini: {minggu.jumlah} kali latihan
        </h2>
        <ol className="grid grid-cols-7 gap-1.5">
          {minggu.hari.map((h, i) => (
            <li key={h.tanggal} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  h.ada ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-border",
                  i === 6 && "ring-2 ring-primary ring-offset-2 ring-offset-mint",
                )}
              >
                {h.ada && <Check aria-hidden className="size-5" />}
                <span className="sr-only">{h.ada ? "berlatih" : "tidak berlatih"}</span>
              </span>
              <span className={cn("text-base", i === 6 ? "font-bold" : "text-muted-foreground")}>{i === 6 ? "Hari ini" : namaHariPendek(h.tanggal)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="judul-hari-ini" className="flex flex-col gap-3">
        <h2 id="judul-hari-ini" className="text-xl font-bold">
          Latihan hari ini
        </h2>
        {daftar.length ? (
          <ol className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {daftar.map((g, i) => (
              <li key={g.kode} className="flex items-center justify-between gap-3 p-4 text-lg">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint font-bold text-primary">{i + 1}</span>
                  {namaDenganSisi(g.kode, pasien.sisi_dilatih)}
                </span>
                <b className="shrink-0 tabular-nums">{g.repetisi}×</b>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-border bg-card p-4 text-lg text-muted-foreground">
            Terapis belum mengatur gerakan untuk Anda. Hubungi terapis untuk memulai.
          </p>
        )}
        <p className="text-base text-muted-foreground">Gerakan dan tangan yang dilatih diatur oleh terapis.</p>
      </section>

      {daftar.length > 0 && (
        <Link
          href="/sesi"
          className="inline-flex min-h-16 w-full items-center justify-center rounded-xl bg-primary px-5 text-xl font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Mulai latihan
        </Link>
      )}

      <Link href="/privasi" className="mx-auto inline-flex min-h-11 items-center gap-2 text-base font-semibold text-muted-foreground underline underline-offset-4">
        <ShieldCheck aria-hidden className="size-5" /> Privasi & data saya
      </Link>

      <KirimTertunda pasienId={pasien.id} />
    </>
  );
}

