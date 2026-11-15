import { Camera, Repeat } from "lucide-react";
import { GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";
import type { Sisi } from "@/lib/pose/landmarks";
import { namaDenganSisi, petunjukPosisi } from "@/lib/sesi/teks";
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
        <p className="text-[15px] font-semibold text-[#3D4C5C]">
          Gerakan {props.nomor} dari {props.total}
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight">{namaDenganSisi(props.kode, props.sisi)}</h1>
        <p className="mt-1 text-lg text-[#3D4C5C]">{g.instruksi}</p>
      </div>
      <ul className="flex flex-col gap-2 text-lg">
        <li className="flex items-center gap-3 rounded-2xl bg-[#EAF2FB] p-3 font-semibold text-[#0B4A8C]">
          <Camera aria-hidden className="size-6 shrink-0" />
          {petunjukPosisi(props.kode, props.sisi)}
        </li>
        <li className="flex items-center gap-3 rounded-2xl bg-[#F4F7FA] p-3 font-semibold">
          <Repeat aria-hidden className="size-6 shrink-0 text-[#3D4C5C]" />
          {props.repetisi} kali, pelan-pelan
        </li>
      </ul>
      <TombolUtama onClick={props.onMulai}>Mulai gerakan ini</TombolUtama>
      <TombolKedua onClick={props.onLewati}>Lewati gerakan ini</TombolKedua>
    </div>
  );
}
