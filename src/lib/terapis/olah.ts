import { GERAKAN, isKodeGerakan, KODE_GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";

/**
 * Olah data dashboard terapis. Murni (tanpa database/React) agar mudah diuji.
 * Semua pengelompokan per hari memakai WIB (UTC+7, tanpa DST), bukan zona waktu server.
 */

const WIB_MS = 7 * 60 * 60 * 1000;
const HARI_MS = 24 * 60 * 60 * 1000;

/** Pasien dianggap "belum latihan lagi" bila sesi terakhir lebih lama dari ini. */
export const HARI_TANPA_LATIHAN = 3;

/** Tanggal kalender WIB "YYYY-MM-DD". */
export function tanggalWib(waktu: string | Date): string {
  const t = typeof waktu === "string" ? Date.parse(waktu) : waktu.getTime();
  return new Date(t + WIB_MS).toISOString().slice(0, 10);
}

/** Selisih hari kalender WIB (b − a). */
export function selisihHari(a: string | Date, b: string | Date): number {
  return Math.round((Date.parse(tanggalWib(b)) - Date.parse(tanggalWib(a))) / HARI_MS);
}

// ---------- Bentuk data dari database ----------

export type BarisGerakanSesi = {
  kode_gerakan: string;
  target_sudut: number;
  repetisi_target: number;
  repetisi_selesai: number;
  rep_capai_target: number;
  rep_kompensasi: number;
  puncak_maks: number | null;
};

export type BarisSesiTerapis = {
  id: string;
  pasien_id: string;
  mulai: string;
  dihentikan_nyeri: boolean;
  sesi_gerakan: BarisGerakanSesi[] | null;
};

export type BarisPasien = {
  id: string;
  nama_tampilan: string;
  sisi_dilatih: string;
  aktif: boolean;
  is_demo: boolean;
};

const urutMulai = <T extends { mulai: string }>(xs: readonly T[]) => [...xs].sort((a, b) => a.mulai.localeCompare(b.mulai));
const bulat = (x: number) => Math.round(x * 10) / 10;

// ---------- Grafik progres ----------

export type TitikProgres = {
  tanggal: string;
  puncak: number | null;
  target: number;
  nyeri: boolean;
};

/** Puncak sudut per sesi untuk satu gerakan, urut waktu. Target diambil dari sesi itu (target bisa berubah). */
export function seriProgres(sesi: readonly BarisSesiTerapis[], kode: KodeGerakan): TitikProgres[] {
  return urutMulai(sesi).flatMap((s) => {
    const g = (s.sesi_gerakan ?? []).find((x) => x.kode_gerakan === kode);
    if (!g) return [];
    return [
      {
        tanggal: tanggalWib(s.mulai),
        puncak: g.puncak_maks == null ? null : bulat(Number(g.puncak_maks)),
        target: g.target_sudut,
        nyeri: s.dihentikan_nyeri,
      },
    ];
  });
}

export type RingkasSeri = {
  jumlahSesi: number;
  awal: number | null;
  akhir: number | null;
  terbaik: number | null;
  /** Target pada sesi terakhir. */
  target: number | null;
  sesiCapaiTarget: number;
};

/** Angka singkat di atas grafik, juga sebagai teks alternatif grafik untuk pembaca layar. */
export function ringkasSeri(titik: readonly TitikProgres[]): RingkasSeri {
  const ada = titik.filter((t): t is TitikProgres & { puncak: number } => t.puncak != null);
  return {
    jumlahSesi: titik.length,
    awal: ada[0]?.puncak ?? null,
    akhir: ada.at(-1)?.puncak ?? null,
    terbaik: ada.length ? Math.max(...ada.map((t) => t.puncak)) : null,
    target: titik.at(-1)?.target ?? null,
    sesiCapaiTarget: ada.filter((t) => t.puncak >= t.target).length,
  };
}

/** Gerakan yang punya data, urut sesuai KODE_GERAKAN. */
export function gerakanTercatat(sesi: readonly BarisSesiTerapis[]): KodeGerakan[] {
  const ada = new Set(sesi.flatMap((s) => (s.sesi_gerakan ?? []).map((g) => g.kode_gerakan)));
  return KODE_GERAKAN.filter((k) => ada.has(k));
}

// ---------- Kepatuhan ----------

export type HariKepatuhan = { tanggal: string; jumlahSesi: number; nyeri: boolean };
export type Kepatuhan = {
  hari: HariKepatuhan[];
  /** Jumlah sesi per blok 7 hari, dari yang terlama; blok terakhir berakhir hari ini. */
  perMinggu: { mulai: string; selesai: string; jumlahSesi: number; hariLatihan: number }[];
  hariLatihan: number;
};

export function kepatuhanHarian(
  sesi: readonly Pick<BarisSesiTerapis, "mulai" | "dihentikan_nyeri">[],
  sekarang: Date,
  jumlahHari = 28,
): Kepatuhan {
  const hariIni = Date.parse(tanggalWib(sekarang));
  const hari: HariKepatuhan[] = Array.from({ length: jumlahHari }, (_, i) => ({
    tanggal: new Date(hariIni - (jumlahHari - 1 - i) * HARI_MS).toISOString().slice(0, 10),
    jumlahSesi: 0,
    nyeri: false,
  }));
  const indeks = new Map(hari.map((h, i) => [h.tanggal, i]));
  for (const s of sesi) {
    const i = indeks.get(tanggalWib(s.mulai));
    if (i == null) continue;
    hari[i].jumlahSesi += 1;
    hari[i].nyeri ||= s.dihentikan_nyeri;
  }

  const perMinggu: Kepatuhan["perMinggu"] = [];
  for (let akhir = hari.length; akhir > 0; akhir -= 7) {
    const blok = hari.slice(Math.max(0, akhir - 7), akhir);
    perMinggu.unshift({
      mulai: blok[0].tanggal,
      selesai: blok[blok.length - 1].tanggal,
      jumlahSesi: blok.reduce((n, h) => n + h.jumlahSesi, 0),
      hariLatihan: blok.filter((h) => h.jumlahSesi > 0).length,
    });
  }
  return { hari, perMinggu, hariLatihan: hari.filter((h) => h.jumlahSesi > 0).length };
}

// ---------- Status pasien ----------

export type StatusPasien = "nyeri" | "nonaktif" | "belum_mulai" | "tidak_latihan" | "baik";

/** Urutan penekanan: yang paling perlu ditinjau terapis lebih dulu. */
export const URUTAN_STATUS: Record<StatusPasien, number> = { nyeri: 0, tidak_latihan: 1, belum_mulai: 2, baik: 3, nonaktif: 4 };

export const LABEL_STATUS: Record<StatusPasien, string> = {
  nyeri: "Laporan nyeri",
  nonaktif: "Link nonaktif",
  // Bukan "belum mulai": pasien yang sesi terakhirnya di luar jendela data juga masuk ke sini.
  belum_mulai: "Belum ada sesi",
  tidak_latihan: "Jeda latihan",
  baik: "Rutin",
};

export function statusPasien(args: {
  aktif: boolean;
  nyeriTerbuka: number;
  terakhirSesi: string | null;
  sekarang: Date;
}): StatusPasien {
  if (args.nyeriTerbuka > 0) return "nyeri";
  if (!args.aktif) return "nonaktif";
  if (!args.terakhirSesi) return "belum_mulai";
  if (selisihHari(args.terakhirSesi, args.sekarang) >= HARI_TANPA_LATIHAN) return "tidak_latihan";
  return "baik";
}

// ---------- Daftar pasien di dashboard ----------

export type SorotanGerakan = { kode: KodeGerakan; nama: string; puncak: number | null; target: number };

export type BarisDaftar = {
  id: string;
  nama: string;
  sisi: string;
  aktif: boolean;
  isDemo: boolean;
  status: StatusPasien;
  sesi7Hari: number;
  terakhirSesi: string | null;
  nyeriTerbuka: number;
  /** Gerakan dengan capaian terendah terhadap target pada sesi terakhir yang berisi data gerakan. */
  sorotan: SorotanGerakan | null;
  /** Puncak sudut gerakan sorotan pada sesi-sesi terakhir (untuk sparkline), urut waktu. */
  tren: number[];
};

/** Dari sesi terbaru yang punya data gerakan (sesi yang langsung dihentikan bisa kosong). */
function sorotanDari(sesiUrut: readonly BarisSesiTerapis[]): SorotanGerakan | null {
  const daftar =
    [...sesiUrut]
      .reverse()
      .map((s) => (s.sesi_gerakan ?? []).filter((g) => isKodeGerakan(g.kode_gerakan)))
      .find((d) => d.length > 0) ?? [];
  if (!daftar.length) return null;
  const rasio = (g: BarisGerakanSesi) => (g.puncak_maks == null ? -1 : Number(g.puncak_maks) / g.target_sudut);
  const g = [...daftar].sort((a, b) => rasio(a) - rasio(b))[0];
  const kode = g.kode_gerakan as KodeGerakan;
  return {
    kode,
    nama: GERAKAN[kode].nama,
    puncak: g.puncak_maks == null ? null : bulat(Number(g.puncak_maks)),
    target: g.target_sudut,
  };
}

export function barisDaftarPasien(args: {
  pasien: readonly BarisPasien[];
  sesi: readonly BarisSesiTerapis[];
  nyeriTerbuka: readonly { pasien_id: string }[];
  sekarang: Date;
}): BarisDaftar[] {
  const sesiPer = new Map<string, BarisSesiTerapis[]>();
  for (const s of urutMulai(args.sesi)) sesiPer.set(s.pasien_id, [...(sesiPer.get(s.pasien_id) ?? []), s]);
  const nyeriPer = new Map<string, number>();
  for (const k of args.nyeriTerbuka) nyeriPer.set(k.pasien_id, (nyeriPer.get(k.pasien_id) ?? 0) + 1);

  return args.pasien
    .map((p): BarisDaftar => {
      const milik = sesiPer.get(p.id) ?? [];
      const terakhir = milik.at(-1);
      const nyeri = nyeriPer.get(p.id) ?? 0;
      const sorot = sorotanDari(milik);
      return {
        id: p.id,
        nama: p.nama_tampilan,
        sisi: p.sisi_dilatih,
        aktif: p.aktif,
        isDemo: p.is_demo,
        status: statusPasien({ aktif: p.aktif, nyeriTerbuka: nyeri, terakhirSesi: terakhir?.mulai ?? null, sekarang: args.sekarang }),
        sesi7Hari: milik.filter((s) => selisihHari(s.mulai, args.sekarang) < 7).length,
        terakhirSesi: terakhir?.mulai ?? null,
        nyeriTerbuka: nyeri,
        sorotan: sorot,
        tren: sorot ? seriSparkline(milik, sorot.kode) : [],
      };
    })
    .sort((a, b) => URUTAN_STATUS[a.status] - URUTAN_STATUS[b.status] || a.nama.localeCompare(b.nama, "id"));
}

/** Angka ringkas di atas dashboard. Kepatuhan = hari berlatih ÷ 7 hari, rata-rata pasien dengan link aktif. */
export function angkaDashboard(baris: readonly BarisDaftar[], sesi: readonly BarisSesiTerapis[], sekarang: Date) {
  const aktif = baris.filter((b) => b.aktif);
  const idAktif = new Set(aktif.map((b) => b.id));
  const hariUnik = new Set(
    sesi
      .filter((s) => idAktif.has(s.pasien_id) && selisihHari(s.mulai, sekarang) < 7)
      .map((s) => `${s.pasien_id}|${tanggalWib(s.mulai)}`),
  );
  return {
    pasienAktif: aktif.length,
    sesi7Hari: baris.reduce((n, b) => n + b.sesi7Hari, 0),
    persenKepatuhan: aktif.length ? Math.round((hariUnik.size / (aktif.length * 7)) * 100) : null,
    perluTindakLanjut: baris.filter((b) => b.status === "nyeri" || b.status === "tidak_latihan").length,
  };
}

// ---------- Laporan nyeri ----------

type BarisNyeri = { id: string; terjadi_pada: string; ditindaklanjuti: boolean };

/**
 * Gabungan laporan nyeri untuk halaman detail: SEMUA yang belum ditindaklanjuti (tidak pernah dipotong)
 * di atas, lalu riwayat yang sudah ditindaklanjuti. Masing-masing terbaru dulu, tanpa duplikat.
 */
export function gabungNyeri<T extends BarisNyeri>(terbuka: readonly T[], riwayat: readonly T[]): T[] {
  const terbaru = (a: T, b: T) => b.terjadi_pada.localeCompare(a.terjadi_pada);
  const buka = terbuka.filter((k) => !k.ditindaklanjuti).sort(terbaru);
  const idBuka = new Set(buka.map((k) => k.id));
  const lain = riwayat.filter((k) => k.ditindaklanjuti && !idBuka.has(k.id)).sort(terbaru);
  return [...buka, ...lain];
}

// ---------- Ringkasan AI ----------

/** Alasan ringkasan tersimpan sudah tertinggal data terbaru (laporan nyeri diutamakan), atau null. */
export function ringkasanUsang(args: {
  dibuat: string;
  nyeriTerbuka: readonly { terjadi_pada: string }[];
  sesiTerakhir: string | null;
}): "nyeri" | "sesi" | null {
  const dibuat = Date.parse(args.dibuat);
  if (args.nyeriTerbuka.some((k) => Date.parse(k.terjadi_pada) > dibuat)) return "nyeri";
  if (args.sesiTerakhir && Date.parse(args.sesiTerakhir) > dibuat) return "sesi";
  return null;
}

// ---------- Sparkline ----------

/** Puncak sudut satu gerakan pada `n` sesi terakhir (urut waktu), tanpa sesi yang puncaknya kosong. */
export function seriSparkline(sesi: readonly BarisSesiTerapis[], kode: KodeGerakan, n = 8): number[] {
  return seriProgres(sesi, kode)
    .flatMap((t) => (t.puncak == null ? [] : [t.puncak]))
    .slice(-n);
}

/**
 * Jalur SVG sparkline dalam kotak lebar×tinggi (dengan bantalan agar ujung garis tidak terpotong).
 * Rentang sumbu Y mengikuti data (minimal 10° agar data datar tidak terlihat berfluktuasi). null bila < 2 titik.
 */
export function jalurSparkline(nilai: readonly number[], lebar: number, tinggi: number, bantal = 2): string | null {
  if (nilai.length < 2) return null;
  const min = Math.min(...nilai);
  const rentang = Math.max(10, Math.max(...nilai) - min);
  const bawah = (Math.max(...nilai) + min) / 2 - rentang / 2;
  const x = (i: number) => bantal + (i / (nilai.length - 1)) * (lebar - 2 * bantal);
  const y = (v: number) => tinggi - bantal - ((v - bawah) / rentang) * (tinggi - 2 * bantal);
  return nilai.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
}

// ---------- Aktivitas terbaru ----------

export type Aktivitas = {
  id: string;
  pasienId: string;
  nama: string;
  mulai: string;
  repetisi: number;
  repetisiTarget: number;
  capaiTarget: number;
  nyeri: boolean;
};

export function aktivitasTerbaru(
  sesi: readonly BarisSesiTerapis[],
  namaPasien: ReadonlyMap<string, string>,
  batas = 6,
): Aktivitas[] {
  return urutMulai(sesi)
    .reverse()
    .slice(0, batas)
    .map((s) => {
      const g = s.sesi_gerakan ?? [];
      return {
        id: s.id,
        pasienId: s.pasien_id,
        nama: namaPasien.get(s.pasien_id) ?? "Pasien",
        mulai: s.mulai,
        repetisi: g.reduce((n, x) => n + x.repetisi_selesai, 0),
        repetisiTarget: g.reduce((n, x) => n + x.repetisi_target, 0),
        capaiTarget: g.reduce((n, x) => n + x.rep_capai_target, 0),
        nyeri: s.dihentikan_nyeri,
      };
    });
}

// ---------- Link pasien ----------

export const tautanPasien = (origin: string, token: string) => `${origin.replace(/\/+$/, "")}/mulai/${encodeURIComponent(token)}`;

/** Pesan WhatsApp: hanya cara membuka link, tanpa saran medis. */
export function tautanWhatsApp(nama: string, url: string): string {
  const teks =
    `Halo ${nama}, ini link latihan GerakPulih dari fisioterapis Anda:\n${url}\n\n` +
    "Buka lewat Chrome. Link ini pribadi, mohon tidak dibagikan ke orang lain.";
  return `https://wa.me/?text=${encodeURIComponent(teks)}`;
}

// ---------- Format tampilan ----------

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "12 Nov" dari "YYYY-MM-DD". */
export function labelTanggal(tanggal: string): string {
  const [, b, h] = tanggal.split("-").map(Number);
  return `${h} ${BULAN[b - 1]}`;
}

/** "hari ini", "kemarin", "3 hari lalu", atau tanggal. */
export function labelRelatif(waktu: string, sekarang: Date): string {
  const d = selisihHari(waktu, sekarang);
  if (d <= 0) return "hari ini";
  if (d === 1) return "kemarin";
  if (d < 7) return `${d} hari lalu`;
  return labelTanggal(tanggalWib(waktu));
}

/** Jam WIB "09.12". */
export function jamWib(waktu: string): string {
  return new Date(Date.parse(waktu) + WIB_MS).toISOString().slice(11, 16).replace(":", ".");
}
