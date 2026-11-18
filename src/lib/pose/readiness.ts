import type { DefinisiGerakan } from "./exercises";
import { keyakinan, LM, sendiSisi, type Landmark, type Sisi } from "./landmarks";
import { AMBANG_KEYAKINAN } from "./metrics";

export type StatistikGambar = {
  /** Rata-rata luminans 0–255. */
  kecerahan: number;
  /** Varians Laplacian — rendah = buram/lensa kotor. */
  ketajaman: number;
  /** Rata-rata luminans area badan (bahu–pinggul). NaN bila tak terukur. */
  kecerahanTubuh: number;
};

/**
 * Statistik dari gambar kecil (mis. 160×120 RGBA dari canvas).
 * Fungsi murni: bisa diuji tanpa kamera.
 */
export function hitungStatistikGambar(
  rgba: Uint8ClampedArray,
  lebar: number,
  tinggi: number,
  landmark?: readonly Landmark[] | null,
): StatistikGambar {
  const n = lebar * tinggi;
  const g = new Float32Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    g[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
    total += g[i];
  }

  let jumlah = 0;
  let kuadrat = 0;
  let c = 0;
  for (let y = 1; y < tinggi - 1; y++) {
    for (let x = 1; x < lebar - 1; x++) {
      const i = y * lebar + x;
      const v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - lebar] - g[i + lebar];
      jumlah += v;
      kuadrat += v * v;
      c++;
    }
  }
  const ketajaman = c ? kuadrat / c - (jumlah / c) ** 2 : 0;

  let kecerahanTubuh = Number.NaN;
  if (landmark) {
    const titik = [LM.BAHU_KIRI, LM.BAHU_KANAN, LM.PINGGUL_KIRI, LM.PINGGUL_KANAN].filter((i) => keyakinan(landmark[i]) > 0.3);
    if (titik.length >= 2) {
      const xs = titik.map((i) => landmark[i].x);
      const ys = titik.map((i) => landmark[i].y);
      const x0 = Math.max(0, Math.floor(Math.min(...xs) * lebar));
      const x1 = Math.min(lebar - 1, Math.ceil(Math.max(...xs) * lebar));
      const y0 = Math.max(0, Math.floor(Math.min(...ys) * tinggi));
      const y1 = Math.min(tinggi - 1, Math.ceil(Math.max(...ys) * tinggi));
      let s = 0;
      let k = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        s += g[y * lebar + x];
        k++;
      }
      if (k > 20) kecerahanTubuh = s / k;
    }
  }
  return { kecerahan: total / n, ketajaman, kecerahanTubuh };
}

/** Kemiringan HP (derajat) dari DeviceOrientation, memperhitungkan potret/lanskap. */
export function kemiringanHp(beta: number, gamma: number, sudutLayar: number): number {
  return Math.abs(Math.abs(sudutLayar) % 180 === 0 ? gamma : beta);
}

export type KodeKesiapan = "orang" | "cahaya" | "membelakangi_cahaya" | "bingkai" | "jarak" | "hp_tegak" | "ketajaman" | "pinggul" | "banyak_orang";

export type ItemKesiapan = {
  kode: KodeKesiapan;
  status: "lolos" | "gagal" | "info";
  /** Kalimat singkat untuk pasien (juga dibacakan). */
  pesan: string;
};

/** Ambang awal hasil uji teknis; sesuaikan bila perlu. */
export const AMBANG_KESIAPAN = {
  kecerahanMin: 60,
  kecerahanMaks: 215,
  /**
   * Backlight: tubuh jauh lebih gelap dari rata-rata gambar. Dilonggarkan dari 0.65 → 0.5
   * (uji lapangan: 0.65 sering salah deteksi pada baju gelap / dinding putih).
   */
  rasioTubuhMinimal: 0.5,
  /** Backlight hanya dinilai bila gambar memang terang (ada sumber cahaya kuat). */
  kecerahanBacklightMin: 110,
  ketajamanMin: 25,
  lebarBahuMin: 0.12,
  lebarBahuMaks: 0.45,
  hpMiringMaks: 8,
  tepi: 0.02,
} as const;

/** Urutan prioritas: hanya SATU instruksi ditampilkan pada satu waktu. */
const PRIORITAS: KodeKesiapan[] = ["orang", "cahaya", "membelakangi_cahaya", "bingkai", "jarak", "hp_tegak", "ketajaman"];

