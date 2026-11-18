import { ArrowRight, Compass, Globe, MessageCircleWarning } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { SalinLink } from "@/components/pasien/salin-link";
import { Logo } from "@/components/terapis/kepala-terapis";
import { deteksiPeramban, langkahBukaBrowser, namaBrowserDisarankan, tautanIntentChrome } from "@/lib/pasien/peramban";
import { POLA_TOKEN } from "@/lib/pasien/token";
import { pilihOrigin } from "@/lib/situs";
import { tautanPasien } from "@/lib/terapis/olah";

// URL memuat token: jangan kirim Referer (lihat juga headers di next.config.ts) dan jangan diindeks.
export const metadata: Metadata = {
  title: "Buka di browser · GerakPulih",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function HalamanBukaBrowser({ params }: { params: Promise<{ kode: string }> }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
        <Logo /> GerakPulih
      </div>
      <Suspense fallback={<p className="text-lg text-muted-foreground">Menyiapkan petunjuk…</p>}>
        <IsiBukaBrowser params={params} />
      </Suspense>
    </main>
  );
}

async function IsiBukaBrowser({ params }: { params: Promise<{ kode: string }> }) {
  const [{ kode }, h] = await Promise.all([params, headers()]);
  const info = deteksiPeramban(h.get("user-agent"));
  const browser = namaBrowserDisarankan(info.os);
  // Token tidak ditampilkan sebagai teks; hanya dipakai untuk tombol salin & intent.
  const url = POLA_TOKEN.test(kode)
    ? tautanPasien(pilihOrigin({ appUrl: process.env.APP_URL, host: h.get("x-forwarded-host") ?? h.get("host"), proto: h.get("x-forwarded-proto") }), kode)
    : null;
  const IkonBrowser = browser === "Chrome" ? Globe : Compass;

  return (
    <>
      <div className="flex flex-col gap-3">
        <MessageCircleWarning aria-hidden className="size-12 text-peringatan" />
        <h1 className="font-heading text-[30px] leading-tight font-bold">Buka di {browser}</h1>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Link ini terbuka di dalam {info.aplikasi ?? "aplikasi chat"}. Di sini kamera sering tidak bisa dipakai.
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {langkahBukaBrowser(info).map((langkah, i) => (
          <li key={langkah} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 text-lg">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint font-bold text-primary">{i + 1}</span>
            <span className="pt-1">{langkah}</span>
          </li>
        ))}
      </ol>

      {url && (
        <div className="flex flex-col gap-3">
          {info.os === "android" && (
            <a
              href={tautanIntentChrome(url)}
              className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 text-xl font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <IkonBrowser aria-hidden className="size-6" /> Buka di Chrome
            </a>
          )}
          <SalinLink url={url} />
        </div>
      )}

      <Link href="/beranda" className="inline-flex min-h-12 items-center justify-center gap-2 text-lg font-semibold text-muted-foreground underline underline-offset-4">
        Lanjut di sini saja <ArrowRight aria-hidden className="size-5" />
      </Link>
    </>
  );
}
