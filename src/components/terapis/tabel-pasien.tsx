import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type BarisDaftar, labelRelatif } from "@/lib/terapis/olah";
import { LencanaStatus } from "./lencana-status";
import { Sparkline } from "./sparkline";

function Capaian({ b }: { b: BarisDaftar }) {
  if (!b.sorotan) return <span className="text-muted-foreground">—</span>;
  const { puncak, target, nama } = b.sorotan;
  const capai = puncak != null && puncak >= target;
  return (
    <span className="flex flex-col">
      <span className="tabular-nums">
        <b className="font-semibold">{puncak != null ? `${Math.round(puncak)}°` : "—"}</b>
        <span className="text-muted-foreground"> / {target}°</span>
        {capai && <span className="sr-only"> (target tercapai)</span>}
      </span>
      <span className="text-xs text-muted-foreground">{nama}</span>
      {b.tren.length > 1 && (
        <span className="mt-1">
          <Sparkline nilai={b.tren} />
        </span>
      )}
    </span>
  );
}

/** Tabel di layar lebar, daftar bertumpuk di HP. Seluruh baris bisa diklik. */
export function TabelPasien({ baris, sekarang }: { baris: BarisDaftar[]; sekarang: Date }) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Pasien</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sesi 7 hari</TableHead>
              <TableHead>Capaian terendah</TableHead>
              <TableHead>Sesi terakhir</TableHead>
              <TableHead className="w-8 pr-5">
                <span className="sr-only">Buka</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {baris.map((b) => (
              <TableRow
                key={b.id}
                className="group relative transition-[background-color,box-shadow] hover:bg-mint-pucat hover:shadow-[inset_3px_0_0_var(--primary)] focus-within:bg-mint-pucat focus-within:shadow-[inset_3px_0_0_var(--primary)]"
              >
                <TableCell className="py-3 pl-5">
                  <Link href={`/pasien/${b.id}`} className="font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
                    {b.nama}
                  </Link>
                  <span className="block text-xs text-muted-foreground">
                    Sisi {b.sisi}
                    {b.isDemo && " · contoh"}
                  </span>
                </TableCell>
                <TableCell>
                  <LencanaStatus status={b.status} />
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{b.sesi7Hari}</TableCell>
                <TableCell>
                  <Capaian b={b} />
                </TableCell>
                <TableCell className="text-muted-foreground">{b.terakhirSesi ? labelRelatif(b.terakhirSesi, sekarang) : "Belum ada"}</TableCell>
                <TableCell className="pr-5">
                  <ChevronRight
                    aria-hidden
                    className="size-4 text-muted-foreground opacity-40 transition-[transform,opacity] group-focus-within:translate-x-1 group-focus-within:opacity-100 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {baris.map((b) => (
          <li key={b.id}>
            <Link
              href={`/pasien/${b.id}`}
              className="group flex items-center gap-3 px-4 py-3.5 transition-[background-color,box-shadow] hover:bg-mint-pucat hover:shadow-[inset_3px_0_0_var(--primary)] focus-visible:bg-mint-pucat focus-visible:shadow-[inset_3px_0_0_var(--primary)] focus-visible:outline-none"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{b.nama}</span>
                  <LencanaStatus status={b.status} />
                </span>
                {b.tren.length > 1 && (
                  <span className="mt-1.5 block">
                    <Sparkline nilai={b.tren} />
                  </span>
                )}
                <span className="mt-1 block text-sm text-muted-foreground">
                  {b.sesi7Hari} sesi minggu ini · {b.terakhirSesi ? labelRelatif(b.terakhirSesi, sekarang) : "belum ada sesi"}
                </span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
