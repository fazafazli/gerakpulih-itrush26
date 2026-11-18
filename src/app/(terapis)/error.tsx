"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Galat tak terduga di halaman terapis: pesan ramah tanpa detail teknis. */
export default function GalatTerapis({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5">
      <h1 className="font-heading text-2xl font-bold">Data belum bisa dimuat</h1>
      <p className="text-muted-foreground">Periksa koneksi internet lalu coba lagi. Data pasien Anda tetap aman.</p>
      <Button onClick={reset} className="h-11 w-fit gap-2 px-5">
        <RefreshCw aria-hidden className="size-4" /> Coba lagi
      </Button>
    </main>
  );
}
