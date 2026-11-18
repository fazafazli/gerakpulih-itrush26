import type { CSSProperties } from "react";
import type { KodeGerakan } from "@/lib/pose/exercises";
import type { Sisi } from "@/lib/pose/landmarks";
import { namaDenganSisi } from "@/lib/sesi/teks";
import { cn } from "@/lib/utils";

/**
 * Contoh gerakan: figur garis netral yang duduk. Lengan bergerak pelan dari posisi istirahat ke pose target
 * lalu kembali (kelas .gp-gerak di globals.css). Transform dasar = pose target, jadi saat reduced-motion
 * (animasi mati) figur diam di pose target.
 *
 * Tampak depan untuk angkat_samping & tekuk_siku, tampak samping untuk angkat_depan (sesuai posisi kamera).
 * Lengan yang dilatih digambar di sisi layar yang sama dengan video cermin pasien.
 */
const WARNA = { tubuh: "var(--muted-foreground)", lengan: "var(--primary)", sendi: "var(--card)", kursi: "var(--border)" } as const;

type Putar = CSSProperties & { "--istirahat": string };
const sendi = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="3.6" fill={WARNA.sendi} stroke={WARNA.lengan} strokeWidth="2.4" />;

function TampakDepan({ kode }: { kode: "angkat_samping" | "tekuk_siku" }) {
  return (
    <>
      {/* kursi */}
      <path d="M38 100h44M42 100v30M78 100v30" stroke={WARNA.kursi} strokeWidth="4" strokeLinecap="round" />
      {/* tubuh */}
      <circle cx="60" cy="26" r="11" fill={WARNA.tubuh} opacity="0.5" />
      <path d="M45 44h30l-4 54H49z" fill={WARNA.tubuh} opacity="0.35" />
      <path d="M52 98v30M68 98v30" stroke={WARNA.tubuh} strokeWidth="6" strokeLinecap="round" opacity="0.4" />
      {/* lengan yang tidak dilatih: istirahat */}
      <path d="M45 47 40 90" stroke={WARNA.tubuh} strokeWidth="6" strokeLinecap="round" opacity="0.45" />

      {kode === "angkat_samping" ? (
        // Pose target: lengan lurus ke samping (90°). Istirahat: tergantung di sisi badan.
        <g className="gp-gerak" style={{ transformOrigin: "75px 47px", "--istirahat": "80deg" } as Putar}>
          <path d="M75 47h40" stroke={WARNA.lengan} strokeWidth="6" strokeLinecap="round" />
          {sendi(115, 47)}
        </g>
      ) : (
        <>
          {/* lengan atas diam di sisi badan; lengan bawah menekuk di siku */}
          <path d="M75 47 79 74" stroke={WARNA.lengan} strokeWidth="6" strokeLinecap="round" />
          <g className="gp-gerak" style={{ transformOrigin: "79px 74px", "--istirahat": "-165deg" } as Putar}>
            <path d="M79 74 84 52" stroke={WARNA.lengan} strokeWidth="6" strokeLinecap="round" />
            {sendi(84, 52)}
          </g>
          {sendi(79, 74)}
        </>
      )}
      {sendi(75, 47)}
    </>
  );
}

function TampakSamping() {
  return (
    <>
      <path d="M40 100h36M44 100v30M72 100v30" stroke={WARNA.kursi} strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="26" r="11" fill={WARNA.tubuh} opacity="0.5" />
      <path d="M50 44h16l-2 54H52z" fill={WARNA.tubuh} opacity="0.35" />
      <path d="M58 98h22v30" fill="none" stroke={WARNA.tubuh} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {/* Pose target: lengan lurus ke depan (90°). Istirahat: tergantung ke bawah. */}
      <g className="gp-gerak" style={{ transformOrigin: "60px 48px", "--istirahat": "82deg" } as Putar}>
        <path d="M60 48h40" stroke={WARNA.lengan} strokeWidth="6" strokeLinecap="round" />
        {sendi(100, 48)}
      </g>
      {sendi(60, 48)}
    </>
  );
}

export function IlustrasiGerakan({
  kode,
  sisi = "kanan",
  animasi = true,
  className,
}: {
  kode: KodeGerakan;
  sisi?: Sisi;
  animasi?: boolean;
  className?: string;
}) {
  // Gambar dasar: lengan dilatih di kanan layar (kanan pasien pada video cermin). Sisi kiri → dicerminkan.
  const cermin = sisi === "kiri";
  return (
    <svg
      viewBox="0 0 120 140"
      role="img"
      aria-label={`Contoh gerakan: ${namaDenganSisi(kode, sisi).toLowerCase()}`}
      className={cn(animasi ? "gp-gerak-aktif" : "gp-gerak-diam", cermin && "-scale-x-100", className)}
    >
      {kode === "angkat_depan" ? <TampakSamping /> : <TampakDepan kode={kode} />}
    </svg>
  );
}
