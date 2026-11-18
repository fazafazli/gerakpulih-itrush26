import { cn } from "@/lib/utils";

/**
 * Motif brand "busur sudut gerak": busur 0–180°, garis skala tiap 30°, jarum ke sudut, titik sendi.
 * Satu motif dipakai di berbagai skala (latar hero, empty state, kartu ringkasan, pemisah, layar selesai).
 * Dekoratif → aria-hidden; informasi yang sama selalu ada sebagai teks di sekitarnya.
 */
const CX = 60;
const CY = 62;
const R = 50;

/** Titik pada busur untuk sudut gerak θ (0° = kiri/istirahat, 180° = kanan). */
function titik(sudut: number, r = R) {
  const rad = ((180 - Math.min(180, Math.max(0, sudut))) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
}

const NADA = {
  halus: { busur: "var(--primary)", isi: "var(--teal-segar)", opasitas: 0.14 },
  utama: { busur: "var(--border)", isi: "var(--primary)", opasitas: 1 },
  sukses: { busur: "var(--sukses-bg)", isi: "var(--sukses)", opasitas: 1 },
} as const;

export function BusurSudut({
  sudut = 92,
  nada = "utama",
  isi = true,
  gambar = false,
  className,
}: {
  sudut?: number;
  nada?: keyof typeof NADA;
  /** Busur terisi dari 0 sampai sudut. */
  isi?: boolean;
  /** Animasi "menggambar" isi busur sekali (layar selesai); statis saat reduced-motion. */
  gambar?: boolean;
  className?: string;
}) {
  const w = NADA[nada];
  const awal = titik(0);
  const akhir = titik(180);
  const ujung = titik(sudut);
  const jarum = titik(sudut, R - 12);
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={cn("overflow-visible", className)} style={{ opacity: w.opasitas }}>
      <path d={`M${awal.x} ${awal.y} A${R} ${R} 0 0 1 ${akhir.x} ${akhir.y}`} fill="none" stroke={w.busur} strokeWidth="7" strokeLinecap="round" />
      {isi && (
        <path
          d={`M${awal.x} ${awal.y} A${R} ${R} 0 0 1 ${ujung.x.toFixed(2)} ${ujung.y.toFixed(2)}`}
          fill="none"
          stroke={w.isi}
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={1}
          className={gambar ? "gp-gambar-garis" : undefined}
        />
      )}
      {[0, 30, 60, 90, 120, 150, 180].map((s) => {
        const a = titik(s, R - 7);
        const b = titik(s, R - 3.5);
        return <line key={s} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={w.isi} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />;
      })}
      <line x1={CX} y1={CY} x2={jarum.x.toFixed(2)} y2={jarum.y.toFixed(2)} stroke={w.isi} strokeWidth="3" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="5" fill="var(--card)" stroke={w.isi} strokeWidth="2.5" />
    </svg>
  );
}
