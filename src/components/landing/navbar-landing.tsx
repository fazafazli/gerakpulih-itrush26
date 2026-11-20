"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/terapis/kepala-terapis";
import { cn } from "@/lib/utils";

export const BAGIAN_LANDING = [
  { id: "cara-kerja", label: "Cara kerja" },
  { id: "fitur", label: "Fitur" },
  { id: "privasi", label: "Privasi" },
  { id: "faq", label: "FAQ" },
] as const;
const ID_PANTAU = [...BAGIAN_LANDING.map((b) => b.id), "coba"];

const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";
const tombolUtama = `inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px ${fokus}`;
const tombolKedua = `inline-flex min-h-11 items-center justify-center rounded-lg border border-primary/30 bg-card px-4 text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:bg-mint active:translate-y-px ${fokus}`;

/**
 * Navbar landing. Tanpa JS: navbar solid + tautan jangkar biasa + menu <details> native.
 * Dengan JS (IntersectionObserver, tanpa event scroll): transparan saat di paling atas, scroll-spy,
 * dan menu mobile bisa ditutup dengan Esc / klik tautan dengan fokus dikembalikan ke tombol menu.
 */
export function NavbarLanding() {
  const [diAtas, setDiAtas] = useState(false);
  const [aktif, setAktif] = useState<string | null>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const penanda = document.getElementById("penanda-atas");
    if (!penanda) return;
    const io = new IntersectionObserver(([e]) => setDiAtas(e.isIntersecting));
    io.observe(penanda);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entri) => {
        for (const e of entri) if (e.isIntersecting) setAktif(e.target.id);
      },
      // Bagian dianggap aktif saat melewati garis tengah layar.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ID_PANTAU) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    const hero = document.getElementById("konten");
    const ioHero = new IntersectionObserver(([e]) => e.isIntersecting && setAktif(null), { rootMargin: "-45% 0px -50% 0px" });
    if (hero) ioHero.observe(hero);
    return () => {
      io.disconnect();
      ioHero.disconnect();
    };
  }, []);

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

  function tutupMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  function saatMenuBerubah() {
    const menu = menuRef.current;
    if (menu?.open) menu.querySelector<HTMLAnchorElement>("[data-menu-tautan]")?.focus();
  }

  const tautan = (id: string, label: string, kelas: string) => (
    <a
      key={id}
      href={`#${id}`}
      aria-current={aktif === id ? "location" : undefined}
      className={cn(kelas, aktif === id && "font-bold text-foreground after:scale-x-100")}
    >
      {label}
    </a>
  );

  return (
    <header
      data-keadaan={diAtas ? "atas" : "tergulir"}
      className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm transition-[background-color,border-color] duration-300 data-[keadaan=atas]:border-transparent data-[keadaan=atas]:bg-transparent data-[keadaan=atas]:backdrop-blur-none"
    >
      <nav aria-label="Utama" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className={`flex shrink-0 items-center gap-2 rounded-md font-heading text-lg font-bold tracking-tight text-primary ${fokus}`}>
          <Logo /> GerakPulih
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {BAGIAN_LANDING.map((b) =>
            tautan(
              b.id,
              b.label,
              `relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform ${fokus}`,
            ),
          )}
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/masuk" className={tombolKedua}>
            Masuk terapis
          </Link>
          <a href="#coba" aria-current={aktif === "coba" ? "location" : undefined} className={cn(tombolUtama, aktif === "coba" && "ring-2 ring-primary/30 ring-offset-2")}>
            Coba demo
          </a>
        </div>

        {/* Di bawah lg: menu <details> (tetap bisa dibuka/tutup tanpa JS) */}
        <details ref={menuRef} onToggle={saatMenuBerubah} className="group ml-auto lg:hidden">
          <summary
            className={`flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted [&::-webkit-details-marker]:hidden ${fokus}`}
          >
            <Menu aria-hidden className="size-5 group-open:hidden" />
            <X aria-hidden className="hidden size-5 group-open:block" />
            <span className="sr-only">Menu</span>
          </summary>
          <div className="absolute inset-x-0 top-16 border-b border-border bg-card shadow-lg">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
              {BAGIAN_LANDING.map((b) => (
                <a
                  key={b.id}
                  href={`#${b.id}`}
                  data-menu-tautan
                  onClick={tutupMenu}
                  aria-current={aktif === b.id ? "location" : undefined}
                  className={cn(
                    `flex min-h-12 items-center rounded-lg border-l-4 border-transparent px-3 text-lg font-medium hover:bg-mint-pucat ${fokus}`,
                    aktif === b.id && "border-primary bg-mint-pucat font-bold",
                  )}
                >
                  {b.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
                <Link href="/masuk" onClick={tutupMenu} className={cn(tombolKedua, "min-h-12 text-base")}>
                  Masuk terapis
                </Link>
                <a href="#coba" onClick={tutupMenu} className={cn(tombolUtama, "min-h-12 text-base")}>
                  Coba demo
                </a>
              </div>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
