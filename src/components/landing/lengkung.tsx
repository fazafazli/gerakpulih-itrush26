import { cn } from "@/lib/utils";

/**
 * Batas section berbentuk lengkung (motif busur gerak), pengganti garis potong lurus.
 * Diletakkan di DALAM section berwarna (yang harus `relative`): area di luar lengkung diisi warna
 * section putih di sebelahnya, sehingga tidak ada masalah tumpukan z-index antar-section.
 * Tiga bentuk asimetris + cermin agar tiap batas terasa berbeda.
 */
const BENTUK = [
  { isi: "M0 0H1440V22C1190 60 960 66 720 46S250 6 0 40Z", garis: "M0 54C250 24 520 22 760 54S1200 74 1440 36" },
  { isi: "M0 0H1440V44C1190 12 920 4 660 30S190 64 0 26Z", garis: "M0 40C210 74 420 58 680 42S1160 22 1440 56" },
  { isi: "M0 0H1440V30C1240 32 1090 64 820 58S310 18 0 50Z", garis: "M0 62C290 30 560 70 830 70S1250 44 1440 42" },
] as const;

export function Lengkung({
  posisi,
  varian = 0,
  cermin = false,
  kelasGaris = "stroke-primary/25",
}: {
  posisi: "atas" | "bawah";
  varian?: 0 | 1 | 2;
  cermin?: boolean;
  /** Warna garis aksen; di latar gelap (footer) perlu lebih terang. */
  kelasGaris?: string;
}) {
  const b = BENTUK[varian];
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-0 h-[clamp(1.75rem,4.5vw,4.5rem)] w-full",
        posisi === "atas" ? "top-0" : "bottom-0 rotate-180",
        cermin && "-scale-x-100",
      )}
    >
      <path d={b.isi} className="fill-card" />
      <path d={b.garis} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={1.5} strokeLinecap="round" className={kelasGaris} />
    </svg>
  );
}
