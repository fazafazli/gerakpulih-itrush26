import {
  ArrowRight,
  BellRing,
  Bot,
  CalendarCheck,
  ChartLine,
  ClipboardList,
  Database,
  FileCheck2,
  Link2Off,
  LockKeyhole,
  ScanFace,
  Send,
  ShieldAlert,
  Smartphone,
  Stethoscope,
  VideoOff,
  Volume2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { masukDemo } from "@/app/(terapis)/masuk/actions";
import { IlustrasiHp } from "@/components/landing/ilustrasi-hp";
import { Logo } from "@/components/terapis/kepala-terapis";
import { qrDataUrl } from "@/lib/qr";
import { originPublik } from "@/lib/situs";

export const metadata: Metadata = {
  title: { absolute: "GerakPulih · Fisioterapis di Kamera" },
  description:
    "Latihan rehabilitasi lengan pasca-stroke di rumah, dipandu kamera HP dan dipantau fisioterapis. Video tidak pernah meninggalkan HP.",
  alternates: { canonical: "/" },
};

/** Link demo pasien (token contoh yang memang publik untuk juri). */
const JALUR_DEMO_PASIEN = "/mulai/demo-budi";

const LANGKAH = [
  {
    ikon: ClipboardList,
    judul: "Terapis mengatur program",
    isi: "Pilih gerakan, target sudut, dan jumlah repetisi. Kirim link pribadi ke pasien lewat WhatsApp. Pasien tidak perlu membuat akun.",
  },
  {
    ikon: ScanFace,
    judul: "Pasien berlatih di depan kamera HP",
    isi: "Repetisi dan sudut lengan dihitung langsung di HP. Panduan dibacakan, postur miring diingatkan, dan tombol “Berhenti, terasa sakit” selalu ada.",
  },
  {
    ikon: ChartLine,
    judul: "Terapis memantau dari jauh",
    isi: "Grafik jangkauan gerak, kepatuhan latihan, laporan nyeri, dan ringkasan yang membantu menyiapkan kontrol berikutnya.",
  },
] as const;

const FITUR_PASIEN = [
  { ikon: Smartphone, teks: "Cukup HP dan link dari terapis, tanpa akun atau aplikasi tambahan" },
  { ikon: Volume2, teks: "Instruksi besar dan dibacakan, satu langkah per layar" },
  { ikon: CalendarCheck, teks: "Melihat berapa kali sudah berlatih minggu ini" },
] as const;

const FITUR_TERAPIS = [
  { ikon: ChartLine, teks: "Puncak sudut per sesi dibandingkan target yang Anda tetapkan" },
  { ikon: BellRing, teks: "Laporan nyeri dan pasien yang jeda latihan muncul paling atas" },
  { ikon: Send, teks: "Tambah pasien, atur program, kirim link + QR, nonaktifkan kapan saja" },
] as const;

const PRIVASI = [
  { ikon: VideoOff, judul: "Video tidak pernah meninggalkan HP", isi: "Deteksi pose (MediaPipe) berjalan di browser. Yang dikirim hanya angka." },
  { ikon: FileCheck2, judul: "Persetujuan tercatat", isi: "Pasien menyetujui halaman privasi sebelum latihan pertama; waktu dan versinya disimpan." },
  { ikon: Database, judul: "Data minimal", isi: "Nama panggilan dan angka latihan. Tanpa NIK, alamat, atau rekam medis." },
  { ikon: LockKeyhole, judul: "Akses terbatas", isi: "Setiap terapis hanya melihat pasiennya sendiri (Row Level Security di database)." },
  { ikon: Link2Off, judul: "Link bisa dicabut", isi: "Token link disimpan sebagai hash dan bisa dinonaktifkan terapis kapan saja." },
] as const;

const COBA_TERAPIS = [
  "Lihat grafik progres Pak Budi (72° → 104°)",
  "Tandai laporan nyeri sebagai sudah ditindaklanjuti",
  "Buat ringkasan latihan dengan AI",
  "Tambah pasien baru dan dapatkan link + QR",
] as const;

const kelasCtaUtama =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 whitespace-nowrap text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";
const kelasCtaKedua =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-card px-6 whitespace-nowrap text-base font-semibold text-primary transition-colors hover:bg-mint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default async function Beranda() {
  const origin = originPublik();
  const urlDemoPasien = origin ? `${origin}${JALUR_DEMO_PASIEN}` : null;
  const qr = urlDemoPasien ? await qrDataUrl(urlDemoPasien) : null;

  return (
    <div className="flex flex-1 flex-col">
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Lewati ke isi
      </a>

      <header className="border-b border-border bg-card">
        <nav aria-label="Utama" className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-primary">
            <Logo /> GerakPulih
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <a href="#coba" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap text-primary hover:bg-mint sm:inline-flex">
              Coba demo
            </a>
            <Link href="/masuk" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground">
              Masuk terapis
            </Link>
          </div>
        </nav>
      </header>

      <main id="isi">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 md:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Untuk fisioterapis & pasien pasca-stroke</p>
            <h1 className="font-heading text-[34px] leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-[56px]">
              Latihan lengan di rumah, tetap dipantau fisioterapis.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              GerakPulih memakai kamera HP untuk menghitung repetisi dan sudut gerak saat pasien berlatih, lalu mengirim angkanya ke
              fisioterapis. Video tidak pernah meninggalkan HP.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#coba-pasien" className={kelasCtaUtama}>
                Coba sebagai pasien <ArrowRight aria-hidden className="size-4" />
              </a>
              <a href="#coba-terapis" className={kelasCtaKedua}>
                Coba sebagai terapis
              </a>
            </div>
          </div>
          <IlustrasiHp />
        </section>

        {/* Masalah */}
        <section aria-labelledby="judul-masalah" className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr] md:py-20">
            <h2 id="judul-masalah" className="font-heading text-2xl font-semibold tracking-tight">
              Masalahnya
            </h2>
            <div className="flex flex-col gap-5 border-l-4 border-teal-segar pl-6">
              <p className="font-heading text-2xl leading-snug font-medium sm:text-[28px]">
                Setelah pulang dari rumah sakit, pasien pasca-stroke melanjutkan latihan lengan sendiri di rumah, sering tanpa ada yang
                melihat.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Pasien dan keluarga tidak tahu apakah gerakannya sudah benar dan cukup tinggi. Fisioterapis tidak tahu apakah latihan
                dilakukan, seberapa jauh progresnya, atau kapan pasien merasa sakit, sampai jadwal kontrol berikutnya.
              </p>
            </div>
          </div>
        </section>

        {/* Cara kerja */}
        <section aria-labelledby="judul-cara" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <h2 id="judul-cara" className="font-heading text-[28px] font-bold tracking-tight sm:text-[32px]">
            Cara kerja
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {LANGKAH.map(({ ikon: Ikon, judul, isi }, i) => (
              <li key={judul} className="relative flex flex-col gap-3 border-t-2 border-primary/20 pt-6">
                <span className="absolute -top-[13px] left-0 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <Ikon aria-hidden className="size-7 text-primary" />
                <h3 className="font-heading text-lg font-semibold">{judul}</h3>
                <p className="leading-relaxed text-muted-foreground">{isi}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Dua sisi */}
        <section aria-label="Untuk pasien dan terapis" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <h2 className="font-heading text-xl font-semibold">Untuk pasien & pendamping</h2>
              <ul className="flex flex-col gap-4">
                {FITUR_PASIEN.map(({ ikon: Ikon, teks }) => (
                  <li key={teks} className="flex items-start gap-3">
                    <Ikon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                    {teks}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-5 border-t border-border bg-mint-pucat p-6 sm:p-8 md:border-t-0 md:border-l">
              <h2 className="font-heading text-xl font-semibold">Untuk fisioterapis</h2>
              <ul className="flex flex-col gap-4">
                {FITUR_TERAPIS.map(({ ikon: Ikon, teks }) => (
                  <li key={teks} className="flex items-start gap-3">
                    <Ikon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                    {teks}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Privasi & keamanan */}
        <section aria-labelledby="judul-privasi" className="bg-mint">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="max-w-2xl">
              <h2 id="judul-privasi" className="font-heading text-[28px] font-bold tracking-tight sm:text-[32px]">
                Privasi & keamanan
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-secondary-foreground">
                Data kesehatan termasuk data pribadi spesifik (UU PDP). GerakPulih dirancang agar sesedikit mungkin data yang keluar dari
                rumah pasien.
              </p>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {PRIVASI.map(({ ikon: Ikon, judul, isi }) => (
                <li key={judul} className="flex gap-4">
                  <Ikon aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">{judul}</h3>
                    <p className="mt-1 leading-relaxed text-secondary-foreground">{isi}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* AI & batasan */}
        <section aria-label="Peran AI dan batasan" className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col gap-4">
            <Bot aria-hidden className="size-8 text-primary" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Peran AI</h2>
            <ul className="flex flex-col gap-3 leading-relaxed text-muted-foreground">
              <li>
                <b className="font-semibold text-foreground">Di HP pasien:</b> model deteksi pose MediaPipe menghitung sudut dan repetisi. Aturan
                hitungan, suara, dan peringatan postur bersifat tetap dan tidak memakai AI generatif.
              </li>
              <li>
                <b className="font-semibold text-foreground">Untuk terapis:</b> Gemini merangkum angka latihan tanpa nama atau identitas, diberi
                label &ldquo;Dibuat AI · perlu ditinjau&rdquo;. Bila AI tidak tersedia, dipakai template dari aturan tetap.
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border-l-4 border-peringatan bg-peringatan-bg p-6">
            <ShieldAlert aria-hidden className="size-8 text-peringatan-teks" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Batasan</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed">
              <li>Alat bantu pencatat untuk fisioterapis, bukan alat diagnosis dan bukan pengganti pemeriksaan langsung.</li>
              <li>Program latihan hanya diatur terapis; pasien tidak bisa mengubah gerakan atau target.</li>
              <li>Pengukuran dari kamera bisa keliru bila cahaya kurang atau posisi HP tidak sesuai panduan.</li>
              <li>Tidak menjanjikan kesembuhan; hasil bergantung pada program dan penilaian terapis.</li>
            </ul>
          </div>
        </section>

        {/* Coba demo */}
        <section id="coba" aria-labelledby="judul-coba" className="scroll-mt-4 border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <h2 id="judul-coba" className="font-heading text-[28px] font-bold tracking-tight sm:text-[32px]">
              Coba demo
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Data contoh, aman untuk dicoba. Pasien contoh dijaga agar tidak bisa dihapus.</p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div id="coba-pasien" className="flex scroll-mt-4 flex-col gap-5 rounded-2xl border border-border p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Smartphone aria-hidden className="size-7 text-primary" />
                  <h3 className="font-heading text-xl font-semibold">Sebagai pasien</h3>
                </div>
                <ol className="flex list-decimal flex-col gap-1.5 pl-5 leading-relaxed">
                  <li>Buka di HP, sebaiknya dengan Chrome (iPhone: Safari).</li>
                  <li>Izinkan kamera saat diminta. Video tidak direkam.</li>
                  <li>Letakkan HP berdiri setinggi dada, lalu ikuti panduan suara.</li>
                </ol>
                {qr && urlDemoPasien && (
                  <div className="hidden items-center gap-5 rounded-xl bg-mint-pucat p-4 md:flex">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL SVG dibuat saat build */}
                    <img src={qr} alt="Kode QR untuk membuka latihan demo di HP" width={132} height={132} className="size-33 rounded-lg bg-card p-1.5" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <b className="block text-base font-semibold text-foreground">Pindai dengan kamera HP</b>
                      Latihan memakai kamera depan HP, jadi paling baik dicoba langsung di HP.
                    </p>
                  </div>
                )}
                <a href={JALUR_DEMO_PASIEN} className={`${kelasCtaUtama} mt-auto`}>
                  Buka latihan demo <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>

              <div id="coba-terapis" className="flex scroll-mt-4 flex-col gap-5 rounded-2xl border border-border bg-mint-pucat p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Stethoscope aria-hidden className="size-7 text-primary" />
                  <h3 className="font-heading text-xl font-semibold">Sebagai fisioterapis</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">Masuk sebagai &ldquo;Rina (akun demo)&rdquo; dengan dua pasien contoh. Yang bisa dicoba:</p>
                <ul className="flex flex-col gap-2">
                  {COBA_TERAPIS.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3">
                  <form action={masukDemo}>
                    <button type="submit" className={`${kelasCtaUtama} w-full`}>
                      Masuk dengan akun demo <ArrowRight aria-hidden className="size-4" />
                    </button>
                  </form>
                  <Link href="/masuk" className="text-center text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    atau masuk dengan akun sendiri
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2">
            <Logo className="size-6" />
            <span>
              <b className="font-semibold text-foreground">GerakPulih</b> · IT RUSH 2026 · Web Development · [Nama Tim] · [Anggota 1], [Anggota 2]
            </span>
          </p>
          <p>Next.js · Supabase · MediaPipe · Gemini. Dikembangkan dengan bantuan AI coding assistant (lihat README).</p>
        </div>
      </footer>
    </div>
  );
}
