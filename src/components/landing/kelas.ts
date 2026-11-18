/** Satu set kelas tombol/tautan landing: hover, focus-visible, dan active yang konsisten. */
const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

export const kelasCtaUtama = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold whitespace-nowrap text-primary-foreground shadow-sm transition-[background-color,transform] hover:bg-primary/90 active:translate-y-px ${fokus}`;

export const kelasCtaKedua = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-card px-6 text-base font-semibold whitespace-nowrap text-primary transition-[background-color,transform] hover:bg-mint active:translate-y-px ${fokus}`;

export const kelasTautan = `inline-flex min-h-11 items-center rounded-md text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline ${fokus}`;
