import type { Metadata } from "next";
import { Suspense } from "react";
import { AktivitasTerbaru } from "@/components/terapis/aktivitas-terbaru";
import { AreaTindakLanjut } from "@/components/terapis/area-tindak-lanjut";
import { KepalaTerapis } from "@/components/terapis/kepala-terapis";
import { MemuatHalaman } from "@/components/terapis/memuat";
import { TabelPasien } from "@/components/terapis/tabel-pasien";
import { buttonVariants } from "@/components/ui/button";
import { dataDashboard } from "@/lib/terapis/data";
import { aktivitasTerbaru, angkaDashboard, barisDaftarPasien } from "@/lib/terapis/olah";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard · GerakPulih" };

export default function HalamanDashboard() {
  return (
    <Suspense fallback={<MemuatHalaman />}>
      <IsiDashboard />
    </Suspense>
  );
}

const TANGGAL = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" });

async function IsiDashboard() {
  const { terapis, pasien, sesi, nyeriTerbuka } = await dataDashboard();
  const sekarang = new Date();
  const baris = barisDaftarPasien({ pasien, sesi, nyeriTerbuka, sekarang });
  const angka = angkaDashboard(baris, sesi, sekarang);
  const aktivitas = aktivitasTerbaru(sesi, new Map(pasien.map((p) => [p.id, p.nama_tampilan])));
  const sapaan = terapis.nama.replace(/\s*\(.*\)\s*$/, "");

  return (
    <>
      <KepalaTerapis nama={terapis.nama} institusi={terapis.institusi} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground first-letter:uppercase">{TANGGAL.format(sekarang)}</p>
          <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight sm:text-[32px]">Halo, {sapaan}</h1>
          <p className="text-muted-foreground">
            {angka.perluTindakLanjut > 0
              ? `${angka.perluTindakLanjut} pasien perlu ditinjau hari ini.`
              : "Semua pasien terpantau. Berikut ringkasan latihan di rumah."}
          </p>
        </div>

        {pasien.length === 0 ? (
          <KosongPasien />
        ) : (
          <>
            <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
              <AreaTindakLanjut nyeri={nyeriTerbuka} baris={baris} sekarang={sekarang} />
              <AngkaRingkas {...angka} />
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
              <section aria-labelledby="judul-pasien" className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
                  <h2 id="judul-pasien" className="font-heading text-lg font-semibold">
                    Pasien
                  </h2>
                  <span className="text-sm text-muted-foreground">{pasien.length} orang</span>
                </div>
                <TabelPasien baris={baris} sekarang={sekarang} />
              </section>

              <section aria-labelledby="judul-aktivitas" className="rounded-xl border border-border bg-card">
                <h2 id="judul-aktivitas" className="border-b border-border px-5 py-4 font-heading text-lg font-semibold">
                  Aktivitas terbaru
                </h2>
                <AktivitasTerbaru aktivitas={aktivitas} sekarang={sekarang} />
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}

/** Satu angka utama (kepatuhan) + dua pendukung, bukan tiga kartu kembar. */
function AngkaRingkas(a: ReturnType<typeof angkaDashboard>) {
  const persen = a.persenKepatuhan ?? 0;
  return (
    <section aria-labelledby="judul-angka" className="rounded-xl bg-mint p-5">
      <h2 id="judul-angka" className="text-sm font-medium text-secondary-foreground">
        Kepatuhan latihan 7 hari
      </h2>
      <p className="mt-1 font-heading text-5xl font-bold tracking-tight text-primary tabular-nums">
        {a.persenKepatuhan == null ? "—" : `${persen}%`}
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-card"
        role="progressbar"
        aria-valuenow={persen}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kepatuhan latihan"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.min(100, persen)}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Hari berlatih ÷ 7 hari, rata-rata pasien dengan link aktif.</p>
      <dl className="mt-5 grid grid-cols-2 divide-x divide-primary/15 border-t border-primary/15 pt-4">
        <div className="pr-4">
          <dt className="text-xs text-muted-foreground">Sesi 7 hari</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">{a.sesi7Hari}</dd>
        </div>
        <div className="pl-4">
          <dt className="text-xs text-muted-foreground">Pasien aktif</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">{a.pasienAktif}</dd>
        </div>
      </dl>
    </section>
  );
}

function KosongPasien() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-primary/30 bg-mint-pucat p-8">
      <h2 className="font-heading text-xl font-semibold">Belum ada pasien</h2>
      <p className="max-w-prose text-muted-foreground">
        Tambahkan pasien, lalu kirim link latihan lewat WhatsApp. Pasien tidak perlu membuat akun, dan video latihan tidak pernah keluar
        dari HP mereka.
      </p>
      <Link href="/pasien/baru" className={cn(buttonVariants(), "h-11 px-5 text-base")}>
        Tambah pasien pertama
      </Link>
    </section>
  );
}
