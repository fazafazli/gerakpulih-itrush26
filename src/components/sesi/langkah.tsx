import { Check } from "lucide-react";

const LANGKAH = ["Siapkan", "Cek", "Latihan"] as const;

/** Penanda tahap (1 Siapkan · 2 Cek · 3 Latihan) seperti di mockup. */
export function PenandaLangkah({ aktif }: { aktif: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 text-[15px] font-semibold" aria-label="Tahap latihan">
      {LANGKAH.map((nama, i) => {
        const selesai = i < aktif;
        const sekarang = i === aktif;
        return (
          <li key={nama} className="flex flex-1 items-center gap-2" aria-current={sekarang ? "step" : undefined}>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm ${
                selesai ? "bg-[#067647] text-white" : sekarang ? "bg-[#0B5CAD] text-white" : "bg-[#E7ECF1] text-[#3D4C5C]"
              }`}
            >
              {selesai ? <Check aria-hidden className="size-4" /> : i + 1}
            </span>
            <span className={sekarang ? "text-[#0F1E2E]" : "text-[#5B6B7C]"}>{nama}</span>
          </li>
        );
      })}
    </ol>
  );
}
