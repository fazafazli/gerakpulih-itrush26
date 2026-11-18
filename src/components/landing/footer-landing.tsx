import Link from "next/link";
import { Logo } from "@/components/terapis/kepala-terapis";
import { kelasTautan } from "./kelas";

const URL_REPO = "https://github.com/fazafazli/gerakpulih-itrush26";
/** Isi dengan tautan video demo (YouTube/Drive) bila sudah ada. */
const URL_VIDEO_DEMO: string | null = null;

function Kolom({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

export function FooterLanding() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
            <Logo /> GerakPulih
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Membantu fisioterapis mendampingi latihan lengan pasien pasca-stroke di rumah.
          </p>
          <p className="text-sm font-semibold">Alat bantu terapis, bukan alat diagnosis.</p>
        </div>

        <Kolom judul="Coba">
          <li>
            {/* Navigasi penuh, bukan <Link>: /mulai adalah route handler (cookie + redirect); prefetch bisa memicunya tanpa diklik. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- lihat komentar di atas */}
            <a href="/mulai/demo-budi" className={`${kelasTautan} text-sm`}>
              Demo pasien
            </a>
          </li>
          <li>
            <a href="#coba-terapis" className={`${kelasTautan} text-sm`}>
              Demo terapis
            </a>
          </li>
          <li>
            <Link href="/privasi" className={`${kelasTautan} text-sm`}>
              Halaman privasi
            </Link>
          </li>
        </Kolom>

        <Kolom judul="Proyek">
          <li>
            <a href={URL_REPO} rel="noopener noreferrer" className={`${kelasTautan} text-sm`}>
              Repositori GitHub
            </a>
          </li>
          <li>
            {URL_VIDEO_DEMO ? (
              <a href={URL_VIDEO_DEMO} rel="noopener noreferrer" className={`${kelasTautan} text-sm`}>
                Video demo
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center text-sm text-muted-foreground">Video demo (menyusul)</span>
            )}
          </li>
          <li>
            <a href={`${URL_REPO}#readme`} rel="noopener noreferrer" className={`${kelasTautan} text-sm`}>
              Dokumentasi (README)
            </a>
          </li>
        </Kolom>

        <Kolom judul="Teknologi">
          {["Next.js", "Supabase", "MediaPipe (di perangkat)", "Gemini (ringkasan terapis)"].map((t) => (
            <li key={t} className="flex min-h-11 items-center text-sm text-muted-foreground">
              {t}
            </li>
          ))}
        </Kolom>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-muted-foreground sm:px-6">
          Karya untuk IT RUSH 2026 — Web Development, HIMATIF UNIB · [Nama Tim] · 2026 · Dikembangkan dengan bantuan AI coding assistant;
          lihat README.
        </p>
      </div>
    </footer>
  );
}
