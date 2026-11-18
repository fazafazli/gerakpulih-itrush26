import { CircleAlert, CircleCheck, CircleDashed, CirclePause, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABEL_STATUS, type StatusPasien } from "@/lib/terapis/olah";

/** Status selalu ikon + teks + warna (tidak hanya warna). */
const GAYA: Record<StatusPasien, { ikon: typeof CircleAlert; kelas: string }> = {
  nyeri: { ikon: CircleAlert, kelas: "bg-bahaya-bg text-bahaya" },
  tidak_latihan: { ikon: CirclePause, kelas: "bg-peringatan-bg text-peringatan-teks" },
  belum_mulai: { ikon: CircleDashed, kelas: "bg-cyan-lembut text-muted-foreground" },
  baik: { ikon: CircleCheck, kelas: "bg-sukses-bg text-sukses-teks" },
  nonaktif: { ikon: Link2Off, kelas: "bg-muted text-muted-foreground" },
};

export function LencanaStatus({ status, className }: { status: StatusPasien; className?: string }) {
  const { ikon: Ikon, kelas } = GAYA[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap", kelas, className)}>
      <Ikon aria-hidden className="size-3.5" />
      {LABEL_STATUS[status]}
    </span>
  );
}
