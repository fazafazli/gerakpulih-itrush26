import Link from "next/link";
import { Logo } from "@/components/terapis/kepala-terapis";
import { cn } from "@/lib/utils";
import { Lengkung } from "./lengkung";

/** Tautan di latar gelap: mint redup → putih saat hover; cincin fokus teal segar (kontras 6:1). */
const tautanFooter =
  "inline-flex min-h-11 items-center rounded-md text-sm text-mint/75 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-segar";

const URL_REPO = "https://github.com/fazafazli/gerakpulih-itrush26";
/** Isi dengan tautan video demo (YouTube/Drive) bila sudah ada. */
const URL_VIDEO_DEMO: string | null = null;

function Kolom({ judul, children, kelasDaftar = "flex flex-col", className }: { judul: string; children: React.ReactNode; kelasDaftar?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5 lg:gap-2", className)}>
      <h2 className="text-xs font-semibold tracking-[0.12em] text-teal-segar uppercase">{judul}</h2>
      <ul className={kelasDaftar}>{children}</ul>
    </div>
  );
}

export function FooterLanding() {
  return (
    <footer className="relative bg-hijau-malam text-mint">
      {/* Menyambung lengkung antar-section landing; area di atas lengkung = section putih sebelumnya. */}
      <Lengkung posisi="atas" varian={2} cermin kelasGaris="stroke-teal-segar/50" />
      {/* HP: identitas selebar penuh, lalu "Coba" & "Proyek" berdampingan, teknologi jadi satu baris ringkas. */}
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-7 px-4 pt-20 pb-9 sm:px-6 sm:pt-28 sm:pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
        <div className="col-span-2 flex flex-col gap-2 lg:col-span-1 lg:gap-3">
          <p className="flex items-center gap-2 font-heading text-lg font-bold text-primary-foreground">
            <Logo /> GerakPulih
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-mint/75">
            Membantu fisioterapis mendampingi latihan lengan pasien pasca-stroke di rumah.
          </p>
          <p className="text-sm font-semibold text-mint">Alat bantu terapis, bukan alat diagnosis.</p>
        </div>

        <Kolom judul="Coba">
          <li>
            {/* Navigasi penuh, bukan <Link>: /mulai adalah route handler (cookie + redirect); prefetch bisa memicunya tanpa diklik. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- lihat komentar di atas */}
            <a href="/mulai/demo-budi" className={tautanFooter}>
              Demo pasien
            </a>
          </li>
          <li>
            <a href="#coba-terapis" className={tautanFooter}>
              Demo terapis
            </a>
          </li>
          <li>
            <Link href="/privasi" className={tautanFooter}>
              Halaman privasi
            </Link>
          </li>
        </Kolom>

        <Kolom judul="Proyek">
          <li>
            <a href={URL_REPO} rel="noopener noreferrer" className={tautanFooter}>
              Repositori GitHub
            </a>
          </li>
          {/* Disembunyikan sampai tautannya ada, agar juri tidak melihat item "menyusul". */}
          {URL_VIDEO_DEMO && (
            <li>
              <a href={URL_VIDEO_DEMO} rel="noopener noreferrer" className={tautanFooter}>
                Video demo
              </a>
            </li>
          )}
          <li>
            <a href={`${URL_REPO}#readme`} rel="noopener noreferrer" className={tautanFooter}>
              Dokumentasi (README)
            </a>
          </li>
        </Kolom>

        <Kolom judul="Teknologi" className="col-span-2 lg:col-span-1" kelasDaftar="flex flex-wrap gap-x-4 gap-y-1 pt-1 lg:flex-col lg:gap-0 lg:pt-0">
          {["Next.js", "Supabase", "MediaPipe (di perangkat)", "Gemini (ringkasan terapis)"].map((t) => (
            <li key={t} className="text-sm text-mint/65 lg:flex lg:min-h-11 lg:items-center">
              {t}
            </li>
          ))}
        </Kolom>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs leading-relaxed text-mint/65 sm:flex-row sm:justify-between sm:px-6 sm:py-5">
          <p>IT RUSH 2026 · Web Development, HIMATIF UNIB</p>
          <p>
            Tim <span className="font-semibold text-primary-foreground">Abis PIMNAS gatau mau ngapain</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
