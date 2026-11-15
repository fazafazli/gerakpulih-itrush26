import type { ComponentProps } from "react";
import { OctagonX } from "lucide-react";

/** Tombol layar pasien: tinggi ≥ 56px, huruf ≥ 18px (aturan UI/UX di AGENTS.md). */
const dasar =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-lg font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function TombolUtama({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`${dasar} bg-[#0B5CAD] text-white hover:bg-[#08467F] focus-visible:outline-[#0B5CAD] ${className}`}
      {...props}
    />
  );
}

export function TombolKedua({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`${dasar} border-2 border-[#DDE4EB] bg-white text-[#0F1E2E] hover:bg-[#F4F7FA] focus-visible:outline-[#0B5CAD] ${className}`}
      {...props}
    />
  );
}

/** Tombol keselamatan: selalu terlihat saat latihan dan selalu tercatat sebagai kejadian. */
export function TombolBerhenti(props: Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      className={`${dasar} bg-[#B42318] text-white hover:bg-[#912018] focus-visible:outline-[#B42318]`}
      {...props}
    >
      <OctagonX aria-hidden className="size-6" />
      Berhenti, terasa sakit
    </button>
  );
}
