import { ChevronDown } from "lucide-react";

/** Jawaban sesuai kemampuan aplikasi yang sebenarnya (lihat src/lib/pose, src/lib/sesi, src/lib/ai). */
const FAQ = [
  {
    t: "Apakah video pasien direkam?",
    j: "Tidak. Gambar kamera diproses langsung di browser HP pasien untuk mengenali pose. Yang dikirim ke server hanya angka: jumlah repetisi, sudut tertinggi, berapa kali badan miring, dan laporan nyeri.",
  },
  {
    t: "HP seperti apa yang didukung?",
    j: "HP Android atau iPhone dengan kamera depan dan browser terbaru (Chrome di Android, Safari di iPhone). Bila HP lambat, aplikasi otomatis memakai model deteksi yang lebih ringan. Link yang terbuka di dalam WhatsApp atau Instagram diarahkan untuk dibuka di Chrome.",
  },
  {
    t: "Bagaimana kalau gerakan pasien salah?",
    j: "Aplikasi mengingatkan saat badan miring atau bahu ikut terangkat, dan hanya menghitung repetisi “mencapai target” bila sudutnya cukup. Terapis melihat jumlahnya per sesi. Aplikasi tidak menilai teknik gerakan secara klinis; itu tetap tugas terapis.",
  },
  {
    t: "Apa yang dilakukan AI?",
    j: "Di HP, model MediaPipe mengukur posisi sendi; hitungan dan peringatan memakai aturan tetap. Untuk terapis, Gemini merangkum angka latihan tanpa nama atau identitas, diberi label “perlu ditinjau”. Bila AI tidak tersedia, dipakai template dari aturan tetap.",
  },
  {
    t: "Siapa yang bisa melihat data latihan?",
    j: "Hanya fisioterapis yang menangani pasien tersebut; aturan akses diterapkan di database (Row Level Security). Pasien bisa meminta terapis menonaktifkan link atau menghapus datanya.",
  },
  {
    t: "Apakah bisa dipakai tanpa terapis?",
    j: "Tidak. Program latihan, target, dan link dibuat oleh terapis; pasien tidak bisa memilih gerakan sendiri. GerakPulih adalah alat bantu terapis, bukan pengganti terapi.",
  },
] as const;

export function Faq() {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {FAQ.map(({ t, j }) => (
        <details key={t} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-base font-semibold hover:bg-mint-pucat focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            {t}
            <ChevronDown aria-hidden className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
          </summary>
          <p className="max-w-[70ch] px-5 pb-5 leading-relaxed text-muted-foreground">{j}</p>
        </details>
      ))}
    </div>
  );
}
