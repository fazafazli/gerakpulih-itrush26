import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/terapis/kepala-terapis";

export const metadata: Metadata = { title: "Link tidak berlaku · GerakPulih" };

export default function AksesTidakValid() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
        <Logo /> GerakPulih
      </div>
      <div className="flex flex-col gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-peringatan-bg text-peringatan-teks">
          <LinkIcon aria-hidden className="size-7" />
        </span>
        <h1 className="font-heading text-[30px] leading-tight font-bold">Link latihan tidak berlaku</h1>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Link mungkin salah ketik, sudah diganti, atau sudah tidak aktif. Minta link baru kepada fisioterapis Anda, lalu buka lewat Chrome.
        </p>
      </div>
      <p className="border-t border-border pt-5 text-lg text-muted-foreground">
        Anda fisioterapis?{" "}
        <Link href="/masuk" className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">
          Masuk di sini
        </Link>
      </p>
    </main>
  );
}
