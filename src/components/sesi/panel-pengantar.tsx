import { Camera, Repeat } from "lucide-react";
import { GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";
import type { Sisi } from "@/lib/pose/landmarks";
import { namaDenganSisi, petunjukPosisi } from "@/lib/sesi/teks";
import { IlustrasiGerakan } from "@/components/ilustrasi/ilustrasi-gerakan";
import { TombolKedua, TombolUtama } from "./tombol";

export function PanelPengantar(props: {
  nomor: number;
  total: number;
  kode: KodeGerakan;
  sisi: Sisi;
  repetisi: number;
  onMulai: () => void;
  onLewati: () => void;
}) {
  const g = GERAKAN[props.kode];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-lg font-semibold text-muted-foreground">
          Gerakan {props.nomor} dari {props.total}
        </p>
        <h1 className="font-heading text-[30px] font-bold leading-tight">{namaDenganSisi(props.kode, props.sisi)}</h1>
        <p className="mt-2 text-xl leading-relaxed text-muted-foreground">{g.instruksi}</p>
      </div>
      {/* Contoh gerakan bergerak pelan; pasien & pendamping melihat apa yang harus dilakukan */}
      <div className="gp-tekstur flex justify-center rounded-2xl border border-border bg-mint-pucat py-3">
        <IlustrasiGerakan kode={props.kode} sisi={props.sisi} className="h-32 w-auto min-[400px]:h-44" />
      </div>
      <ul className="flex flex-col gap-2 text-xl">
        <li className="flex items-center gap-3 rounded-2xl bg-cyan-lembut p-3 font-semibold text-biru">
          <Camera aria-hidden className="size-6 shrink-0" />
          {petunjukPosisi(props.kode, props.sisi)}
        </li>
        <li className="flex items-center gap-3 rounded-2xl bg-muted p-3 font-semibold">
          <Repeat aria-hidden className="size-6 shrink-0 text-muted-foreground" />
          {props.repetisi} kali, pelan-pelan
        </li>
      </ul>
      <TombolUtama onClick={props.onMulai}>Mulai gerakan ini</TombolUtama>
      <TombolKedua onClick={props.onLewati}>Lewati gerakan ini</TombolKedua>
    </div>
  );
}
