import { PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/terapis/kepala-terapis";
import { Button } from "@/components/ui/button";
import { masukDemo } from "./actions";
import { FormMasuk } from "./form-masuk";

export const metadata: Metadata = { title: "Masuk Fisioterapis · GerakPulih" };

export default function HalamanMasuk() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <Link href="/" className="flex w-fit items-center gap-2 font-heading text-lg font-bold tracking-tight text-primary">
        <Logo /> GerakPulih
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight">Masuk fisioterapis</h1>
        <p className="text-muted-foreground">Pantau latihan pasien di rumah, atur program, dan tinjau laporan nyeri.</p>
      </div>

      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
          <FormMasuk />
        </Suspense>

        <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden="true">
          <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
        </div>

        <form action={masukDemo} className="flex flex-col gap-2">
          <Button type="submit" variant="outline" className="h-12 gap-2 border-primary/40 bg-mint text-base font-semibold text-primary hover:bg-mint-pucat">
            <PlayCircle aria-hidden className="size-5" />
            Coba dengan akun demo
          </Button>
          <p className="text-center text-xs text-muted-foreground">Berisi data contoh. Pasien contoh dijaga agar tidak bisa dihapus.</p>
        </form>
      </section>
    </main>
  );
}
