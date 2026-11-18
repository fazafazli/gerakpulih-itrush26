import Link from "next/link";
import { Logo } from "@/components/terapis/kepala-terapis";

/**
 * Header pasien: logo ke /beranda (bukan ke landing; pasien lansia tidak perlu halaman pemasaran) + sapaan.
 */
export function KepalaPasien({ nama }: { nama?: string }) {
  return (
    <header className="gp-tekstur -mx-5 flex items-center justify-between gap-3 border-b border-border bg-mint-pucat px-5 py-3">
      <Link
        href="/beranda"
        className="flex min-h-11 items-center gap-2 rounded-md font-heading text-lg font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Logo /> GerakPulih
      </Link>
      {nama && <span className="truncate text-lg font-semibold">Halo, {nama}</span>}
    </header>
  );
}
