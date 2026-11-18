"use client";

import { TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { masuk, type StatusMasuk } from "./actions";

export function FormMasuk() {
  const params = useSearchParams();
  const [status, aksi, menunggu] = useActionState<StatusMasuk, FormData>(masuk, { pesan: null });
  const galatDemo = params.get("galat") === "demo";

  return (
    <form action={aksi} className="flex flex-col gap-4">
      <input type="hidden" name="lanjut" value={params.get("lanjut") ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-12 bg-card text-base" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-sm font-semibold">
          Kata sandi
        </Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-12 bg-card text-base" />
      </div>
      {(status.pesan || galatDemo) && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-peringatan-bg px-4 py-3 text-sm font-semibold text-peringatan-teks">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {status.pesan ?? "Akun demo belum siap. Hubungi tim pengembang."}
        </p>
      )}
      <Button type="submit" disabled={menunggu} className="h-12 text-base font-semibold">
        {menunggu ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
