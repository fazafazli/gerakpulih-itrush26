"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Menyalin link tanpa menampilkannya di layar (link memuat token pribadi pasien).
 * Bila clipboard diblokir (sebagian webview), beri arahan menyalin dari menu aplikasi.
 */
export function SalinLink({ url, className }: { url: string; className?: string }) {
  const [status, setStatus] = useState<"awal" | "tersalin" | "gagal">("awal");

  async function salin() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("tersalin");
    } catch {
      setStatus("gagal");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={salin}
        className={cn(
          "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-card px-5 text-lg font-bold text-primary transition-colors hover:bg-mint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        {status === "tersalin" ? <Check aria-hidden className="size-6" /> : <Copy aria-hidden className="size-6" />}
        {status === "tersalin" ? "Link tersalin" : "Salin link"}
      </button>
      <p role="status" className="text-center text-base text-muted-foreground">
        {status === "tersalin" && "Buka Chrome, tekan lama kolom alamat, lalu pilih Tempel."}
        {status === "gagal" && "Tidak bisa menyalin otomatis. Gunakan menu ⋮ lalu pilih “Buka di browser”."}
      </p>
    </div>
  );
}
