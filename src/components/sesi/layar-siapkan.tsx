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
        <h1 className="text-[28px] font-extrabold leading-tight">Siapkan tempat latihan</h1>
        <p className="mt-1 text-lg text-[#3D4C5C]">Cukup 4 hal. Panduan ini juga dibacakan.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {PANDUAN_SIAPKAN.map((teks, i) => {
          const Ikon = IKON[i];
          return (
            <li key={teks} className="flex items-center gap-4 rounded-2xl border border-[#DDE4EB] bg-white p-4 text-lg font-semibold">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FB] text-[#0B5CAD]">
                <Ikon aria-hidden className="size-6" />
              </span>
              {teks}
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-2 text-[15px] text-[#3D4C5C]">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-[#067647]" />
        Video hanya diproses di HP ini. Tidak direkam dan tidak dikirim ke mana pun.
      </p>

      {props.pesanGalat && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-4 text-lg text-[#912018]">
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
