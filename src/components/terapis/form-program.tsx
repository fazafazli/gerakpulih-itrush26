"use client";

import { useActionState, useState } from "react";
import { simpanProgram, type StatusAksi } from "@/app/(terapis)/pasien/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";
import { cn } from "@/lib/utils";

export type BarisProgramForm = { kode: KodeGerakan; aktif: boolean; target_sudut: number; repetisi: number; urutan: number };

const PENJELASAN_SUDUT: Record<KodeGerakan, string> = {
  angkat_samping: "Sudut lengan terhadap badan. 90° = sejajar bahu.",
  angkat_depan: "Sudut lengan terhadap badan. 90° = lurus ke depan.",
  tekuk_siku: "Sudut tekukan siku dari posisi lurus.",
};

function BarisGerakan({ b }: { b: BarisProgramForm }) {
  const [aktif, setAktif] = useState(b.aktif);
  const g = GERAKAN[b.kode];
  return (
    <fieldset className={cn("grid gap-4 border-b border-border px-5 py-5 last:border-b-0 md:grid-cols-[1fr_auto]", !aktif && "bg-muted/60")}>
      <legend className="sr-only">{g.nama}</legend>
      <div className="flex items-start gap-3">
        <Switch
          id={`${b.kode}-aktif`}
          name={`${b.kode}.aktif`}
          checked={aktif}
          onCheckedChange={setAktif}
          className="mt-1"
          aria-describedby={`${b.kode}-ket`}
        />
        <div>
          <Label htmlFor={`${b.kode}-aktif`} className="text-base font-semibold">
            {g.nama}
          </Label>
          <p id={`${b.kode}-ket`} className="mt-0.5 text-sm text-muted-foreground">
            {aktif ? "Aktif di latihan pasien." : "Tidak ditampilkan ke pasien."} Kamera {g.posisiKamera === "depan" ? "dari depan" : "dari samping"}.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 md:w-[22rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${b.kode}-target`} className="text-xs text-muted-foreground">
            Target sudut (°)
          </Label>
          <Input
            id={`${b.kode}-target`}
            name={`${b.kode}.target_sudut`}
            type="number"
            inputMode="numeric"
            min={10}
            max={180}
            step={1}
            required
            defaultValue={b.target_sudut}
            title={PENJELASAN_SUDUT[b.kode]}
            className="h-11 bg-card text-base tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${b.kode}-repetisi`} className="text-xs text-muted-foreground">
            Repetisi
          </Label>
          <Input
            id={`${b.kode}-repetisi`}
            name={`${b.kode}.repetisi`}
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            required
            defaultValue={b.repetisi}
            className="h-11 bg-card text-base tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${b.kode}-urutan`} className="text-xs text-muted-foreground">
            Urutan
          </Label>
          <Input
            id={`${b.kode}-urutan`}
            name={`${b.kode}.urutan`}
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            step={1}
            required
            defaultValue={b.urutan}
            className="h-11 bg-card text-base tabular-nums"
          />
        </div>
      </div>
    </fieldset>
  );
}

export function FormProgram({ pasienId, baris }: { pasienId: string; baris: BarisProgramForm[] }) {
  const [status, aksi, menunggu] = useActionState<StatusAksi, FormData>(simpanProgram, { status: "awal" });
  return (
    <form action={aksi} className="overflow-hidden rounded-xl border border-border bg-card">
      <input type="hidden" name="pasien_id" value={pasienId} />
      {baris.map((b) => (
        <BarisGerakan key={b.kode} b={b} />
      ))}
      <div className="flex flex-col gap-3 border-t border-border bg-mint-pucat px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={cn("text-sm", status.status === "galat" ? "font-medium text-bahaya" : "text-muted-foreground")}>
          {status.status === "awal" ? "Perubahan berlaku pada sesi latihan berikutnya." : status.pesan}
        </p>
        <Button type="submit" disabled={menunggu} className="h-11 px-6 text-base">
          {menunggu ? "Menyimpan…" : "Simpan program"}
        </Button>
      </div>
    </form>
  );
}
