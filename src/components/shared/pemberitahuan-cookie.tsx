"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const KUNCI = "gp-cookie";
const PERISTIWA = "gp-cookie-berubah";

/** Halaman latihan pasien tidak diberi pemberitahuan: satu fokus per layar untuk pengguna lansia. */
const TANPA_PEMBERITAHUAN = ["/beranda", "/sesi", "/mulai"];

function sudahDibaca(): boolean {
  try {
    return localStorage.getItem(KUNCI) === "1";
  } catch {
    return true; // Penyimpanan diblokir: jangan tampilkan berulang-ulang.
  }
}

function langganan(ubah: () => void) {
  window.addEventListener(PERISTIWA, ubah);
  window.addEventListener("storage", ubah);
  return () => {
    window.removeEventListener(PERISTIWA, ubah);
    window.removeEventListener("storage", ubah);
  };
}

function tandaiDibaca() {
  try {
    localStorage.setItem(KUNCI, "1");
  } catch {
    // Diabaikan; pemberitahuan tetap ditutup untuk halaman ini lewat peristiwa di bawah.
  }
  window.dispatchEvent(new Event(PERISTIWA));
}

/**
 * Pemberitahuan cookie. GerakPulih hanya memakai cookie yang diperlukan (login terapis, sesi pasien,
 * tanda persetujuan), tanpa analitik atau iklan, sehingga tidak ada pilihan "tolak" yang menyesatkan:
 * cukup penjelasan + "Mengerti". Di server dianggap sudah dibaca agar tidak ikut di HTML awal.
 */
export function PemberitahuanCookie() {
  const path = usePathname();
  const dibaca = useSyncExternalStore(langganan, sudahDibaca, () => true);
  if (dibaca || TANPA_PEMBERITAHUAN.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  return (
    <section
      aria-labelledby="judul-cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md animate-gp-masuk flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-lg sm:inset-x-auto sm:left-5 sm:bottom-5"
    >
      <h2 id="judul-cookie" className="flex items-center gap-2 font-heading text-lg font-semibold">
        <span className="flex size-9 items-center justify-center rounded-xl bg-mint text-primary">
          <Cookie aria-hidden className="size-5" />
        </span>
        Kami menghargai privasi Anda
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        GerakPulih hanya memakai cookie yang diperlukan agar masuk dan latihan berjalan. Tidak ada cookie iklan atau pelacak, dan video
        latihan tidak pernah dikirim.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={tandaiDibaca}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Mengerti
        </button>
        <Link
          href="/privasi"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Baca kebijakan privasi
        </Link>
      </div>
    </section>
  );
}
