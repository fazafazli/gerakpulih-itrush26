"use client";

import { Check, Copy, MessageCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { tautanWhatsApp } from "@/lib/terapis/olah";
import { cn } from "@/lib/utils";

/** Link pasien yang baru dibuat. Token hanya ada di memori halaman ini; setelah ditutup tidak bisa ditampilkan lagi. */
export function HasilLink({ nama, url, qr }: { nama: string; url: string; qr: string }) {
  const [disalin, setDisalin] = useState(false);

  async function salin() {
    try {
      await navigator.clipboard.writeText(url);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2500);
    } catch {
      // Clipboard diblokir (mis. bukan HTTPS): pilih teksnya agar bisa disalin manual.
      document.getElementById("url-pasien")?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-lg bg-peringatan-bg px-3 py-2.5 text-sm text-peringatan-teks">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          <b className="font-semibold">Kirim sekarang.</b> Demi keamanan, link ini hanya ditampilkan sekali. Bila hilang, buat link baru dari
          halaman pasien.
        </span>
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL SVG dari server, tidak perlu optimasi gambar */}
        <img src={qr} alt={`Kode QR link latihan ${nama}`} width={176} height={176} className="size-44 shrink-0 rounded-lg border border-border bg-white p-2" />
        <div className="flex w-full min-w-0 flex-col gap-3">
          <label htmlFor="url-pasien" className="text-sm font-medium">
            Link latihan {nama}
          </label>
          <input
            id="url-pasien"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 w-full min-w-0 rounded-lg border border-input bg-muted px-3 font-mono text-sm"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={salin} variant="outline" className="h-11 gap-2 px-4">
              {disalin ? <Check aria-hidden className="size-4 text-sukses" /> : <Copy aria-hidden className="size-4" />}
              {disalin ? "Tersalin" : "Salin link"}
            </Button>
            <a
              href={tautanWhatsApp(nama, url)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), "h-11 gap-2 px-4")}
            >
              <MessageCircle aria-hidden className="size-4" />
              Kirim lewat WhatsApp
            </a>
          </div>
          <p role="status" className="sr-only">
            {disalin ? "Link tersalin" : ""}
          </p>
          <p className="text-xs text-muted-foreground">Pasien cukup membuka link di Chrome atau memindai QR dengan kamera HP. Tidak perlu membuat akun.</p>
        </div>
      </div>
    </div>
  );
}
