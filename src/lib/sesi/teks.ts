import { GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";
import type { Sisi } from "@/lib/pose/landmarks";

/** "Angkat tangan ke samping" + kanan → "Angkat tangan kanan ke samping". Pasien selalu tahu tangan mana. */
export function namaDenganSisi(kode: KodeGerakan, sisi: Sisi): string {
  const nama = GERAKAN[kode].nama;
  if (nama.includes("tangan")) return nama.replace("tangan", `tangan ${sisi}`);
  return `${nama} ${sisi}`;
}

/** Petunjuk posisi kamera per gerakan (hasil uji teknis: gerakan harus sejajar layar agar sudut akurat). */
export function petunjukPosisi(kode: KodeGerakan, sisi: Sisi): string {
  return GERAKAN[kode].posisiKamera === "samping"
    ? `Putar kursi menyamping. Tangan ${sisi} menghadap kamera.`
    : "Duduk menghadap kamera.";
}

/** Kalimat yang dibacakan saat sebuah gerakan diperkenalkan. */
export function suaraPengantar(nomor: number, kode: KodeGerakan, sisi: Sisi, repetisi: number): string {
  return `Gerakan ${nomor}. ${namaDenganSisi(kode, sisi)}, ${repetisi} kali. ${petunjukPosisi(kode, sisi)}`;
}

export const PANDUAN_SIAPKAN = [
  "HP berdiri tegak, setinggi dada",
  "Duduk di kursi tanpa sandaran tangan",
  "Ruangan terang, jangan membelakangi jendela",
  "Pendamping ada di dekat pasien",
] as const;

export const SUARA_PANDUAN = `Siapkan tempat latihan. ${PANDUAN_SIAPKAN.join(". ")}. Jika sudah, ketuk Sudah siap.`;
