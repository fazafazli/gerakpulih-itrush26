import { KODE_GERAKAN, NAMA_GERAKAN, type InputRingkasan, type KodeGerakan } from "./schema";

export type BarisProgram = { kode_gerakan: string; target_sudut: number; aktif: boolean };
export type BarisSesiGerakan = {
  kode_gerakan: string;
  repetisi_selesai: number;
  rep_kompensasi: number;
  puncak_maks: number | null;
};
export type BarisSesi = { mulai: string; sesi_gerakan: BarisSesiGerakan[] | null };
export type BarisKejadian = {
  jenis: string;
  kode_gerakan: string | null;
  sudut: number | null;
  repetisi_ke: number | null;
};

const bulat = (x: number) => Math.round(x * 10) / 10;
const rata = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
const isKode = (k: string): k is KodeGerakan => (KODE_GERAKAN as readonly string[]).includes(k);

function persenKompensasi(entri: BarisSesiGerakan[]): number | null {
  const per = entri
    .filter((e) => e.repetisi_selesai > 0)
    .map((e) => (e.rep_kompensasi / e.repetisi_selesai) * 100);
  const r = rata(per);
  return r == null ? null : bulat(r);
}

export function bangunInput(args: {
  program: BarisProgram[];
  sesi: BarisSesi[];
  kejadian: BarisKejadian[];
  periodeHari: number;
  sesiPerHari?: number;
}): InputRingkasan {
  const { program, kejadian, periodeHari, sesiPerHari = 1 } = args;
  const sesi = [...args.sesi].sort((a, b) => a.mulai.localeCompare(b.mulai));
  const JENDELA = 3; 
  
  const gerakan = program
    .filter((p) => p.aktif && isKode(p.kode_gerakan))
    .map((p) => {
      const kode = p.kode_gerakan as KodeGerakan;
      const entri = sesi
        .map((s) => (s.sesi_gerakan ?? []).find((g) => g.kode_gerakan === kode))
        .filter((g): g is BarisSesiGerakan => Boolean(g));
      const puncak = entri.map((e) => e.puncak_maks).filter((x): x is number => x != null);
      const idxTarget = entri.findIndex((e) => e.puncak_maks != null && e.puncak_maks >= p.target_sudut);
      return {
        kode,
        nama: NAMA_GERAKAN[kode],
        target_sudut: p.target_sudut,
        jumlah_sesi: entri.length,
        puncak_awal: puncak.length ? bulat(puncak[0]) : null,
        puncak_akhir: puncak.length ? bulat(puncak[puncak.length - 1]) : null,
        puncak_terbaik: puncak.length ? bulat(Math.max(...puncak)) : null,
        sesi_pertama_capai_target: idxTarget >= 0 ? idxTarget + 1 : null,
        persen_kompensasi_awal: persenKompensasi(entri.slice(0, JENDELA)),
        persen_kompensasi_akhir: entri.length > JENDELA ? persenKompensasi(entri.slice(-JENDELA)) : null,
      };
    });

  const kejadian_nyeri = kejadian
    .filter((k) => k.jenis === "stop_nyeri")
    .map((k) => ({
      gerakan: k.kode_gerakan && isKode(k.kode_gerakan) ? NAMA_GERAKAN[k.kode_gerakan] : "tidak diketahui",
      sudut: k.sudut == null ? null : bulat(Number(k.sudut)),
      repetisi_ke: k.repetisi_ke,
    }));

  return {
    periode_hari: periodeHari,
    sesi_direncanakan: Math.max(0, Math.round(periodeHari * sesiPerHari)),
    sesi_dilakukan: sesi.length,
    gerakan,
    kejadian_nyeri,
  };
}
