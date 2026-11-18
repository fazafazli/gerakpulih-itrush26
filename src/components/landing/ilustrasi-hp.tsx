import { Activity, CircleCheck, HeartPulse, OctagonX } from "lucide-react";

/**
 * Tiruan layar latihan GerakPulih dari HTML/CSS (tanpa gambar): menunjukkan apa yang dilihat pasien,
 * memakai komponen visual yang sama dengan aplikasi (penanda tahap, sudut, hitungan, tombol berhenti).
 */
export function IlustrasiHp() {
  return (
    <div
      role="img"
      aria-label="Contoh layar latihan: sudut lengan 92 derajat, target tercapai, hitungan 7 dari 10, dengan tombol Berhenti, terasa sakit."
      className="relative mx-auto w-full max-w-[300px]"
    >
      <div className="rounded-[2.25rem] border border-border bg-card p-3 shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--foreground)_45%,transparent)]">
        <div className="flex flex-col gap-3 rounded-[1.6rem] bg-background p-3">
          <div className="grid grid-cols-4 gap-1">
            <span className="h-1.5 rounded-full bg-primary" />
            <span className="h-1.5 rounded-full bg-biru" />
            <span className="h-1.5 rounded-full bg-primary" />
            <span className="h-1.5 rounded-full bg-muted" />
          </div>
          <p className="flex w-fit items-center gap-1.5 rounded-full bg-primary py-1 pr-3 pl-1.5 text-xs font-bold text-primary-foreground">
            <Activity className="size-4" /> Tahap 3/4 · Latihan
          </p>

          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-foreground">
            {/* Siluet sederhana: lengan kanan terangkat ke samping */}
            <svg viewBox="0 0 120 160" className="absolute inset-0 size-full">
              <circle cx="60" cy="42" r="13" fill="var(--muted-foreground)" opacity="0.55" />
              <path d="M42 62h36l6 58H36z" fill="var(--muted-foreground)" opacity="0.4" />
              <path d="M44 66 22 96" stroke="var(--muted-foreground)" strokeWidth="7" strokeLinecap="round" opacity="0.45" />
              <path d="M77 66 104 62" stroke="var(--teal-segar)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="77" cy="66" r="4" fill="var(--card)" stroke="var(--teal-segar)" strokeWidth="2.5" />
              <circle cx="104" cy="62" r="4" fill="var(--card)" stroke="var(--teal-segar)" strokeWidth="2.5" />
            </svg>
            <div className="absolute top-2 left-2 rounded-xl bg-sukses-bg px-2 py-1 ring-2 ring-sukses">
              <p className="flex items-center gap-1 text-xl font-extrabold tabular-nums">
                92° <CircleCheck className="size-5 text-sukses-teks" />
              </p>
              <p className="text-[10px] font-bold text-sukses-teks">Target tercapai!</p>
            </div>
            <div className="absolute top-2 right-2 rounded-xl bg-card px-2.5 py-1 text-center">
              <span className="text-2xl font-extrabold tabular-nums">7</span>
              <span className="text-sm font-bold text-muted-foreground"> / 10</span>
            </div>
          </div>

          <p className="text-sm font-bold">Angkat tangan kanan ke samping</p>
          <p className="flex items-center justify-center gap-1.5 rounded-xl bg-bahaya py-2.5 text-sm font-bold text-primary-foreground">
            <OctagonX className="size-4" /> Berhenti, terasa sakit
          </p>
        </div>
      </div>

      <p className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-sm sm:-left-10">
        <HeartPulse className="size-4 text-bahaya" />
        Laporan nyeri langsung terlihat terapis
      </p>
    </div>
  );
}
