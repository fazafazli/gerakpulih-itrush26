import { Hand, Target, TriangleAlert, UserX } from "lucide-react";
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
      <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center text-white">
        <UserX aria-hidden className="size-12" />
        <p className="text-[26px] font-extrabold">Kamu tidak terlihat</p>
        <p className="text-lg">Kembali duduk di depan kamera</p>
      </div>
    );
  }
  if (t.kalibrasiDetik != null) {
    return (
      <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 p-6 text-center text-white">
        <Hand aria-hidden className="size-12" />
        <p className="text-[26px] font-extrabold">Diam sebentar</p>
        <p className="text-lg">Tangan di posisi istirahat</p>
        <p className="text-6xl font-extrabold tabular-nums">{Math.max(1, t.kalibrasiDetik)}</p>
      </div>
    );
  }
  const persen = t.sudut == null ? 0 : Math.min(100, (t.sudut / target) * 100);
  return (
    <>
      <div className="absolute right-3 top-3 rounded-2xl bg-white/95 px-4 py-2 text-center shadow-sm">
        <span className="text-5xl font-extrabold tabular-nums text-[#0F1E2E]">{t.jumlah}</span>
        <span className="text-2xl font-bold text-[#3D4C5C]"> / {repetisi}</span>
      </div>
      <div className="absolute left-3 top-3 flex flex-col items-start gap-1 rounded-2xl bg-white/95 px-3 py-2 shadow-sm">
        <span className="text-3xl font-extrabold tabular-nums">{t.sudut == null ? "–" : `${Math.round(t.sudut)}°`}</span>
        <span className="h-2 w-24 overflow-hidden rounded-full bg-[#E7ECF1]" aria-hidden>
          <span className={`block h-full rounded-full ${persen >= 100 ? "bg-[#067647]" : "bg-[#0B5CAD]"}`} style={{ width: `${persen}%` }} />
        </span>
        <span className="text-sm font-semibold text-[#3D4C5C]">target {target}°</span>
      </div>
      {t.kompensasi.length > 0 && (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-[#FFFAEB] p-3 text-xl font-extrabold text-[#93370D] shadow"
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
        <p className="text-[15px] font-semibold text-[#3D4C5C]">
          Gerakan {props.nomor} dari {props.total}
        </p>
        <h1 className="text-[24px] font-extrabold leading-tight">{props.nama}</h1>
      </div>
      <p className={`flex items-center gap-2 text-lg font-semibold ${props.capai > 0 ? "text-[#067647]" : "text-[#3D4C5C]"}`}>
        <Target aria-hidden className="size-5" />
        Target tercapai {props.capai}×
      </p>
      <button
        type="button"
        onClick={props.onSelesaiGerakan}
        className="min-h-12 self-start rounded-xl px-2 text-[17px] font-semibold text-[#0B5CAD] underline underline-offset-4"
      >
        Sudah cukup, lanjut gerakan berikutnya
      </button>
    </div>
  );
}
