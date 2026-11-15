"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { masuk, type StatusMasuk } from "./actions";

const kelasInput =
  "h-12 w-full rounded-xl border border-[#C9D3DE] bg-white px-4 text-base outline-none focus:border-[#0B5CAD] focus:ring-2 focus:ring-[#0B5CAD]/30";

export function FormMasuk() {
  const params = useSearchParams();
  const [status, aksi, menunggu] = useActionState<StatusMasuk, FormData>(masuk, { pesan: null });
  const galatDemo = params.get("galat") === "demo";

  return (
    <form action={aksi} className="flex flex-col gap-4">
      <input type="hidden" name="lanjut" value={params.get("lanjut") ?? ""} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Email
        <input name="email" type="email" autoComplete="email" required className={kelasInput} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Kata sandi
        <input name="password" type="password" autoComplete="current-password" required className={kelasInput} />
      </label>
      {(status.pesan || galatDemo) && (
        <p role="alert" className="rounded-xl border border-[#F3D9AE] bg-[#FFF6E8] px-4 py-3 text-sm font-semibold text-[#5A2A00]">
          {status.pesan ?? "Akun demo belum siap. Hubungi tim pengembang."}
        </p>
      )}
      <button
        type="submit"
        disabled={menunggu}
        className="h-14 rounded-2xl bg-[#0B5CAD] text-lg font-bold text-white transition hover:bg-[#08467F] disabled:opacity-60"
      >
        {menunggu ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
