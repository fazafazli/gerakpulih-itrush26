import { ArrowRight, CircleAlert, CirclePause, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { GERAKAN, isKodeGerakan } from "@/lib/pose/exercises";
import { type BarisDaftar, labelRelatif, selisihHari } from "@/lib/terapis/olah";

type Nyeri = { id: string; pasien_id: string; kode_gerakan: string | null; sudut: number | null; terjadi_pada: string };

/** Hal yang perlu ditinjau terapis lebih dulu: laporan nyeri & pasien yang jeda latihan. */
export function AreaTindakLanjut({ nyeri, baris, sekarang }: { nyeri: Nyeri[]; baris: BarisDaftar[]; sekarang: Date }) {
  const nama = new Map(baris.map((b) => [b.id, b.nama]));
  const jeda = baris.filter((b) => b.status === "tidak_latihan");
  const kosong = nyeri.length === 0 && jeda.length === 0;

  return (
    <section aria-labelledby="judul-tindak-lanjut" className="rounded-xl border border-border bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-5 py-4">
        <h2 id="judul-tindak-lanjut" className="font-heading text-lg font-semibold">
          Perlu ditinjau
        </h2>
        {!kosong && <span className="text-sm text-muted-foreground">{nyeri.length + jeda.length} hal</span>}
      </div>

      {kosong ? (
        <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden className="size-5 text-sukses" />
          Tidak ada laporan nyeri atau jeda latihan. Semua pasien berlatih sesuai jadwal.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {nyeri.map((k) => (
            <li key={k.id}>
              <Link
                href={`/pasien/${k.pasien_id}#nyeri`}
                className="group flex items-start gap-3 border-l-4 border-bahaya px-4 py-3.5 transition-colors hover:bg-bahaya-bg/60 focus-visible:bg-bahaya-bg/60 focus-visible:outline-none"
              >
                <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-bahaya" />
                <span className="flex-1 text-sm">
                  <span className="font-semibold">{nama.get(k.pasien_id) ?? "Pasien"}</span> menekan &ldquo;Berhenti, terasa sakit&rdquo;
                  {k.kode_gerakan && isKodeGerakan(k.kode_gerakan) && <> saat {GERAKAN[k.kode_gerakan].nama.toLowerCase()}</>}
                  {k.sudut != null && <> di {Math.round(Number(k.sudut))}°</>}
                  <span className="block text-muted-foreground">{labelRelatif(k.terjadi_pada, sekarang)} · belum ditindaklanjuti</span>
                </span>
                <ArrowRight aria-hidden className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
          {jeda.map((b) => (
            <li key={b.id}>
              <Link
                href={`/pasien/${b.id}`}
                className="group flex items-start gap-3 border-l-4 border-peringatan px-4 py-3.5 transition-colors hover:bg-peringatan-bg/70 focus-visible:bg-peringatan-bg/70 focus-visible:outline-none"
              >
                <CirclePause aria-hidden className="mt-0.5 size-5 shrink-0 text-peringatan-teks" />
                <span className="flex-1 text-sm">
                  <span className="font-semibold">{b.nama}</span> belum berlatih lagi
                  <span className="block text-muted-foreground">
                    sesi terakhir {b.terakhirSesi ? `${selisihHari(b.terakhirSesi, sekarang)} hari lalu` : "—"}
                  </span>
                </span>
                <ArrowRight aria-hidden className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
