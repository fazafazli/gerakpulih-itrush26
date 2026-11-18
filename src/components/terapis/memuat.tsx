import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Blok skeleton bernuansa mint; denyut dimatikan saat reduced-motion. */
const Blok = ({ className }: { className?: string }) => <Skeleton className={cn("bg-mint motion-reduce:animate-none", className)} />;

/** Kerangka umum (form & halaman sederhana). Header sudah dirender layout. */
export function MemuatHalaman() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Blok className="h-5 w-40" />
      <Blok className="h-9 w-72" />
      <Blok className="h-80" />
    </div>
  );
}

/** Menyerupai dashboard: sapaan, panel "Perlu ditinjau", cincin kepatuhan, tabel pasien. */
export function MemuatDashboard() {
  return (
    <div aria-busy="true" aria-label="Memuat dashboard" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <Blok className="h-4 w-36" />
        <Blok className="h-9 w-56" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <Blok className="h-5 w-32" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Blok className="size-5 rounded-full" />
              <Blok className="h-10 flex-1" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-5 rounded-xl bg-mint-pucat p-5">
          <Blok className="size-24 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Blok className="h-10 w-24" />
            <Blok className="h-3 w-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Blok className="h-10 w-40" />
            <Blok className="h-6 w-24 rounded-md" />
            <Blok className="ml-auto h-7 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Menyerupai detail pasien: breadcrumb, nama, grafik, kalender 4×7, kolom samping. */
export function MemuatDetail() {
  return (
    <div aria-busy="true" aria-label="Memuat detail pasien" className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <Blok className="h-4 w-44" />
      <Blok className="h-9 w-60" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <Blok className="h-10 w-full rounded-lg" />
            <Blok className="h-56 w-full" />
          </div>
          <div className="grid grid-cols-7 gap-1.5 rounded-xl border border-border bg-card p-5">
            {Array.from({ length: 28 }, (_, i) => (
              <Blok key={i} className="aspect-square max-h-9 rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Blok className="h-64 rounded-xl" />
          <Blok className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