export function nilaiKesiapan(args: {
  statistik?: StatistikGambar | null;
  landmark?: readonly Landmark[] | null;
  jumlahOrang: number;
  kemiringanHp?: number | null;
  gerakan: DefinisiGerakan;
  sisi: Sisi;
}): { siap: boolean; item: ItemKesiapan[]; instruksiUtama: ItemKesiapan | null } {
  const { statistik, landmark, jumlahOrang, gerakan, sisi } = args;
  const A = AMBANG_KESIAPAN;
  const item: ItemKesiapan[] = [];
  const tambah = (kode: KodeKesiapan, lolos: boolean, pesanLolos: string, pesanGagal: string) =>
    item.push({ kode, status: lolos ? "lolos" : "gagal", pesan: lolos ? pesanLolos : pesanGagal });

  if (statistik) {
    tambah(
      "cahaya",
      statistik.kecerahan >= A.kecerahanMin && statistik.kecerahan <= A.kecerahanMaks,
      "Cahaya cukup",
      statistik.kecerahan < A.kecerahanMin ? "Ruangan terlalu gelap, nyalakan lampu" : "Terlalu silau, kurangi cahaya",
    );
    tambah("ketajaman", statistik.ketajaman >= A.ketajamanMin, "Gambar jelas", "Gambar buram, bersihkan lensa kamera");
  }

  if (!landmark) {
    tambah("orang", false, "", "Duduk di depan kamera");
  } else {
    const s = sendiSisi(sisi);
    const wajib = [LM.HIDUNG, LM.BAHU_KIRI, LM.BAHU_KANAN, s.siku, s.pergelangan];
    const utuh = wajib.every((i) => {
      const p = landmark[i];
      return p && p.x > A.tepi && p.x < 1 - A.tepi && p.y > A.tepi && p.y < 1 - A.tepi && keyakinan(p) >= AMBANG_KEYAKINAN;
    });
    tambah("bingkai", utuh, "Kepala dan lengan terlihat", "Mundur sedikit sampai kepala dan tangan terlihat");

    // Jarak dinilai dari lebar bahu relatif bingkai → tidak bergantung FOV kamera.
    const lebarBahu = Math.abs(landmark[LM.BAHU_KIRI].x - landmark[LM.BAHU_KANAN].x);
    tambah(
      "jarak",
      lebarBahu >= A.lebarBahuMin && lebarBahu <= A.lebarBahuMaks,
      "Jarak sudah pas",
      lebarBahu < A.lebarBahuMin ? "Maju sedikit mendekat" : "Mundur sedikit",
    );

    const pinggul = Math.min(keyakinan(landmark[LM.PINGGUL_KIRI]), keyakinan(landmark[LM.PINGGUL_KANAN]));
    if (gerakan.sendi === "bahu" && pinggul < AMBANG_KEYAKINAN) {
      item.push({ kode: "pinggul", status: "info", pesan: "Pinggul kurang terlihat, pengukuran tetap berjalan" });
    }
    if (jumlahOrang > 1) item.push({ kode: "banyak_orang", status: "info", pesan: "Ada orang lain di kamera, pasien tetap dikunci" });
  }

  // Backlight hanya MENGHALANGI bila memang merusak deteksi (lengan/kepala tidak terbaca).
  // Bila pose tetap terbaca jelas, cukup saran "info" — tidak menunda latihan (mengurangi false positive).
  if (statistik && !Number.isNaN(statistik.kecerahanTubuh)) {
    const membelakangi =
      statistik.kecerahan >= A.kecerahanBacklightMin && statistik.kecerahanTubuh / statistik.kecerahan < A.rasioTubuhMinimal;
    const poseTerbaca = item.some((i) => i.kode === "bingkai" && i.status === "lolos");
    if (membelakangi) {
      item.push(
        poseTerbaca
          ? { kode: "membelakangi_cahaya", status: "info", pesan: "Cahaya dari belakang, tapi gerakan tetap terbaca" }
          : { kode: "membelakangi_cahaya", status: "gagal", pesan: "Jangan membelakangi jendela atau lampu" },
      );
    }
  }

  if (args.kemiringanHp != null) {
    tambah("hp_tegak", args.kemiringanHp <= A.hpMiringMaks, "HP sudah tegak", "Luruskan posisi HP");
  }

  const gagal = item.filter((i) => i.status === "gagal");
  const instruksiUtama = PRIORITAS.map((k) => gagal.find((g) => g.kode === k)).find(Boolean) ?? null;
  return { siap: gagal.length === 0, item, instruksiUtama };
}
