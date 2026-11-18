import "server-only";

/**
 * Catat galat database di log server (Vercel) agar bisa dilacak, sementara pengguna hanya melihat pesan ramah.
 * Sengaja hanya kode & pesan Postgres: tanpa `details`/`hint` (bisa memuat nilai baris), data pasien, atau token.
 */
export function catatGalat(konteks: string, galat: { code?: string; message?: string } | null | undefined): void {
  if (!galat) return;
  console.error(`[terapis] ${konteks}: ${galat.code ?? "-"} ${galat.message ?? ""}`.trim());
}
