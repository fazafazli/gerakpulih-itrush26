import Link from "next/link";
import { CircleCheck, CloudOff, HeartPulse, LoaderCircle, PartyPopper, Phone, TriangleAlert } from "lucide-react";
import { PenandaLangkah } from "./langkah";
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
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-lg font-semibold">
          <LoaderCircle aria-hidden className="size-6 shrink-0 animate-spin text-primary" /> Mengirim hasil ke terapis…
        </p>
      );
    case "terkirim":
      return (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-sukses-bg p-4 text-lg font-semibold text-sukses-teks">
          <CircleCheck aria-hidden className="size-6 shrink-0" /> Hasil sudah terkirim ke terapis
        </p>
      );
    case "kosong":
      return (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-lg font-semibold">
          <TriangleAlert aria-hidden className="size-6 shrink-0 text-muted-foreground" /> Belum ada latihan yang dicatat hari ini.
        </p>
      );
    case "tertunda":
      return (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-peringatan/50 bg-peringatan-bg p-4">
          <p className="flex items-start gap-3 text-lg font-semibold text-peringatan-teks">
            <CloudOff aria-hidden className="mt-0.5 size-6 shrink-0" />
            Hasil belum terkirim ({kirim.pesan}). Hasil tersimpan di HP ini dan akan dikirim otomatis saat link dibuka lagi.
          </p>
          <TombolKedua onClick={onKirimUlang}>Coba kirim lagi</TombolKedua>
        </div>
      );
    case "ditolak":
      return (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-bahaya-bg p-4 text-lg font-semibold text-bahaya">
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
      <PenandaLangkah aktif={3} />
      {props.nyeri ? (
        <div className="flex flex-col gap-3">
          <HeartPulse aria-hidden className="size-12 text-bahaya" />
          <h1 className="font-heading text-[30px] font-bold leading-tight">Latihan dihentikan</h1>
          <p className="text-lg">Istirahatkan tangan dulu. Catatan rasa sakit ini dikirim ke terapis.</p>
          <div className="flex flex-col gap-2 rounded-2xl border-2 border-bahaya/30 bg-bahaya-bg p-4 text-lg text-bahaya">
            <p className="font-bold">Segera cari pertolongan bila:</p>
            <ul className="list-disc pl-6">
              <li>Nyeri sangat hebat atau tidak mereda</li>
              <li>Wajah mencong, bicara pelo, atau lengan/tungkai tiba-tiba lemah</li>
            </ul>
            <a
              href="tel:119"
              className="mt-1 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-bahaya px-5 font-bold text-primary-foreground"
            >
              <Phone aria-hidden className="size-5" /> Telepon 119 (gawat darurat)
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <PartyPopper aria-hidden className="size-12 text-primary animate-gp-pop" />
          <h1 className="font-heading text-[32px] font-bold leading-tight">Hebat, {props.nama}!</h1>
          <p className="text-xl text-muted-foreground">Latihan hari ini selesai.</p>
        </div>
      )}

      {props.hasil.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {props.hasil.map((h) => (
            <li key={h.nama} className="flex items-center justify-between gap-3 p-4">
              <span>
                <span className="block text-lg font-bold">{h.nama}</span>
                <span className="text-lg text-muted-foreground">{h.puncak == null ? "Belum ada gerakan" : `Tertinggi ${Math.round(h.puncak)}°`}</span>
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
        className="inline-flex min-h-16 w-full items-center justify-center rounded-xl bg-primary px-5 text-xl font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Selesai
      </Link>
    </div>
  );
}
