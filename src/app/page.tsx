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
import { BusurSudut } from "@/components/ilustrasi/busur-sudut";
import { IlustrasiGerakan } from "@/components/ilustrasi/ilustrasi-gerakan";
import { Faq } from "@/components/landing/faq";
import { FooterLanding } from "@/components/landing/footer-landing";
import { Hero } from "@/components/landing/hero";
import { kelasCtaUtama, kelasTautan } from "@/components/landing/kelas";
import { NavbarLanding } from "@/components/landing/navbar-landing";
import { PenandaMuncul } from "@/components/landing/penanda-muncul";
import { GERAKAN, KODE_GERAKAN } from "@/lib/pose/exercises";
import { qrDataUrl } from "@/lib/qr";
import { originPublik } from "@/lib/situs";
import { cn } from "@/lib/utils";

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

/** Kerangka section: jarak vertikal dari token --spacing-section; judul tidak tertutup navbar sticky. */
const section = "scroll-mt-16 py-section";
const wadah = "mx-auto max-w-6xl px-4 sm:px-6";
const judulSection = "font-heading text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] font-bold tracking-tight text-balance";

export default async function Beranda() {
  const origin = originPublik();
  const urlDemoPasien = origin ? `${origin}${JALUR_DEMO_PASIEN}` : null;
  const qr = urlDemoPasien ? await qrDataUrl(urlDemoPasien) : null;

  return (
    <div className="relative flex flex-1 flex-col">
      <a
        href="#konten"
        className="sr-only z-50 rounded-md bg-card px-4 py-3 font-semibold text-primary shadow focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Lewati ke konten
      </a>
      {/* Penanda posisi paling atas: navbar transparan selama elemen ini terlihat. */}
      <div id="penanda-atas" aria-hidden className="pointer-events-none absolute top-0 left-0 h-px w-px" />
      <NavbarLanding />
      <PenandaMuncul />

      {/* Navbar sticky menumpang di atas hero (latar hero ikut terlihat saat navbar transparan). */}
      <main className="-mt-16">
        <div className="gp-tekstur bg-mint-pucat pt-16">
          <Hero />
        </div>

        {/* Masalah: editorial, latar putih */}
        <section aria-labelledby="judul-masalah" className={cn(section, "bg-card")}>
          <div className={cn(wadah, "gp-muncul grid gap-8 md:grid-cols-[1fr_2fr]")}>
            <div className="flex flex-col gap-3">
              <BusurSudut sudut={40} className="w-16" />
              <h2 id="judul-masalah" className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">
                Masalahnya
              </h2>
            </div>
            <div className="flex flex-col gap-5 border-l-4 border-teal-segar pl-6">
              <p className="font-heading text-[clamp(1.4rem,1.1rem+1vw,1.85rem)] leading-snug font-medium text-balance">
                Setelah pulang dari rumah sakit, pasien pasca-stroke melanjutkan latihan lengan sendiri di rumah, sering tanpa ada yang
                melihat.
              </p>
              <p className="max-w-[65ch] text-lg leading-relaxed text-muted-foreground">
                Pasien dan keluarga tidak tahu apakah gerakannya sudah benar dan cukup tinggi. Fisioterapis tidak tahu apakah latihan
                dilakukan, seberapa jauh progresnya, atau kapan pasien merasa sakit, sampai jadwal kontrol berikutnya.
              </p>
            </div>
          </div>
        </section>

        {/* Cara kerja: linimasa, latar soft cyan */}
        <section id="cara-kerja" aria-labelledby="judul-cara" className={cn(section, "gp-tekstur bg-cyan-lembut")}>
          <div className={cn(wadah, "gp-muncul")}>
            <h2 id="judul-cara" className={judulSection}>
              Cara kerja
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {LANGKAH.map(({ ikon: Ikon, judul, isi }, i) => (
                <li key={judul} className="relative flex flex-col gap-3 border-t-2 border-primary/25 pt-7">
                  <span className="absolute -top-4 left-0 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-4 ring-cyan-lembut">
                    {i + 1}
                  </span>
                  <Ikon aria-hidden className="size-7 text-primary" />
                  <h3 className="font-heading text-lg font-semibold">{judul}</h3>
                  <p className="leading-relaxed text-muted-foreground">{isi}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Fitur dua sisi: latar putih, satu panel terbelah */}
        <section id="fitur" aria-labelledby="judul-fitur" className={cn(section, "bg-card")}>
          <div className={cn(wadah, "gp-muncul")}>
            <h2 id="judul-fitur" className={judulSection}>
              Satu alur, dua pengguna
            </h2>
            {/* Tiga gerakan lengan yang didukung, dengan contoh gerak yang sama seperti di layar pasien */}
            <ul className="gp-tekstur mt-10 grid grid-cols-3 gap-2 rounded-2xl bg-mint-pucat px-3 py-6 sm:gap-6 sm:px-8">
              {KODE_GERAKAN.map((k) => (
                <li key={k} className="flex flex-col items-center gap-2 text-center">
                  <IlustrasiGerakan kode={k} className="h-24 w-auto sm:h-32" />
                  <span className="text-sm font-semibold sm:text-base">{GERAKAN[k].nama}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid overflow-hidden rounded-2xl border border-border md:grid-cols-2">
              <div className="flex flex-col gap-5 p-6 sm:p-8">
                <h3 className="font-heading text-xl font-semibold">Untuk pasien & pendamping</h3>
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
                <h3 className="font-heading text-xl font-semibold">Untuk fisioterapis</h3>
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
          </div>
        </section>

        {/* Privasi & keamanan: pita mint */}
        <section id="privasi" aria-labelledby="judul-privasi" className={cn(section, "bg-mint")}>
          <div className={cn(wadah, "gp-muncul")}>
            <div className="max-w-2xl">
              <h2 id="judul-privasi" className={judulSection}>
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
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                    <Ikon aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{judul}</h3>
                    <p className="mt-1 leading-relaxed text-secondary-foreground">{isi}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-10">
              <Link href="/privasi" className={cn(kelasTautan, "gap-1 font-semibold text-primary")}>
                Baca halaman privasi untuk pasien <ArrowRight aria-hidden className="size-4" />
              </Link>
            </p>
          </div>
        </section>

        {/* Peran AI & batasan: putih, dua kolom */}
        <section aria-label="Peran AI dan batasan" className={cn(section, "bg-card")}>
          <div className={cn(wadah, "gp-muncul grid gap-12 md:grid-cols-2")}>
            <div className="flex flex-col gap-4">
              <Bot aria-hidden className="size-8 text-primary" />
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Peran AI</h2>
              <ul className="flex flex-col gap-3 leading-relaxed text-muted-foreground">
                <li>
                  <b className="font-semibold text-foreground">Di HP pasien:</b> model deteksi pose MediaPipe menghitung sudut dan repetisi.
                  Aturan hitungan, suara, dan peringatan postur bersifat tetap dan tidak memakai AI generatif.
                </li>
                <li>
                  <b className="font-semibold text-foreground">Untuk terapis:</b> Gemini merangkum angka latihan tanpa nama atau identitas,
                  diberi label &ldquo;Dibuat AI · perlu ditinjau&rdquo;. Bila AI tidak tersedia, dipakai template dari aturan tetap.
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
          </div>
        </section>

        {/* FAQ: pale mint, <details> native */}
        <section id="faq" aria-labelledby="judul-faq" className={cn(section, "bg-mint-pucat")}>
          <div className={cn(wadah, "gp-muncul grid gap-10 lg:grid-cols-[1fr_2fr]")}>
            <div>
              <h2 id="judul-faq" className={judulSection}>
                Pertanyaan umum
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">Jawaban singkat tentang cara kerja, data, dan batasan GerakPulih.</p>
            </div>
            <Faq />
          </div>
        </section>

        {/* Coba demo */}
        <section id="coba" aria-labelledby="judul-coba" className={cn(section, "bg-card")}>
          <div className={cn(wadah, "gp-muncul")}>
            <h2 id="judul-coba" className={judulSection}>
              Coba demo
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Data contoh, aman untuk dicoba. Pasien contoh dijaga agar tidak bisa dihapus.</p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div id="coba-pasien" className="flex scroll-mt-20 flex-col gap-5 rounded-2xl border border-border p-6 sm:p-8">
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
                {/* <a> biasa (bukan <Link>): /mulai adalah route handler yang menyetel cookie; jangan di-prefetch. */}
                <a href={JALUR_DEMO_PASIEN} className={`${kelasCtaUtama} mt-auto`}>
                  Buka latihan demo <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>

              <div id="coba-terapis" className="flex scroll-mt-20 flex-col gap-5 rounded-2xl border border-border bg-mint-pucat p-6 sm:p-8">
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
                <div className="mt-auto flex flex-col items-center gap-2">
                  <form action={masukDemo} className="w-full">
                    <button type="submit" className={`${kelasCtaUtama} w-full`}>
                      Masuk dengan akun demo <ArrowRight aria-hidden className="size-4" />
                    </button>
                  </form>
                  <Link href="/masuk" className={cn(kelasTautan, "text-sm font-semibold underline")}>
                    atau masuk dengan akun sendiri
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterLanding />
    </div>
  );
}
