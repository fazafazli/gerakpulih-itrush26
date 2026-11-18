import { ArrowLeft, CircleAlert, ShieldAlert, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DaftarNyeri } from "@/components/terapis/daftar-nyeri";
import { GrafikProgres, type SeriGerakan } from "@/components/terapis/grafik-progres";
import { KalenderKepatuhan } from "@/components/terapis/kalender-kepatuhan";
import { KartuRingkasan } from "@/components/terapis/kartu-ringkasan";
import { KelolaLink } from "@/components/terapis/kelola-link";
import { KepalaTerapis } from "@/components/terapis/kepala-terapis";
import { LencanaStatus } from "@/components/terapis/lencana-status";
import { MemuatHalaman } from "@/components/terapis/memuat";
import { buttonVariants } from "@/components/ui/button";
import { getTerapisSaatIni } from "@/lib/auth/terapis";
import { perluCatatPersetujuan } from "@/lib/pasien/persetujuan";
import { GERAKAN, isKodeGerakan } from "@/lib/pose/exercises";
import { dataDetailPasien } from "@/lib/terapis/data";
import { gerakanTercatat, kepatuhanHarian, labelRelatif, ringkasanUsang, seriProgres, statusPasien } from "@/lib/terapis/olah";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Detail pasien · GerakPulih" };

export default function HalamanPasien({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<MemuatHalaman />}>
      <IsiPasien params={params} />
    </Suspense>
  );
}

async function IsiPasien({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pasien, program, sesi, kejadian, ringkasan } = await dataDetailPasien(id);
  const terapis = await getTerapisSaatIni();
  const sekarang = new Date();

  const nyeriTerbuka = kejadian.filter((k) => !k.ditindaklanjuti);
  const sesiTerakhir = sesi.at(-1)?.mulai ?? null;
  const status = statusPasien({ aktif: pasien.aktif, nyeriTerbuka: nyeriTerbuka.length, terakhirSesi: sesiTerakhir, sekarang });
  const usang = ringkasan ? ringkasanUsang({ dibuat: ringkasan.dibuat, nyeriTerbuka, sesiTerakhir }) : null;
  const seri: SeriGerakan[] = gerakanTercatat(sesi).map((kode) => ({ kode, nama: GERAKAN[kode].nama, titik: seriProgres(sesi, kode) }));
  const kepatuhan = kepatuhanHarian(sesi, sekarang);
  const programAktif = program.filter((p) => p.aktif && isKodeGerakan(p.kode_gerakan));

  return (
    <>
      {terapis && <KepalaTerapis nama={terapis.nama} institusi={terapis.institusi} />}
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Link href="/dashboard" className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4" /> Semua pasien
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight sm:text-[32px]">{pasien.nama_tampilan}</h1>
              <LencanaStatus status={status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Lengan {pasien.sisi_dilatih} · {sesi.length} sesi dalam 90 hari
              {sesiTerakhir && ` · terakhir ${labelRelatif(sesiTerakhir, sekarang)}`}
              {pasien.is_demo && " · data contoh"}
            </p>
            {pasien.catatan && <p className="max-w-prose text-sm">{pasien.catatan}</p>}
            <StatusPersetujuan pada={pasien.persetujuan_pada} versi={pasien.persetujuan_versi} />
          </div>
          <Link href={`/pasien/${pasien.id}/program`} className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-2 bg-card px-4 text-sm")}>
            <SlidersHorizontal aria-hidden className="size-4" /> Atur program
          </Link>
        </div>

        {nyeriTerbuka.length > 0 && (
          <a
            href="#nyeri"
            className="flex items-center gap-3 rounded-xl border border-bahaya/30 bg-bahaya-bg px-4 py-3 text-sm text-bahaya hover:border-bahaya/60"
          >
            <CircleAlert aria-hidden className="size-5 shrink-0" />
            <span>
              <b className="font-semibold">{nyeriTerbuka.length} laporan nyeri belum ditindaklanjuti.</b> Lihat detail laporan di bawah.
            </span>
          </a>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex min-w-0 flex-col gap-6">
            <section aria-labelledby="judul-progres" className="rounded-xl border border-border bg-card p-5">
              <h2 id="judul-progres" className="mb-4 font-heading text-lg font-semibold">
                Progres jangkauan gerak
              </h2>
              <GrafikProgres seri={seri} />
            </section>

            <section aria-labelledby="judul-kepatuhan" className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="judul-kepatuhan" className="font-heading text-lg font-semibold">
                  Kepatuhan 4 minggu
                </h2>
                <span className="text-sm text-muted-foreground">
                  <b className="font-semibold text-foreground">{kepatuhan.hariLatihan}</b> dari 28 hari berlatih
                </span>
              </div>
              <KalenderKepatuhan kepatuhan={kepatuhan} />
            </section>

            <section id="nyeri" aria-labelledby="judul-nyeri" className="scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card">
              <h2 id="judul-nyeri" className="border-b border-border px-5 py-4 font-heading text-lg font-semibold">
                Laporan nyeri
              </h2>
              <DaftarNyeri kejadian={kejadian} />
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <KartuRingkasan
              pasienId={pasien.id}
              usang={usang}
              awal={
                ringkasan && {
                  isi: ringkasan.isi,
                  sumber: ringkasan.sumber,
                  dibuat: ringkasan.dibuat,
                  periode: { mulai: ringkasan.periode_mulai, selesai: ringkasan.periode_selesai },
                }
              }
            />

            <section aria-labelledby="judul-program" className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-baseline justify-between">
                <h2 id="judul-program" className="font-heading text-lg font-semibold">
                  Program latihan
                </h2>
                <Link href={`/pasien/${pasien.id}/program`} className="text-sm font-medium text-primary hover:underline">
                  Ubah
                </Link>
              </div>
              {programAktif.length ? (
                <ol className="mt-3 divide-y divide-border">
                  {programAktif.map((p) => (
                    <li key={p.kode_gerakan} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span>{isKodeGerakan(p.kode_gerakan) ? GERAKAN[p.kode_gerakan].nama : p.kode_gerakan}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {p.target_sudut}° · {p.repetisi}×
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-peringatan-teks">Belum ada gerakan aktif. Pasien belum bisa berlatih.</p>
              )}
            </section>

            <KelolaLink pasienId={pasien.id} nama={pasien.nama_tampilan} aktif={pasien.aktif} isDemo={pasien.is_demo} />
          </aside>
        </div>
      </main>
    </>
  );
}

const TANGGAL_SETUJU = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

/** Bukti persetujuan privasi pasien (diisi server saat pasien menekan "Saya setuju"). */
function StatusPersetujuan({ pada, versi }: { pada: string | null; versi: string | null }) {
  if (!pada) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-peringatan-teks">
        <ShieldAlert aria-hidden className="size-4" /> Belum menyetujui halaman privasi
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-sukses-teks">
      <ShieldCheck aria-hidden className="size-4" />
      Persetujuan privasi: {TANGGAL_SETUJU.format(new Date(pada))} ({versi ?? "-"})
      {perluCatatPersetujuan(versi) && <span className="text-peringatan-teks"> · versi lama, akan diminta ulang</span>}
    </p>
  );
}
