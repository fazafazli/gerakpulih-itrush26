import type { Kepatuhan } from "@/lib/terapis/olah";
import { labelTanggal } from "@/lib/terapis/olah";
import { cn } from "@/lib/utils";

/** 4 baris × 7 hari (baris terakhir berakhir hari ini) + jumlah sesi tiap baris. */
export function KalenderKepatuhan({ kepatuhan }: { kepatuhan: Kepatuhan }) {
  const minggu = kepatuhan.perMinggu.map((m, i) => ({ ...m, hari: kepatuhan.hari.slice(i * 7, i * 7 + 7) }));
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {minggu.map((m) => (
          <li key={m.mulai} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">{labelTanggal(m.mulai)}</span>
            <ol className="grid grid-cols-7 gap-1.5">
              {m.hari.map((h) => (
                <li
                  key={h.tanggal}
                  title={`${labelTanggal(h.tanggal)}: ${h.jumlahSesi} sesi${h.nyeri ? ", ada laporan nyeri" : ""}`}
                  className={cn(
                    "flex aspect-square max-h-9 items-center justify-center rounded-md text-[10px] font-bold",
                    h.jumlahSesi === 0 && "bg-mint-pucat ring-1 ring-border ring-inset",
                    h.jumlahSesi > 0 && !h.nyeri && "bg-primary text-primary-foreground",
                    h.nyeri && "bg-bahaya text-white",
                  )}
                >
                  <span className="sr-only">
                    {labelTanggal(h.tanggal)}: {h.jumlahSesi} sesi{h.nyeri ? ", ada laporan nyeri" : ""}
                  </span>
                  <span aria-hidden>{h.nyeri ? "!" : h.jumlahSesi > 1 ? h.jumlahSesi : ""}</span>
                </li>
              ))}
            </ol>
            <span className="w-16 text-right text-sm tabular-nums">
              <b className="font-semibold">{m.hariLatihan}</b>
              <span className="text-muted-foreground">/7 hari</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-sm bg-primary" /> Ada sesi
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-sm bg-bahaya" /> Dihentikan karena nyeri
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-sm bg-mint-pucat ring-1 ring-border ring-inset" /> Tidak berlatih
        </span>
      </p>
    </div>
  );
}
