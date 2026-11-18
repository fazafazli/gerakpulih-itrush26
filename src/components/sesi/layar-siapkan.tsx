import { Armchair, Lightbulb, LoaderCircle, ShieldCheck, Smartphone, TriangleAlert, Users, Volume2 } from "lucide-react";
import { PANDUAN_SIAPKAN } from "@/lib/sesi/teks";
import { PenandaLangkah } from "./langkah";
import { TombolKedua, TombolUtama } from "./tombol";

const IKON = [Smartphone, Armchair, Lightbulb, Users] as const;

export function LayarSiapkan(props: {
  meminta: boolean;
  pesanGalat: string | null;
  onSiap: () => void;
  onPutarUlang: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <PenandaLangkah aktif={0} />
      <div>
        <h1 className="font-heading text-[30px] font-bold leading-tight">Siapkan tempat latihan</h1>
        <p className="mt-1 text-xl text-muted-foreground">Cukup 4 hal. Panduan ini juga dibacakan.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {PANDUAN_SIAPKAN.map((teks, i) => {
          const Ikon = IKON[i];
          return (
            <li key={teks} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-xl font-semibold leading-snug">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-primary">
                <Ikon aria-hidden className="size-6" />
              </span>
              {teks}
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-2 text-lg text-muted-foreground">
        <ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-sukses-teks" />
        Video hanya diproses di HP ini. Tidak direkam dan tidak dikirim ke mana pun.
      </p>

      {props.pesanGalat && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-bahaya/30 bg-bahaya-bg p-4 text-lg text-bahaya">
          <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          {props.pesanGalat}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <TombolUtama onClick={props.onSiap} disabled={props.meminta}>
          {props.meminta ? (
            <>
              <LoaderCircle aria-hidden className="size-5 animate-spin" /> Menyalakan kamera…
            </>
          ) : props.pesanGalat ? (
            "Coba lagi"
          ) : (
            "Sudah siap"
          )}
        </TombolUtama>
        <TombolKedua onClick={props.onPutarUlang}>
          <Volume2 aria-hidden className="size-5" /> Putar ulang panduan
        </TombolKedua>
      </div>
    </div>
  );
}
