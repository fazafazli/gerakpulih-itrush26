import Link from "next/link";
import { type Aktivitas, jamWib, labelRelatif } from "@/lib/terapis/olah";

/** Linimasa sesi terbaru dari semua pasien. */
export function AktivitasTerbaru({ aktivitas, sekarang }: { aktivitas: Aktivitas[]; sekarang: Date }) {
  if (!aktivitas.length) {
    return <p className="px-5 py-6 text-sm text-muted-foreground">Belum ada sesi latihan yang tercatat.</p>;
  }
  return (
    <ol className="relative px-5 py-4">
      <span aria-hidden className="absolute top-6 bottom-6 left-[27px] w-px bg-border" />
      {aktivitas.map((a) => {
        const lengkap = a.repetisiTarget > 0 && a.repetisi >= a.repetisiTarget;
        return (
          <li key={a.id} className="relative flex gap-3 py-2.5">
            <span
              aria-hidden
              className={`relative z-10 mt-1 size-3 shrink-0 rounded-full ring-4 ring-card ${a.nyeri ? "bg-bahaya" : lengkap ? "bg-primary" : "bg-teal-segar/50"}`}
            />
            <div className="min-w-0 flex-1 text-sm">
              <p>
                <Link href={`/pasien/${a.pasienId}`} className="font-semibold hover:underline">
                  {a.nama}
                </Link>{" "}
                {a.nyeri ? "menghentikan sesi karena nyeri" : lengkap ? "menyelesaikan sesi" : "berlatih sebagian"}
              </p>
              <p className="text-muted-foreground">
                {a.repetisiTarget > 0 ? `${a.repetisi}/${a.repetisiTarget} repetisi` : "belum ada repetisi"} · {labelRelatif(a.mulai, sekarang)},{" "}
                {jamWib(a.mulai)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
