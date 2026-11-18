"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { type StatusLink, tambahPasien } from "@/app/(terapis)/pasien/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GERAKAN, KODE_GERAKAN } from "@/lib/pose/exercises";
import { cn } from "@/lib/utils";
import { HasilLink } from "./hasil-link";

const pilihan =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 has-checked:border-primary has-checked:bg-mint has-focus-visible:ring-3 has-focus-visible:ring-ring/50";

export function FormPasienBaru() {
  const [status, aksi, menunggu] = useActionState<StatusLink, FormData>(tambahPasien, { status: "awal" });

  if (status.status === "ok") {
    return (
      <section aria-labelledby="judul-hasil" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 id="judul-hasil" className="font-heading text-xl font-semibold">
            {status.nama} sudah ditambahkan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Kirim link di bawah ke pasien atau pendampingnya.</p>
        </div>
        <HasilLink nama={status.nama} url={status.url} qr={status.qr} />
        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
          <Link href={`/pasien/${status.pasienId}/program`} className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}>
            Sesuaikan target latihan
          </Link>
          <Link href={`/pasien/${status.pasienId}`} className={cn(buttonVariants({ variant: "ghost" }), "h-11 px-4")}>
            Lihat halaman pasien
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form action={aksi} className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama_tampilan" className="text-sm font-semibold">
          Nama panggilan
        </Label>
        <Input
          id="nama_tampilan"
          name="nama_tampilan"
          required
          maxLength={60}
          autoComplete="off"
          placeholder="mis. Pak Budi"
          aria-describedby="nama-ket"
          className="h-11 text-base"
        />
        <p id="nama-ket" className="text-xs text-muted-foreground">
          Cukup nama panggilan yang muncul di layar pasien. Jangan isi nama lengkap, NIK, atau nomor rekam medis.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">Lengan yang dilatih</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["kanan", "kiri"] as const).map((s) => (
            <label key={s} className={pilihan}>
              <input type="radio" name="sisi_dilatih" value={s} required className="size-4 accent-primary" />
              Lengan {s}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">Gerakan awal</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {KODE_GERAKAN.map((k) => (
            <label key={k} className={pilihan}>
              <input type="checkbox" name="gerakan" value={k} defaultChecked className="size-4 accent-primary" />
              <span>
                {GERAKAN[k].nama}
                <span className="block text-xs font-normal text-muted-foreground">
                  {GERAKAN[k].targetDefault}° · {GERAKAN[k].repetisiDefault}×
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Target & repetisi bisa disesuaikan setelah pasien dibuat.</p>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="catatan" className="text-sm font-semibold">
          Catatan untuk terapis <span className="font-normal text-muted-foreground">(opsional)</span>
        </Label>
        <Textarea id="catatan" name="catatan" maxLength={280} rows={3} aria-describedby="catatan-ket" className="text-base" />
        <p id="catatan-ket" className="text-xs text-muted-foreground">
          Hanya terlihat oleh Anda dan tidak dikirim ke AI. Maksimal 280 karakter.
        </p>
      </div>

      {status.status === "galat" && (
        <p role="alert" className="rounded-lg bg-bahaya-bg px-3 py-2.5 text-sm font-medium text-bahaya">
          {status.pesan}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          Pasien masuk lewat link pribadi tanpa akun. Video latihan tidak pernah keluar dari HP pasien.
        </p>
        <Button type="submit" disabled={menunggu} className="h-11 shrink-0 px-6 text-base">
          {menunggu ? "Membuat link…" : "Buat pasien & link"}
        </Button>
      </div>
    </form>
  );
}
