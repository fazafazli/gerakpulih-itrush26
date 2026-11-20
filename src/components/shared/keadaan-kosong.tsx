import type { ReactNode } from "react";
import { BusurSudut } from "@/components/ilustrasi/busur-sudut";
import { cn } from "@/lib/utils";

/**
 * Empty state dengan motif busur yang sama di semua tempat. nada "positif" untuk kabar baik
 * (mis. tidak ada laporan nyeri): busur hijau, bukan kesan "kosong/gagal".
 */
export function KeadaanKosong({
  judul,
  isi,
  aksi,
  nada = "netral",
  sudut = 60,
  ringkas = false,
  className,
}: {
  judul: string;
  isi?: ReactNode;
  aksi?: ReactNode;
  nada?: "netral" | "positif";
  sudut?: number;
  ringkas?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl",
        ringkas ? "px-5 py-5" : "flex-col items-start border border-dashed border-primary/30 bg-mint-pucat p-6 sm:p-8",
        className,
      )}
    >
      <BusurSudut sudut={sudut} nada={nada === "positif" ? "sukses" : "utama"} className={ringkas ? "w-14 shrink-0" : "w-24"} />
      <div className="flex flex-col gap-1.5">
        <p className={cn("font-heading font-semibold", ringkas ? "text-base" : "text-xl", nada === "positif" && "text-sukses-teks")}>{judul}</p>
        {isi && <div className="max-w-prose text-sm leading-relaxed text-muted-foreground">{isi}</div>}
        {aksi && <div className="pt-2">{aksi}</div>}
      </div>
    </div>
  );
}
