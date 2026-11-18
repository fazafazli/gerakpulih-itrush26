"use client";

import { ExternalLink, LayoutDashboard, LogOut, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { keluar } from "@/app/(terapis)/masuk/actions";
import { cn } from "@/lib/utils";

const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

const MENU = [
  // Detail & program pasien adalah bagian dari Dashboard (bukan "Tambah pasien").
  { href: "/dashboard", label: "Dashboard", ikon: LayoutDashboard, aktif: (p: string) => p === "/dashboard" || (p.startsWith("/pasien/") && p !== "/pasien/baru") },
  { href: "/pasien/baru", label: "Tambah pasien", ikon: UserPlus, aktif: (p: string) => p === "/pasien/baru" },
] as const;

/**
 * Navigasi ruang kerja terapis. Desktop: tautan + identitas + Keluar. HP: menu <details>
 * (pola sama dengan navbar landing; tetap bisa dibuka tanpa JS, Esc menutup & fokus kembali ke tombol).
 */
export function NavTerapis({ nama, email }: { nama: string; email: string | null }) {
  const path = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function saatTombol(e: KeyboardEvent) {
      const menu = menuRef.current;
      if (e.key !== "Escape" || !menu?.open) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
    document.addEventListener("keydown", saatTombol);
    return () => document.removeEventListener("keydown", saatTombol);
  }, []);

  const tutup = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <>
      <nav aria-label="Ruang kerja" className="hidden items-center gap-1 md:flex">
        {MENU.map(({ href, label, ikon: Ikon, aktif }) => {
          const kini = aktif(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={kini ? "page" : undefined}
              className={cn(
                `relative inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform ${fokus}`,
                kini ? "font-bold text-foreground after:scale-x-100" : "after:scale-x-0",
              )}
            >
              <Ikon aria-hidden className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto hidden items-center gap-3 md:flex">
        <Link href="/" className={`inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground ${fokus}`}>
          Lihat situs <ExternalLink aria-hidden className="size-3" />
        </Link>
        <div className="hidden text-right leading-tight lg:block">
          <p className="text-sm font-semibold">{nama}</p>
          {email && <p className="text-xs text-muted-foreground">{email}</p>}
        </div>
        <form action={keluar}>
          <button
            type="submit"
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${fokus}`}
          >
            <LogOut aria-hidden className="size-4" /> Keluar
          </button>
        </form>
      </div>

      <details ref={menuRef} className="group ml-auto md:hidden">
        <summary
          className={`flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-card hover:bg-muted [&::-webkit-details-marker]:hidden ${fokus}`}
        >
          <Menu aria-hidden className="size-5 group-open:hidden" />
          <X aria-hidden className="hidden size-5 group-open:block" />
          <span className="sr-only">Menu</span>
        </summary>
        <div className="absolute inset-x-0 top-16 z-40 border-b border-border bg-card shadow-lg">
          <div className="flex flex-col gap-1 px-4 py-4">
            <p className="px-3 pb-2 text-sm">
              <span className="font-semibold">{nama}</span>
              {email && <span className="block text-muted-foreground">{email}</span>}
            </p>
            {MENU.map(({ href, label, ikon: Ikon, aktif }) => {
              const kini = aktif(path);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={tutup}
                  aria-current={kini ? "page" : undefined}
                  className={cn(
                    `flex min-h-12 items-center gap-3 rounded-lg border-l-4 border-transparent px-3 text-base font-medium hover:bg-mint-pucat ${fokus}`,
                    kini && "border-primary bg-mint-pucat font-bold",
                  )}
                >
                  <Ikon aria-hidden className="size-5 text-primary" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-3">
              <Link href="/" onClick={tutup} className={`inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground ${fokus}`}>
                Lihat situs <ExternalLink aria-hidden className="size-3" />
              </Link>
              <form action={keluar}>
                <button type="submit" className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium ${fokus}`}>
                  <LogOut aria-hidden className="size-4" /> Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </details>
    </>
  );
}
