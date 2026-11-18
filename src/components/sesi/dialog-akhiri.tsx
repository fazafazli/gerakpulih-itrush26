"use client";

import { DoorOpen } from "lucide-react";
import { useRef } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TombolKedua, TombolUtama } from "./tombol";

/**
 * Konfirmasi "Akhiri latihan". Fokus awal di aksi aman ("Lanjutkan latihan"); Esc = batal.
 * Bila ya, memanggil alur selesai yang sudah ada (hasil sebagian tetap disimpan & dikirim).
 */
export function DialogAkhiri({ buka, onBukaBerubah, onAkhiri }: { buka: boolean; onBukaBerubah: (b: boolean) => void; onAkhiri: () => void }) {
  const lanjutRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open={buka} onOpenChange={onBukaBerubah}>
      <DialogContent showCloseButton={false} initialFocus={lanjutRef} className="gap-5 p-6 sm:max-w-md">
        <DoorOpen aria-hidden className="size-10 text-primary" />
        <DialogTitle className="font-heading text-[26px] leading-tight font-bold">Akhiri latihan sekarang?</DialogTitle>
        <DialogDescription className="text-xl leading-relaxed text-muted-foreground">
          Gerakan yang sudah dilakukan tetap disimpan dan dikirim ke terapis.
        </DialogDescription>
        <div className="flex flex-col gap-3">
          <DialogClose render={<TombolUtama ref={lanjutRef} />}>Lanjutkan latihan</DialogClose>
          <TombolKedua onClick={onAkhiri}>Ya, akhiri latihan</TombolKedua>
        </div>
      </DialogContent>
    </Dialog>
  );
}
