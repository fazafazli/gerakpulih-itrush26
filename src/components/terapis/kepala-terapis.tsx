import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavTerapis } from "./nav-terapis";

/** Header ruang kerja terapis (tanpa sidebar): dipasang lewat layout dashboard/ dan pasien/. */
export function KepalaTerapis({ nama, email }: { nama: string; email: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 rounded-md font-heading text-lg font-bold tracking-tight text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Logo />
          GerakPulih
        </Link>
        <NavTerapis nama={nama} email={email} />
      </div>
    </header>
  );
}

/** Kerangka header saat data terapis dimuat (tinggi sama agar tidak melompat). */
export function KerangkaKepalaTerapis() {
  return (
    <div className="sticky top-0 z-30 h-16 border-b border-border bg-card/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 font-heading text-lg font-bold text-primary sm:px-6">
        <Logo /> GerakPulih
      </div>
    </div>
  );
}

/** Tanda sederhana: lengkung gerak lengan di atas lingkaran sendi. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <rect width="32" height="32" rx="9" fill="var(--mint)" />
      <path d="M9 23c1-7 5.5-12 13-13" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="9" cy="23" r="2.6" fill="var(--teal-segar)" />
      <circle cx="22.5" cy="10" r="2.6" fill="var(--primary)" />
    </svg>
  );
}
