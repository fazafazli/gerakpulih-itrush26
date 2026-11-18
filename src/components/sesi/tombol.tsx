import type { ComponentProps } from "react";
import { OctagonX } from "lucide-react";

/** Tombol layar pasien: tinggi 64px, huruf 20px (patokan docs/DESAIN.md bagian 6). */
const dasar =
  "inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-xl px-5 text-xl font-bold transition-[background-color,transform] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function TombolUtama({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`${dasar} bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}

export function TombolKedua({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`${dasar} border-2 border-border bg-card text-foreground hover:bg-mint-pucat focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}

/** Tombol keselamatan: selalu terlihat saat latihan dan selalu tercatat sebagai kejadian. */
export function TombolBerhenti(props: Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      className={`${dasar} bg-bahaya text-primary-foreground hover:bg-bahaya/90 focus-visible:outline-bahaya`}
      {...props}
    >
      <OctagonX aria-hidden className="size-6" />
      Berhenti, terasa sakit
    </button>
  );
}
