import Link from "next/link";
import { CircleCheck, CloudOff, HeartPulse, LoaderCircle, PartyPopper, Phone, TriangleAlert } from "lucide-react";
import { TombolKedua } from "./tombol";

export type StatusKirim =
  | { status: "mengirim" }
  | { status: "terkirim" }
  | { status: "tertunda"; pesan: string }
  | { status: "ditolak"; pesan: string }
  | { status: "kosong" };

export type BarisHasil = { nama: string; selesai: number; target: number; puncak: number | null };

function StatusPengiriman({ kirim, onKirimUlang }: { kirim: StatusKirim; onKirimUlang: () => void }) {
  switch (kirim.status) {
    case "mengirim":
      return (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#F4F7FA] p-4 text-lg font-semibold">
          <LoaderCircle aria-hidden className="size-6 shrink-0 animate-spin text-[#0B5CAD]" /> Mengirim hasil ke terapis…
        </p>
      );
    case "terkirim":
      return (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#ECFDF3] p-4 text-lg font-semibold text-[#067647]">
          <CircleCheck aria-hidden className="size-6 shrink-0" /> Hasil sudah terkirim ke terapis
        </p>
      );
    case "kosong":
      return (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#F4F7FA] p-4 text-lg font-semibold">
          <TriangleAlert aria-hidden className="size-6 shrink-0 text-[#3D4C5C]" /> Belum ada latihan yang dicatat hari ini.
        </p>
      );
    case "tertunda":
      return (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-[#FEC84B] bg-[#FFFAEB] p-4">
          <p className="flex items-start gap-3 text-lg font-semibold text-[#93370D]">
            <CloudOff aria-hidden className="mt-0.5 size-6 shrink-0" />
            Hasil belum terkirim ({kirim.pesan}). Hasil tersimpan di HP ini dan akan dikirim otomatis saat link dibuka lagi.
          </p>
          <TombolKedua onClick={onKirimUlang}>Coba kirim lagi</TombolKedua>
        </div>
      );
    case "ditolak":
      return (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-[#FEF3F2] p-4 text-lg font-semibold text-[#912018]">
          <TriangleAlert aria-hidden className="mt-0.5 size-6 shrink-0" /> {kirim.pesan}
        </p>
      );
  }
}

export function LayarSelesai(props: {
  nama: string;
  nyeri: boolean;
  hasil: readonly BarisHasil[];
  kirim: StatusKirim;
  onKirimUlang: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {props.nyeri ? (
        <div className="flex flex-col gap-3">
          <HeartPulse aria-hidden className="size-12 text-[#B42318]" />
          <h1 className="text-[28px] font-extrabold leading-tight">Latihan dihentikan</h1>
          <p className="text-lg">Istirahatkan tangan dulu. Catatan rasa sakit ini dikirim ke terapis.</p>
          <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#FECDCA] bg-[#FEF3F2] p-4 text-lg text-[#912018]">
            <p className="font-bold">Segera cari pertolongan bila:</p>
            <ul className="list-disc pl-6">
              <li>Nyeri sangat hebat atau tidak mereda</li>
              <li>Wajah mencong, bicara pelo, atau lengan/tungkai tiba-tiba lemah</li>
            </ul>
            <a
              href="tel:119"
              className="mt-1 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#B42318] px-5 font-bold text-white"
            >
              <Phone aria-hidden className="size-5" /> Telepon 119 (gawat darurat)
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <PartyPopper aria-hidden className="size-12 text-[#0B5CAD]" />
          <h1 className="text-[30px] font-extrabold leading-tight">Hebat, {props.nama}!</h1>
          <p className="text-lg text-[#3D4C5C]">Latihan hari ini selesai.</p>
        </div>
      )}

      {props.hasil.length > 0 && (
        <ul className="flex flex-col divide-y divide-[#E7ECF1] rounded-2xl border border-[#DDE4EB] bg-white">
          {props.hasil.map((h) => (
            <li key={h.nama} className="flex items-center justify-between gap-3 p-4">
              <span>
                <span className="block text-lg font-bold">{h.nama}</span>
                <span className="text-[15px] text-[#3D4C5C]">{h.puncak == null ? "Belum ada gerakan" : `Tertinggi ${Math.round(h.puncak)}°`}</span>
              </span>
              <span className="text-2xl font-extrabold tabular-nums">
                {h.selesai}/{h.target}
              </span>
            </li>
          ))}
        </ul>
      )}

      <StatusPengiriman kirim={props.kirim} onKirimUlang={props.onKirimUlang} />

      <Link
        href="/beranda"
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#0B5CAD] px-5 text-lg font-bold text-white hover:bg-[#08467F]"
      >
        Selesai
      </Link>
    </div>
  );
}
