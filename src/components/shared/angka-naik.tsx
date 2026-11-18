import type { CSSProperties } from "react";

/**
 * Angka yang berhitung naik sekali (CSS @property, lihat .gp-hitung di globals.css).
 * Pembaca layar membaca teks sr-only; tampilan visual aria-hidden. Tanpa dukungan @property → angka akhir langsung.
 */
export function AngkaNaik({ nilai, akhiran = "", className }: { nilai: number; akhiran?: string; className?: string }) {
  const bulat = Math.round(nilai);
  return (
    <span className={className}>
      <span className="sr-only">
        {bulat}
        {akhiran}
      </span>
      <span aria-hidden className="gp-hitung tabular-nums" data-akhiran={akhiran} style={{ "--gp-n": bulat } as CSSProperties} />
    </span>
  );
}
