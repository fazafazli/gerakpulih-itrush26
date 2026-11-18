"use client";

import { Link2, Link2Off, RefreshCw, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";
import { buatLinkBaru, type StatusAksi, type StatusLink, ubahStatusLink } from "@/app/(terapis)/pasien/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HasilLink } from "./hasil-link";

type Props = { pasienId: string; nama: string; aktif: boolean; isDemo: boolean };

export function KelolaLink({ pasienId, nama, aktif, isDemo }: Props) {
  return (
    <section aria-labelledby="judul-link" className="rounded-xl border border-border bg-card p-5">
      <h2 id="judul-link" className="font-heading text-lg font-semibold">
        Link latihan
      </h2>
      <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${aktif ? "text-sukses-teks" : "text-muted-foreground"}`}>
        {aktif ? <Link2 aria-hidden className="size-4" /> : <Link2Off aria-hidden className="size-4" />}
        {aktif ? "Aktif: pasien bisa membuka latihan" : "Nonaktif: pasien tidak bisa membuka latihan"}
      </p>

      {isDemo ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-cyan-lembut px-3 py-2 text-sm text-secondary-foreground">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          Pasien contoh: link dijaga tetap aktif agar semua juri bisa mencoba. Coba fitur ini pada pasien baru.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <DialogStatus pasienId={pasienId} nama={nama} aktif={aktif} />
          <DialogLinkBaru pasienId={pasienId} nama={nama} />
        </div>
      )}
    </section>
  );
}

function DialogStatus({ pasienId, nama, aktif }: Omit<Props, "isDemo">) {
  const [buka, setBuka] = useState(false);
  const [status, aksi, menunggu] = useActionState<StatusAksi, FormData>(async (s, fd) => {
    const hasil = await ubahStatusLink(s, fd);
    if (hasil.status === "ok") setBuka(false);
    return hasil;
  }, { status: "awal" });

  return (
    <>
      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogTrigger render={<Button variant={aktif ? "outline" : "default"} className="h-10 w-full gap-2" />}>
          {aktif ? <Link2Off aria-hidden className="size-4" /> : <Link2 aria-hidden className="size-4" />}
          {aktif ? "Nonaktifkan link" : "Aktifkan kembali"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{aktif ? `Nonaktifkan link ${nama}?` : `Aktifkan kembali link ${nama}?`}</DialogTitle>
            <DialogDescription>
              {aktif
                ? "Pasien tidak bisa membuka latihan di semua perangkat sampai link diaktifkan lagi. Data latihan tetap tersimpan."
                : "Pasien bisa kembali membuka latihan dengan link yang sama."}
            </DialogDescription>
          </DialogHeader>
          {status.status === "galat" && (
            <p role="alert" className="text-sm font-medium text-bahaya">
              {status.pesan}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-10" />}>Batal</DialogClose>
            <form action={aksi}>
              <input type="hidden" name="pasien_id" value={pasienId} />
              <input type="hidden" name="aktif" value={String(!aktif)} />
              <Button type="submit" disabled={menunggu} variant={aktif ? "destructive" : "default"} className="h-10 w-full sm:w-auto">
                {menunggu ? "Menyimpan…" : aktif ? "Ya, nonaktifkan" : "Ya, aktifkan"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {status.status === "ok" && (
        <p role="status" className="text-sm text-muted-foreground">
          {status.pesan}
        </p>
      )}
    </>
  );
}

function DialogLinkBaru({ pasienId, nama }: { pasienId: string; nama: string }) {
  // Kunci baru tiap dialog ditutup → state berisi token dibuang, link tidak bisa ditampilkan ulang.
  const [kunci, setKunci] = useState(0);
  return (
    <Dialog onOpenChange={(buka) => !buka && setKunci((k) => k + 1)}>
      <DialogTrigger render={<Button variant="ghost" className="h-10 w-full gap-2 text-muted-foreground" />}>
        <RefreshCw aria-hidden className="size-4" />
        Buat link baru
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <IsiLinkBaru key={kunci} pasienId={pasienId} nama={nama} />
      </DialogContent>
    </Dialog>
  );
}

function IsiLinkBaru({ pasienId, nama }: { pasienId: string; nama: string }) {
  const [status, aksi, menunggu] = useActionState<StatusLink, FormData>(buatLinkBaru, { status: "awal" });

  if (status.status === "ok") {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Link baru untuk {nama}</DialogTitle>
          <DialogDescription>Link lama sudah tidak berlaku untuk dibuka.</DialogDescription>
        </DialogHeader>
        <HasilLink nama={status.nama} url={status.url} qr={status.qr} />
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Buat link baru untuk {nama}?</DialogTitle>
        <DialogDescription>
          Pakai ini bila link hilang atau terkirim ke orang yang salah. Link lama langsung tidak bisa dibuka lagi. HP yang sudah pernah
          membuka link tetap tersambung; untuk memutus semua perangkat, nonaktifkan link.
        </DialogDescription>
      </DialogHeader>
      {status.status === "galat" && (
        <p role="alert" className="text-sm font-medium text-bahaya">
          {status.pesan}
        </p>
      )}
      <DialogFooter>
        <DialogClose render={<Button variant="outline" className="h-10" />}>Batal</DialogClose>
        <form action={aksi}>
          <input type="hidden" name="pasien_id" value={pasienId} />
          <Button type="submit" disabled={menunggu} className="h-10 w-full sm:w-auto">
            {menunggu ? "Membuat…" : "Buat link baru"}
          </Button>
        </form>
      </DialogFooter>
    </>
  );
}
