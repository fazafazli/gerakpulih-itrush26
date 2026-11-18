"use client";

import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useActionState } from "react";
import { setujui, type StatusSetuju } from "@/app/(pasien)/privasi/actions";
import { TombolUtama } from "@/components/sesi/tombol";

export function FormSetuju({ lanjut }: { lanjut: string }) {
  const [status, aksi, menunggu] = useActionState<StatusSetuju, FormData>(setujui, { pesan: null });
  return (
    <form action={aksi} className="flex flex-col gap-3">
      <input type="hidden" name="lanjut" value={lanjut} />
      {status.pesan && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-bahaya-bg p-4 text-lg font-semibold text-bahaya">
          <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          {status.pesan}
        </p>
      )}
      <TombolUtama type="submit" disabled={menunggu}>
        {menunggu ? (
          <>
            <LoaderCircle aria-hidden className="size-6 animate-spin" /> Menyimpan…
          </>
        ) : (
          "Saya mengerti dan setuju"
        )}
      </TombolUtama>
    </form>
  );
}
