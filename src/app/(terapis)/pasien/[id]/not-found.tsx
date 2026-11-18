import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PasienTidakDitemukan() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5">
      <h1 className="font-heading text-2xl font-bold">Pasien tidak ditemukan</h1>
      <p className="text-muted-foreground">Pasien ini tidak ada atau bukan pasien Anda.</p>
      <Link href="/dashboard" className={cn(buttonVariants(), "h-11 w-fit px-5")}>
        Kembali ke dashboard
      </Link>
    </main>
  );
}
