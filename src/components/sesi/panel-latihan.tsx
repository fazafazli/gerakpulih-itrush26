import { CircleCheck, Hand, Target, TriangleAlert, UserX } from "lucide-react";
import type { AlasanKompensasi } from "@/lib/pose/compensation";
import { pesanKompensasi } from "@/lib/pose/messages";

export type TampilanLatihan = {
  sudut: number | null;
  jumlah: number;
  capai: number;
  kompensasi: readonly AlasanKompensasi[];
  terlihat: boolean;
  /** Detik tersisa kalibrasi; null bila tidak sedang kalibrasi. */
  kalibrasiDetik: number | null;
};

/** Lapisan di atas video: harus terbaca dari jarak ± 1,5 m. */
export function OverlayLatihan({ t, target, repetisi }: { t: TampilanLatihan; target: number; repetisi: number }) {
  if (!t.terlihat) {
    return (
      <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center text-primary-foreground">
        <UserX aria-hidden className="size-12" />
        <p className="text-[26px] font-extrabold">Kamu tidak terlihat</p>
        <p className="text-lg">Kembali duduk di depan kamera</p>
      </div>
    );
  }
  if (t.kalibrasiDetik != null) {
    return (
      <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 p-6 text-center text-primary-foreground">
        <Hand aria-hidden className="size-12" />
        <p className="text-[26px] font-extrabold">Diam sebentar</p>
        <p className="text-lg">Tangan di posisi istirahat</p>
        <p className="text-6xl font-extrabold tabular-nums">{Math.max(1, t.kalibrasiDetik)}</p>
      </div>
    );
  }
  const persen = t.sudut == null ? 0 : Math.min(100, (t.sudut / target) * 100);
  const capaiSekarang = persen >= 100;
  return (
    <>
      <div className="absolute right-3 top-3 rounded-2xl bg-card/95 px-4 py-2 text-center shadow-sm">
        {/* key berganti tiap repetisi → animasi "pop" diputar ulang (umpan balik visual, selain suara) */}
        <span key={t.jumlah} className="inline-block text-5xl font-extrabold tabular-nums text-foreground animate-gp-pop">
          {t.jumlah}
        </span>
        <span className="text-2xl font-bold text-muted-foreground"> / {repetisi}</span>
      </div>
      <div
        className={`absolute left-3 top-3 flex flex-col items-start gap-1 rounded-2xl px-3 py-2 shadow-sm transition-colors ${
          capaiSekarang ? "bg-sukses-bg/95 ring-2 ring-sukses" : "bg-card/95"
        }`}
      >
        <span className="flex items-center gap-1.5 text-3xl font-extrabold tabular-nums">
          {t.sudut == null ? "–" : `${Math.round(t.sudut)}°`}
          {capaiSekarang && <CircleCheck aria-hidden className="size-7 text-sukses-teks" />}
        </span>
        <span className="h-2 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span className={`block h-full rounded-full ${capaiSekarang ? "bg-sukses" : "bg-teal-segar"}`} style={{ width: `${persen}%` }} />
        </span>
        <span className={`text-base font-bold ${capaiSekarang ? "text-sukses-teks" : "text-muted-foreground"}`}>
          {capaiSekarang ? "Target tercapai!" : `target ${target}°`}
        </span>
      </div>
      {t.kompensasi.length > 0 && (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-peringatan-bg p-3 text-xl font-extrabold text-peringatan-teks shadow"
        >
          <TriangleAlert aria-hidden className="size-7 shrink-0" />
          {pesanKompensasi(t.kompensasi)}
        </p>
      )}
    </>
  );
}

export function PanelLatihan(props: { nomor: number; total: number; nama: string; capai: number; onSelesaiGerakan: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-lg font-semibold text-muted-foreground">
          Gerakan {props.nomor} dari {props.total}
        </p>
        <h1 className="font-heading text-[28px] font-bold leading-tight">{props.nama}</h1>
      </div>
      {/* key berganti tiap target tercapai → cincin hijau berdenyut sekali */}
      <p
        key={props.capai}
        className={`flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-xl font-bold ${
          props.capai > 0 ? "bg-sukses-bg text-sukses-teks animate-gp-capai" : "bg-muted text-muted-foreground"
        }`}
      >
        <Target aria-hidden className="size-6" />
        Target tercapai {props.capai}×
      </p>
      <button
        type="button"
        onClick={props.onSelesaiGerakan}
        className="min-h-12 self-start rounded-xl px-2 text-lg font-semibold text-primary underline underline-offset-4"
      >
        Sudah cukup, lanjut gerakan berikutnya
      </button>
    </div>
  );
}
