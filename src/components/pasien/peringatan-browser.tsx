import { TriangleAlert } from "lucide-react";
import { headers } from "next/headers";
import { deteksiPeramban, langkahBukaBrowser, namaBrowserDisarankan } from "@/lib/pasien/peramban";

/**
 * Peringatan di beranda & sesi bila dibuka dari browser dalam aplikasi (kamera sering diblokir di sana).
 * Server Component: membaca User-Agent, jadi harus dirender di dalam <Suspense>.
 * Halaman ini tidak tahu token pasien (hanya hash), sehingga arahannya: buka ulang link dari terapis.
 */
export async function PeringatanBrowser() {
  const info = deteksiPeramban((await headers()).get("user-agent"));
  if (!info.aplikasi) return null;
  const browser = namaBrowserDisarankan(info.os);
  return (
    <section role="alert" className="flex flex-col gap-3 rounded-2xl border-2 border-peringatan/50 bg-peringatan-bg p-4 text-peringatan-teks">
      <p className="flex items-start gap-3 text-xl font-bold leading-snug">
        <TriangleAlert aria-hidden className="mt-0.5 size-7 shrink-0" />
        Kamera bisa tidak berfungsi di dalam {info.aplikasi}. Buka link dari terapis lewat {browser}.
      </p>
      <ol className="flex list-decimal flex-col gap-1 pl-10 text-lg">
        {langkahBukaBrowser(info).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ol>
    </section>
  );
}
