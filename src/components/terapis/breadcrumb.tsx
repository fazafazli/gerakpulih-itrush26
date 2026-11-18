import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Remah = { label: string; href?: string };

/** "Dashboard / Pak Budi / Program". Item terakhir = halaman ini (tanpa tautan, aria-current). */
export function Breadcrumb({ remah }: { remah: readonly Remah[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {remah.map((r, i) => {
          const terakhir = i === remah.length - 1;
          return (
            <li key={`${r.label}-${i}`} className="flex items-center gap-1">
              {r.href && !terakhir ? (
                <Link
                  href={r.href}
                  className="inline-flex min-h-11 items-center rounded-md px-1 font-medium underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {r.label}
                </Link>
              ) : (
                <span aria-current={terakhir ? "page" : undefined} className="px-1 font-semibold text-foreground">
                  {r.label}
                </span>
              )}
              {!terakhir && <ChevronRight aria-hidden className="size-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
