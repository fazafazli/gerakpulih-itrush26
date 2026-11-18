"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { KodeGerakan } from "@/lib/pose/exercises";
import { labelTanggal, ringkasSeri, type TitikProgres } from "@/lib/terapis/olah";
import { cn } from "@/lib/utils";

export type SeriGerakan = { kode: KodeGerakan; nama: string; titik: TitikProgres[] };

const konfigurasi = {
  puncak: { label: "Puncak sudut", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-4)" },
} satisfies ChartConfig;

type DotProps = { cx?: number; cy?: number; index?: number; payload?: { nyeri: boolean } };

/** Titik sesi; sesi yang dihentikan karena nyeri ditandai merah & lebih besar. */
function Titik({ cx, cy, index, payload }: DotProps) {
  if (cx == null || cy == null) return <g key={index} />;
  return payload?.nyeri ? (
    <circle key={index} cx={cx} cy={cy} r={6} fill="var(--bahaya)" stroke="var(--card)" strokeWidth={2} />
  ) : (
    <circle key={index} cx={cx} cy={cy} r={3.5} fill="var(--card)" stroke="var(--chart-1)" strokeWidth={2} />
  );
}

export function GrafikProgres({ seri }: { seri: SeriGerakan[] }) {
  const [pilih, setPilih] = useState(seri[0]?.kode);
  const aktif = seri.find((s) => s.kode === pilih) ?? seri[0];

  if (!aktif) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Grafik muncul setelah pasien menyelesaikan sesi pertama.</p>;
  }

  const r = ringkasSeri(aktif.titik);
  const data = aktif.titik.map((t, i) => ({ ...t, urut: i, label: labelTanggal(t.tanggal) }));
  const deskripsi =
    `${aktif.nama}: ${r.jumlahSesi} sesi, puncak ${r.awal ?? "-"}° menjadi ${r.akhir ?? "-"}°, ` +
    `target ${r.target ?? "-"}° tercapai pada ${r.sesiCapaiTarget} sesi.`;

  return (
    <div className="flex flex-col gap-4">
      {seri.length > 1 && (
        <div role="group" aria-label="Pilih gerakan" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {seri.map((s) => (
            <button
              key={s.kode}
              type="button"
              aria-pressed={s.kode === aktif.kode}
              onClick={() => setPilih(s.kode)}
              className={cn(
                "min-h-10 flex-1 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                s.kode === aktif.kode ? "bg-card text-foreground shadow-xs" : "hover:text-foreground",
              )}
            >
              {s.nama}
            </button>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-3 gap-4">
        <div>
          <dt className="text-xs text-muted-foreground">Puncak terakhir</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">{r.akhir != null ? `${Math.round(r.akhir)}°` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Perubahan</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">
            {r.awal != null && r.akhir != null ? `${r.akhir - r.awal >= 0 ? "+" : "−"}${Math.abs(Math.round(r.akhir - r.awal))}°` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Capai target</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">
            {r.sesiCapaiTarget}
            <span className="text-base font-medium text-muted-foreground">/{r.jumlahSesi} sesi</span>
          </dd>
        </div>
      </dl>

      <figure>
        <ChartContainer config={konfigurasi} className="aspect-auto h-64 w-full" role="img" aria-label={deskripsi}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="urut" tickFormatter={(i: number) => data[i]?.label ?? ""} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis domain={[0, 180]} ticks={[0, 45, 90, 135, 180]} tickFormatter={(v: number) => `${v}°`} tickLine={false} axisLine={false} width={44} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, p) => {
                    const t = p?.[0]?.payload as (typeof data)[number] | undefined;
                    return t ? `${t.label}${t.nyeri ? " · dihentikan karena nyeri" : ""}` : "";
                  }}
                  formatter={(v, nama) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">{konfigurasi[nama as keyof typeof konfigurasi]?.label ?? nama}</span>
                      <b className="tabular-nums">{v}°</b>
                    </span>
                  )}
                />
              }
            />
            <Line dataKey="target" type="stepAfter" stroke="var(--color-target)" strokeWidth={2} strokeDasharray="6 5" dot={false} activeDot={false} isAnimationActive={false} />
            <Line dataKey="puncak" type="monotone" stroke="var(--color-puncak)" strokeWidth={2.5} dot={Titik} connectNulls />
          </LineChart>
        </ChartContainer>
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 bg-chart-1" /> Puncak sudut per sesi
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-0 w-4 border-t-2 border-dashed border-chart-4" /> Target dari terapis
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-bahaya" /> Sesi dihentikan karena nyeri
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
