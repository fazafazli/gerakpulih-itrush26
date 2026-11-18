import { Activity, ClipboardCheck, PartyPopper, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

/** Empat tahap dengan identitas visual masing-masing: ikon + warna + nama (bukan warna saja). */
const TAHAP = [
  { nama: "Siapkan", ikon: ClipboardCheck, pita: "bg-mint text-primary", isi: "bg-primary" },
  { nama: "Cek posisi", ikon: ScanFace, pita: "bg-cyan-lembut text-biru", isi: "bg-biru" },
  { nama: "Latihan", ikon: Activity, pita: "bg-primary text-primary-foreground", isi: "bg-primary" },
  { nama: "Selesai", ikon: PartyPopper, pita: "bg-sukses-bg text-sukses-teks", isi: "bg-sukses" },
] as const;

export type IndeksTahap = 0 | 1 | 2 | 3;

export function PenandaLangkah({ aktif }: { aktif: IndeksTahap }) {
  const t = TAHAP[aktif];
  const Ikon = t.ikon;
  return (
    <div className="flex flex-col gap-2.5">
      <ol className="grid grid-cols-4 gap-1.5" aria-label="Tahap latihan">
        {TAHAP.map((x, i) => (
          <li key={x.nama} aria-current={i === aktif ? "step" : undefined} className="flex flex-col">
            <span className={cn("h-2 rounded-full transition-colors", i <= aktif ? x.isi : "bg-muted")} />
            <span className="sr-only">
              {x.nama}
              {i < aktif ? " (selesai)" : i === aktif ? " (sekarang)" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className={cn("flex w-fit items-center gap-2 rounded-full py-1.5 pr-4 pl-2 text-lg font-bold animate-gp-masuk", t.pita)}>
        <Ikon aria-hidden className="size-6" />
        <span>
          <span className="font-semibold opacity-80">Tahap {aktif + 1}/4 · </span>
          {t.nama}
        </span>
      </p>
    </div>
  );
}
