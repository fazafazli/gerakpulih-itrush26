"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useActionState } from "react";
import { type StatusAksi, tandaiDitindaklanjuti } from "@/app/(terapis)/pasien/actions";
import { Button } from "@/components/ui/button";
import { GERAKAN, isKodeGerakan } from "@/lib/pose/exercises";
import type { KejadianNyeri } from "@/lib/terapis/data";

const WAKTU = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function ItemNyeri({ k }: { k: KejadianNyeri }) {
  const [status, aksi, menunggu] = useActionState<StatusAksi, FormData>(tandaiDitindaklanjuti, { status: "awal" });
  const gerakan = k.kode_gerakan && isKodeGerakan(k.kode_gerakan) ? GERAKAN[k.kode_gerakan].nama : "Gerakan tidak diketahui";

  return (
    <li className={`flex flex-col gap-3 border-l-4 px-4 py-3.5 sm:flex-row sm:items-center ${k.ditindaklanjuti ? "border-border" : "border-bahaya bg-bahaya-bg/50"}`}>
      <div className="flex flex-1 items-start gap-3">
        {k.ditindaklanjuti ? (
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-sukses" />
        ) : (
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-bahaya" />
        )}
        <div className="text-sm">
          <p className="font-semibold">{gerakan}</p>
          <p className="text-muted-foreground">
            {WAKTU.format(new Date(k.terjadi_pada))}
            {k.repetisi_ke != null && ` · repetisi ke-${k.repetisi_ke}`}
            {k.sudut != null && ` · ${Math.round(Number(k.sudut))}°`}
          </p>
          <p className={k.ditindaklanjuti ? "text-sukses-teks" : "font-medium text-bahaya"}>
            {k.ditindaklanjuti
              ? `Sudah ditindaklanjuti${k.ditindaklanjuti_pada ? ` · ${WAKTU.format(new Date(k.ditindaklanjuti_pada))}` : ""}`
              : "Belum ditindaklanjuti"}
          </p>
          {status.status === "galat" && (
            <p role="alert" className="mt-1 font-medium text-bahaya">
              {status.pesan}
            </p>
          )}
        </div>
      </div>
      {!k.ditindaklanjuti && (
        <form action={aksi}>
          <input type="hidden" name="kejadian_id" value={k.id} />
          <Button type="submit" variant="outline" disabled={menunggu} className="h-10 w-full bg-card px-3 sm:w-auto">
            {menunggu ? "Menyimpan…" : "Tandai sudah ditindaklanjuti"}
          </Button>
        </form>
      )}
    </li>
  );
}

export function DaftarNyeri({ kejadian }: { kejadian: KejadianNyeri[] }) {
  if (!kejadian.length) {
    return (
      <p className="flex items-center gap-2 px-5 py-5 text-sm text-muted-foreground">
        <CircleCheck aria-hidden className="size-4 text-sukses" /> Tidak ada laporan nyeri.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {kejadian.map((k) => (
        <ItemNyeri key={k.id} k={k} />
      ))}
    </ul>
  );
}
