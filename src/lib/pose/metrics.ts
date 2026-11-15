import type { DefinisiGerakan } from "./exercises";
import { kePiksel, keDunia, sudut3 } from "./geometry";
import { keyakinan, keyakinanMin, sendiSisi, type Landmark, type Sisi, type Titik } from "./landmarks";

export type ModeKoordinat = "2d" | "3d";
export type PilihanAcuan = "otomatis" | "pinggul" | "vertikal";
export type AcuanDipakai = "pinggul" | "vertikal" | "tidak_perlu";

export type HasilMetrik = {
  /** Derajat. Bahu: 0 = lengan turun, 90 = horizontal. Siku: 0 = lurus, makin besar makin tertekuk. */
  nilai: number;
  acuan: AcuanDipakai;
  keyakinan: number;
  keyakinanPinggul: number;
};

export const AMBANG_KEYAKINAN = 0.5;

export function hitungMetrik(args: {
  landmark: readonly Landmark[];
  dunia?: readonly Landmark[] | null;
  gerakan: DefinisiGerakan;
  sisi: Sisi;
  lebar: number;
  tinggi: number;
  mode?: ModeKoordinat;
  acuan?: PilihanAcuan;
}): HasilMetrik {
  const { landmark, dunia, gerakan, sisi, lebar, tinggi, mode = "2d", acuan = "otomatis" } = args;
  const s = sendiSisi(sisi);
  const p2 = kePiksel(landmark, lebar, tinggi);
  const p = mode === "3d" && dunia && dunia.length ? keDunia(dunia) : p2;
  const keyakinanPinggul = keyakinan(landmark[s.pinggul]);

  if (gerakan.sendi === "siku") {
    return {
      nilai: 180 - sudut3(p[s.bahu], p[s.siku], p[s.pergelangan]),
      acuan: "tidak_perlu",
      keyakinan: keyakinanMin(landmark, [s.bahu, s.siku, s.pergelangan]),
      keyakinanPinggul,
    };
  }

  const keyakinanLengan = keyakinanMin(landmark, [s.bahu, s.siku]);
  const pakaiPinggul = acuan === "pinggul" || (acuan === "otomatis" && keyakinanPinggul >= AMBANG_KEYAKINAN);
  if (pakaiPinggul) {
    return { nilai: sudut3(p[s.siku], p[s.bahu], p[s.pinggul]), acuan: "pinggul", keyakinan: keyakinanLengan, keyakinanPinggul };
  }
  const bahu = p2[s.bahu];
  const bawahBahu: Titik = [bahu[0], bahu[1] + 100, 0];
  return { nilai: sudut3(p2[s.siku], bahu, bawahBahu), acuan: "vertikal", keyakinan: keyakinanLengan, keyakinanPinggul };
}
