import { CircleCheck, CircleX, Info, LoaderCircle } from "lucide-react";
import type { ItemKesiapan } from "@/lib/pose/readiness";

/** Hanya SATU instruksi utama yang ditonjolkan; daftar centang di bawahnya sebagai konteks. */
export function PanelCek(props: { memuat: boolean; instruksi: ItemKesiapan | null; item: readonly ItemKesiapan[]; siap: boolean }) {
  if (props.memuat) {
    return (
      <p role="status" className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-lg font-semibold">
        <LoaderCircle aria-hidden className="size-6 shrink-0 animate-spin text-primary" />
        Menyiapkan pendeteksi gerak…
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {props.siap ? (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-sukses-bg p-4 text-2xl font-bold text-sukses-teks animate-gp-masuk">
          <CircleCheck aria-hidden className="size-7 shrink-0" />
          Bagus, tetap di posisi ini
        </p>
      ) : (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-peringatan-bg p-4 text-2xl font-bold text-peringatan-teks">
          <Info aria-hidden className="size-7 shrink-0" />
          {props.instruksi?.pesan ?? "Duduk di depan kamera"}
        </p>
      )}
      <ul className="flex flex-wrap gap-2 text-lg font-semibold" aria-label="Pemeriksaan posisi">
        {props.item.map((i) => (
          <li
            key={i.kode}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
              i.status === "lolos"
                ? "bg-sukses-bg text-sukses-teks"
                : i.status === "gagal"
                  ? "bg-bahaya-bg text-bahaya"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i.status === "lolos" ? (
              <CircleCheck aria-hidden className="size-4" />
            ) : i.status === "gagal" ? (
              <CircleX aria-hidden className="size-4" />
            ) : (
              <Info aria-hidden className="size-4" />
            )}
            {i.pesan}
          </li>
        ))}
      </ul>
      <p className="text-lg text-muted-foreground">Tidak perlu menyentuh HP. Latihan dimulai otomatis setelah semua centang hijau.</p>
    </div>
  );
}
