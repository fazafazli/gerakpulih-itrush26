import type { ReactNode } from "react";
import { BusurSudut } from "@/components/ilustrasi/busur-sudut";
import { Logo } from "@/components/terapis/kepala-terapis";

/** Halaman status bersama (404, galat, link tidak berlaku): motif busur + judul + penjelasan + aksi. */
export function HalamanStatus({ judul, isi, aksi, sudut = 45 }: { judul: string; isi: ReactNode; aksi: ReactNode; sudut?: number }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <p className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
        <Logo /> GerakPulih
      </p>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <BusurSudut sudut={sudut} nada="utama" className="w-28" />
        <h1 className="font-heading text-[28px] leading-tight font-bold">{judul}</h1>
        <div className="text-lg leading-relaxed text-muted-foreground">{isi}</div>
        <div className="flex flex-col gap-3 pt-2">{aksi}</div>
      </div>
    </main>
  );
}

export const kelasAksiUtama =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const kelasAksiKedua =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-5 text-lg font-bold transition-colors hover:bg-mint-pucat active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";
