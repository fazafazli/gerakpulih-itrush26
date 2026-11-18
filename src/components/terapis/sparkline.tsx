import { jalurSparkline } from "@/lib/terapis/olah";

const L = 88;
const T = 28;

/** Tren puncak sudut beberapa sesi terakhir. Garis tergambar sekali; teks sr-only memuat angkanya. */
export function Sparkline({ nilai }: { nilai: readonly number[] }) {
  const jalur = jalurSparkline(nilai, L, T, 3);
  if (!jalur) return <span className="text-xs text-muted-foreground">Belum cukup data</span>;
  const naik = nilai[nilai.length - 1] >= nilai[0];
  const [, xAkhir, yAkhir] = /([\d.]+) ([\d.]+)$/.exec(jalur) ?? [];
  return (
    <span className="inline-flex items-center">
      <svg viewBox={`0 0 ${L} ${T}`} width={L} height={T} aria-hidden className="overflow-visible">
        <path d={jalur} fill="none" stroke={naik ? "var(--primary)" : "var(--peringatan)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="gp-gambar-garis" />
        <circle cx={xAkhir} cy={yAkhir} r="3" fill="var(--card)" stroke={naik ? "var(--primary)" : "var(--peringatan)"} strokeWidth="2" />
      </svg>
      <span className="sr-only">
        Tren puncak {nilai.length} sesi: {Math.round(nilai[0])}° ke {Math.round(nilai[nilai.length - 1])}°
      </span>
    </span>
  );
}
