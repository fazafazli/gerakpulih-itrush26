import { LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { keluar } from "@/app/(terapis)/masuk/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Header ringan tanpa sidebar: ruang kerja tetap lebar di laptop & HP. */
export function KepalaTerapis({ nama, institusi }: { nama: string; institusi: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-md font-heading text-lg font-bold tracking-tight text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Logo />
          GerakPulih
        </Link>
        <span className="hidden text-sm text-muted-foreground md:inline">· Ruang kerja fisioterapis</span>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/pasien/baru" className={cn(buttonVariants(), "h-10 gap-2 px-3 text-sm sm:px-4")}>
            <UserPlus aria-hidden className="size-4" />
            <span className="hidden sm:inline">Tambah pasien</span>
            <span className="sr-only sm:hidden">Tambah pasien</span>
          </Link>
          <div className="hidden text-right leading-tight lg:block">
            <p className="text-sm font-semibold">{nama}</p>
            {institusi && <p className="text-xs text-muted-foreground">{institusi}</p>}
          </div>
          <form action={keluar}>
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "ghost" }), "h-10 gap-2 px-3 text-sm text-muted-foreground")}
            >
              <LogOut aria-hidden className="size-4" />
              <span className="hidden sm:inline">Keluar</span>
              <span className="sr-only sm:hidden">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
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
