"use client";

import { CircleAlert, FileText, History, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RingkasanSchema, type Ringkasan } from "@/lib/ai/schema";
import { labelTanggal } from "@/lib/terapis/olah";

type Isi = {
  isi: Ringkasan;
  sumber: "ai" | "template";
  dibuat: string;
  /** Periode tersimpan ("YYYY-MM-DD"); hasil baru dari API selalu 14 hari terakhir. */
  periode?: { mulai: string; selesai: string };
};

const PESAN_USANG = {
  nyeri: "Ada laporan nyeri baru sejak ringkasan ini dibuat. Tekan Perbarui.",
  sesi: "Ada sesi latihan baru sejak ringkasan ini dibuat. Tekan Perbarui.",
} as const;

const TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

async function mintaRingkasan(pasienId: string): Promise<Isi> {
  const res = await fetch("/api/ringkasan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pasienId }),
  });
  const json: unknown = await res.json().catch(() => null);
  const data = (json ?? {}) as { isi?: unknown; sumber?: unknown; dibuat?: unknown; error?: unknown };
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Ringkasan belum bisa dibuat.");
  const isi = RingkasanSchema.safeParse(data.isi);
  if (!isi.success) throw new Error("Ringkasan belum bisa dibuat.");
  return {
    isi: isi.data,
    sumber: data.sumber === "ai" ? "ai" : "template",
    dibuat: typeof data.dibuat === "string" ? data.dibuat : new Date().toISOString(),
  };
}

/** Ringkasan AI untuk terapis: selalu berlabel sumber & "bukan diagnosis". */
export function KartuRingkasan({
  pasienId,
  awal,
  usang,
}: {
  pasienId: string;
  awal: Isi | null;
  /** Alasan ringkasan awal tertinggal data terbaru (dihitung server). */
  usang: keyof typeof PESAN_USANG | null;
}) {
  const [ringkasan, setRingkasan] = useState<Isi | null>(awal);
  const [diperbarui, setDiperbarui] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function buat() {
    setMemuat(true);
    setGalat(null);
    try {
      setRingkasan(await mintaRingkasan(pasienId));
      setDiperbarui(true);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Ringkasan belum bisa dibuat.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <section aria-labelledby="judul-ringkasan" className="rounded-xl border border-primary/15 bg-mint p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="judul-ringkasan" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Sparkles aria-hidden className="size-4 text-primary" />
            Ringkasan latihan
          </h2>
          {ringkasan && (
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {ringkasan.sumber === "ai" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Sparkles aria-hidden className="size-3" /> Dibuat AI · perlu ditinjau
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-secondary-foreground">
                  <FileText aria-hidden className="size-3" /> Template otomatis
                </span>
              )}
              <span>
                {ringkasan.periode
                  ? `Periode ${labelTanggal(ringkasan.periode.mulai)} – ${labelTanggal(ringkasan.periode.selesai)}`
                  : "14 hari terakhir"}
                {" · dibuat "}
                {TANGGAL.format(new Date(ringkasan.dibuat))}
              </span>
            </p>
          )}
        </div>
        <Button onClick={buat} disabled={memuat} variant="outline" className="h-10 shrink-0 gap-2 bg-card px-3">
          <RefreshCw aria-hidden className={memuat ? "size-4 animate-spin" : "size-4"} />
          {ringkasan ? "Perbarui" : "Buat"}
        </Button>
      </div>

      {usang && !diperbarui && !memuat && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-sm text-secondary-foreground ring-1 ring-primary/20">
          <History aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          {PESAN_USANG[usang]}
        </p>
      )}

      <div aria-live="polite" aria-busy={memuat} className="mt-4">
        {memuat ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full bg-card" />
            <Skeleton className="h-4 w-11/12 bg-card" />
            <Skeleton className="h-4 w-3/4 bg-card" />
          </div>
        ) : ringkasan ? (
          <>
            {ringkasan.isi.perlu_perhatian && (
              <p className="mb-3 flex items-start gap-2 rounded-lg bg-peringatan-bg px-3 py-2 text-sm text-peringatan-teks">
                <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  <b className="font-semibold">Layak ditinjau</b>
                  {ringkasan.isi.alasan_perhatian && `: ${ringkasan.isi.alasan_perhatian}`}
                </span>
              </p>
            )}
            <ul className="flex flex-col gap-2.5 text-sm leading-relaxed">
              {ringkasan.isi.poin.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada ringkasan. Tekan &ldquo;Buat&rdquo; untuk merangkum latihan 14 hari terakhir.</p>
        )}
        {galat && (
          <p role="alert" className="mt-3 text-sm font-medium text-bahaya">
            {galat}
          </p>
        )}
      </div>

      <p className="mt-4 border-t border-primary/15 pt-3 text-xs leading-relaxed text-muted-foreground">
        Alat bantu dokumentasi untuk terapis, <b className="font-semibold">bukan diagnosis</b>. Hanya angka latihan tanpa nama atau identitas
        yang dikirim ke AI. Bila AI tidak tersedia, dipakai template dari aturan tetap.
      </p>
    </section>
  );
}
