import type { Metadata } from "next";

export const metadata: Metadata = { title: "Link tidak berlaku · GerakPulih" };

export default function AksesTidakValid() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5 py-10 text-[#0F1E2E]">
      <h1 className="text-3xl font-extrabold leading-tight">Link latihan tidak berlaku</h1>
      <p className="text-lg leading-relaxed text-[#3D4C5C]">
        Link mungkin salah ketik, sudah diganti, atau sudah tidak aktif. Minta link baru kepada fisioterapis Anda, lalu buka lewat
        WhatsApp.
      </p>
      <p className="text-base text-[#3D4C5C]">
        Anda fisioterapis?{" "}
        <a href="/masuk" className="font-semibold text-[#0B5CAD] underline">
          Masuk di sini
        </a>
      </p>
    </main>
  );
}
