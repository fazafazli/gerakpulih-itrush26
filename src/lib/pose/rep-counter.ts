/**
 * Penghitung repetisi RELATIF.
 * Tidak memakai ambang absolut (temuan uji: tangan istirahat di paha ≈ 30–40°,
 * sehingga ambang tetap 30° membuat repetisi bahu tak pernah selesai).
 * Satu repetisi = naik ≥ amplitudoMin dari lembah, lalu turun kembali ≥ persenKembali dari amplitudonya.
 */
export type KonfigRepetisi = {
  amplitudoMin: number;
  persenKembali: number;
  durasiMinMs: number;
  targetSudut?: number;
};

export const KONFIG_REPETISI_DEFAULT: Omit<KonfigRepetisi, "amplitudoMin"> = {
  persenKembali: 0.65,
  durasiMinMs: 600,
};

export type StatusRepetisi = {
  fase: "istirahat" | "naik";
  lembah: number | null;
  puncak: number;
  mulaiNaik: number;
  kompensasiSaatIni: boolean;
  jumlah: number;
  capaiTarget: number;
  denganKompensasi: number;
  daftarPuncak: readonly number[];
};

export type KejadianRepetisi = {
  nomor: number;
  puncak: number;
  capaiTarget: boolean;
  kompensasi: boolean;
};

export function statusRepetisiAwal(lembah: number | null = null): StatusRepetisi {
  return {
    fase: "istirahat",
    lembah,
    puncak: 0,
    mulaiNaik: 0,
    kompensasiSaatIni: false,
    jumlah: 0,
    capaiTarget: 0,
    denganKompensasi: 0,
    daftarPuncak: [],
  };
}

const LAJU_GESER_LEMBAH = 0.005;

export function perbaruiRepetisi(
  s: StatusRepetisi,
  nilai: number,
  kompensasi: boolean,
  t: number,
  konfig: KonfigRepetisi,
): { status: StatusRepetisi; repetisi?: KejadianRepetisi } {
  if (Number.isNaN(nilai)) return { status: s };
  const lembah = s.lembah ?? nilai;

  if (s.fase === "istirahat") {
    const lembahBaru = nilai < lembah ? nilai : lembah + (nilai - lembah) * LAJU_GESER_LEMBAH;
    if (nilai - lembahBaru >= konfig.amplitudoMin) {
      return { status: { ...s, fase: "naik", lembah: lembahBaru, puncak: nilai, mulaiNaik: t, kompensasiSaatIni: kompensasi } };
    }
    return { status: { ...s, lembah: lembahBaru } };
  }

  const puncak = Math.max(s.puncak, nilai);
  const kompensasiSaatIni = s.kompensasiSaatIni || kompensasi;
  const sudahKembali = nilai <= puncak - konfig.persenKembali * (puncak - lembah);
  if (!sudahKembali) return { status: { ...s, puncak, kompensasiSaatIni } };

  const selesai: StatusRepetisi = { ...s, fase: "istirahat", lembah: nilai, puncak: 0, kompensasiSaatIni: false };
  if (t - s.mulaiNaik < konfig.durasiMinMs) return { status: selesai };

  const capai = konfig.targetSudut != null && puncak >= konfig.targetSudut;
  const repetisi: KejadianRepetisi = { nomor: s.jumlah + 1, puncak, capaiTarget: capai, kompensasi: kompensasiSaatIni };
  return {
    status: {
      ...selesai,
      jumlah: s.jumlah + 1,
      capaiTarget: s.capaiTarget + (capai ? 1 : 0),
      denganKompensasi: s.denganKompensasi + (kompensasiSaatIni ? 1 : 0),
      daftarPuncak: [...s.daftarPuncak, puncak],
    },
    repetisi,
  };
}
