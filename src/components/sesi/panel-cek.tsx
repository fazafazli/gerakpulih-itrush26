import { CircleCheck, CircleX, Info, LoaderCircle } from "lucide-react";
import type { ItemKesiapan } from "@/lib/pose/readiness";

/** Hanya SATU instruksi utama yang ditonjolkan; daftar centang di bawahnya sebagai konteks. */
export function PanelCek(props: { memuat: boolean; instruksi: ItemKesiapan | null; item: readonly ItemKesiapan[]; siap: boolean }) {
  if (props.memuat) {
    return (
      <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#F4F7FA] p-4 text-lg font-semibold">
        <LoaderCircle aria-hidden className="size-6 shrink-0 animate-spin text-[#0B5CAD]" />
        Menyiapkan pendeteksi gerak…
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {props.siap ? (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#ECFDF3] p-4 text-[22px] font-extrabold text-[#067647]">
          <CircleCheck aria-hidden className="size-7 shrink-0" />
          Bagus, tetap di posisi ini
        </p>
      ) : (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#FFFAEB] p-4 text-[22px] font-extrabold text-[#93370D]">
          <Info aria-hidden className="size-7 shrink-0" />
          {props.instruksi?.pesan ?? "Duduk di depan kamera"}
        </p>
      )}
      <ul className="flex flex-wrap gap-2 text-[15px] font-semibold" aria-label="Pemeriksaan posisi">
        {props.item.map((i) => (
          <li
            key={i.kode}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
              i.status === "lolos"
                ? "bg-[#ECFDF3] text-[#067647]"
                : i.status === "gagal"
                  ? "bg-[#FEF3F2] text-[#B42318]"
                  : "bg-[#F4F7FA] text-[#3D4C5C]"
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
      <p className="text-[15px] text-[#3D4C5C]">Tidak perlu menyentuh HP. Latihan dimulai otomatis setelah semua centang hijau.</p>
    </div>
  );
}
