"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/terapis/kepala-terapis";

const KUNCI = "gp-intro";
const TAMPIL_MS = 2400;
const PUDAR_MS = 400;

/** Diputuskan sekali per muat halaman, agar menandai "sudah dilihat" tidak langsung menyembunyikan intro. */
let keputusan: boolean | null = null;
function perluIntro(): boolean {
  if (keputusan === null) {
    try {
      keputusan = !localStorage.getItem(KUNCI) && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      keputusan = false;
    }
  }
  return keputusan;
}
const tanpaLangganan = () => () => {};

/**
 * Intro landing sekali per browser: lengan terangkat pelan, logo muncul, lalu memudar (± 2,8 detik).
 * Di server dan saat hidrasi tidak dirender (tidak ada selisih HTML); bisa dilewati dengan tombol atau Esc.
 */
export function IntroAnimasi() {
  const perlu = useSyncExternalStore(tanpaLangganan, perluIntro, () => false);
  const [tahap, setTahap] = useState<"tampil" | "pudar" | "selesai">("tampil");

  useEffect(() => {
    if (!perlu) return;
    try {
      localStorage.setItem(KUNCI, "1");
    } catch {
      // Penyimpanan diblokir: intro mungkin tampil lagi lain kali, tidak masalah.
    }
    const t1 = window.setTimeout(() => setTahap("pudar"), TAMPIL_MS);
    const t2 = window.setTimeout(() => setTahap("selesai"), TAMPIL_MS + PUDAR_MS);
    const saatTombol = (e: KeyboardEvent) => e.key === "Escape" && setTahap("selesai");
    document.addEventListener("keydown", saatTombol);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.removeEventListener("keydown", saatTombol);
    };
  }, [perlu]);

  if (!perlu || tahap === "selesai") return null;

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-primary px-6 text-primary-foreground transition-opacity duration-400 ${
        tahap === "pudar" ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={() => setTahap("selesai")}
        className="absolute top-4 right-4 inline-flex min-h-11 items-center rounded-full border border-primary-foreground/40 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
      >
        Lewati
      </button>

      {/* Sosok sederhana dari div: lengan berputar di bahu (transform-origin atas). */}
      <div aria-hidden className="relative h-56 w-48">
        <span className="absolute top-0 left-10 size-14 rounded-full bg-primary-foreground/30" />
        <span className="absolute top-16 left-4 h-32 w-26 rounded-t-3xl rounded-b-lg bg-primary-foreground/25" />
        <span className="gp-intro-lengan absolute top-[4.5rem] left-[6.75rem] h-28 w-4 origin-top rounded-full bg-primary-foreground">
          <span className="absolute -bottom-2 left-1/2 size-6 -translate-x-1/2 rounded-full bg-teal-segar" />
        </span>
        <span className="absolute top-16 left-[6.25rem] size-6 rounded-full bg-teal-segar" />
      </div>

      <div className="gp-intro-teks flex flex-col items-center gap-2 text-center">
        <p className="flex items-center gap-2 font-heading text-3xl font-bold">
          <span className="rounded-lg bg-primary-foreground p-1">
            <Logo />
          </span>
          GerakPulih
        </p>
        <p className="text-lg text-primary-foreground/85">Setiap gerak lengan, tercatat dan terpantau.</p>
      </div>
    </div>
  );
}
