import type { Metadata } from "next";
import { Suspense } from "react";
import { masukDemo } from "./actions";
import { FormMasuk } from "./form-masuk";

export const metadata: Metadata = { title: "Masuk Fisioterapis · GerakPulih" };

export default function HalamanMasuk() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10 text-[#0F1E2E]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Masuk fisioterapis</h1>
        <p className="text-base text-[#3D4C5C]">Pantau latihan pasien di rumah.</p>
      </div>

      <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
        <FormMasuk />
      </Suspense>

      <div className="flex items-center gap-3 text-sm text-[#3D4C5C]" aria-hidden="true">
        <span className="h-px flex-1 bg-[#DDE4EB]" /> atau <span className="h-px flex-1 bg-[#DDE4EB]" />
      </div>

      <form action={masukDemo}>
        <button
          type="submit"
          className="h-14 w-full rounded-2xl border-2 border-[#0B5CAD] bg-white text-lg font-bold text-[#0B5CAD] transition hover:bg-[#E6F0FA]"
        >
          Coba dengan akun demo
        </button>
      </form>
    </main>
  );
}
