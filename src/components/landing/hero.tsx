import { ArrowRight, Stethoscope, UserX, VideoOff } from "lucide-react";
import { BusurSudut } from "@/components/ilustrasi/busur-sudut";
import { IlustrasiHp } from "./ilustrasi-hp";
import { kelasCtaKedua, kelasCtaUtama } from "./kelas";

const KEPERCAYAAN = [
  { ikon: VideoOff, teks: "Video tidak keluar dari HP" },
  { ikon: Stethoscope, teks: "Dipantau fisioterapis" },
  { ikon: UserX, teks: "Tanpa akun untuk pasien" },
] as const;

/**
 * Desktop: setinggi layar dikurangi navbar, maksimal 880px, konten di tengah vertikal.
 * HP: tinggi mengikuti konten; judul + kalimat + tombol utama muat di 360×640 tanpa gulir.
 */
export function Hero() {
  return (
    <section id="konten" tabIndex={-1} aria-labelledby="judul-hero" className="relative isolate scroll-mt-20 overflow-x-clip outline-none">
      {/* Motif busur besar & samar di belakang teks (dekoratif) */}
      <BusurSudut nada="halus" sudut={92} className="pointer-events-none absolute -bottom-10 -left-24 -z-10 hidden w-[560px] lg:block" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 sm:pt-12 lg:min-h-[min(calc(100svh-4rem),880px)] lg:grid-cols-[1.2fr_1fr] lg:py-12">
        <div className="flex flex-col gap-5 sm:gap-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase sm:text-sm">Untuk fisioterapis & pasien pasca-stroke</p>
          <h1
            id="judul-hero"
            className="max-w-[18ch] font-heading text-[clamp(2rem,1.2rem+3.6vw,3.6rem)] leading-[1.08] font-bold tracking-tight text-balance"
          >
            Latihan lengan di rumah, tetap dipantau fisioterapis.
          </h1>
          <p className="max-w-[60ch] text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] leading-relaxed text-muted-foreground">
            Kamera HP menghitung repetisi dan sudut gerak saat pasien berlatih, lalu fisioterapis memantau angkanya dari jauh.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#coba" className={kelasCtaUtama}>
              Coba demo <ArrowRight aria-hidden className="size-4" />
            </a>
            <a href="#cara-kerja" className={kelasCtaKedua}>
              Lihat cara kerja
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm text-muted-foreground">
            {KEPERCAYAAN.map(({ ikon: Ikon, teks }) => (
              <li key={teks} className="flex items-center gap-1.5">
                <Ikon aria-hidden className="size-4 text-primary" />
                {teks}
              </li>
            ))}
          </ul>
        </div>
        <div className="pb-4">
          <IlustrasiHp />
        </div>
      </div>
    </section>
  );
}
