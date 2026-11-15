import type { SimpanSesi } from "./schema";

/**
 * Pengiriman hasil sesi dari perangkat pasien (browser).
 * Bila gagal (sinyal hilang), data disimpan di localStorage dan dikirim ulang saat halaman pasien dibuka lagi.
 * Aman diulang karena server memakai id sesi sebagai kunci idempoten.
 * Setiap antrean diberi id pasien agar HP yang dipakai bergantian tidak mengirim sesi ke pasien yang salah.
 */

const KUNCI_ANTREAN = "gp_sesi_tertunda";

export type HasilKirim = { status: "terkirim" } | { status: "tertunda"; pesan: string } | { status: "ditolak"; pesan: string };

const jeda = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function kirimSekali(data: SimpanSesi): Promise<{ ok: boolean; ulangi: boolean; pesan: string }> {
  try {
    const res = await fetch("/api/sesi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    });
    if (res.ok) return { ok: true, ulangi: false, pesan: "" };
    const isi = (await res.json().catch(() => null)) as { pesan?: string } | null;
    const pesan = isi?.pesan ?? "Gagal mengirim hasil latihan.";
    // 5xx & 429 bisa berhasil nanti; 4xx lain berarti datanya memang ditolak.
    return { ok: false, ulangi: res.status >= 500 || res.status === 429, pesan };
  } catch {
    return { ok: false, ulangi: true, pesan: "Tidak ada koneksi internet." };
  }
}

type EntriAntrean = { pid: string; data: SimpanSesi };

function bacaAntrean(): EntriAntrean[] {
  try {
    const isi = JSON.parse(localStorage.getItem(KUNCI_ANTREAN) ?? "[]") as unknown;
    return Array.isArray(isi) ? (isi as EntriAntrean[]).filter((e) => typeof e?.pid === "string" && e.data) : [];
  } catch {
    return [];
  }
}

function tulisAntrean(daftar: EntriAntrean[]): void {
  try {
    if (daftar.length) localStorage.setItem(KUNCI_ANTREAN, JSON.stringify(daftar.slice(-20)));
    else localStorage.removeItem(KUNCI_ANTREAN);
  } catch {
    // Mode privat / penyimpanan penuh: tidak fatal, pasien masih bisa menekan "Coba kirim lagi".
  }
}

function masukAntrean(pid: string, data: SimpanSesi): void {
  tulisAntrean([...bacaAntrean().filter((e) => e.data.id !== data.id), { pid, data }]);
}

function keluarAntrean(id: string): void {
  tulisAntrean(bacaAntrean().filter((e) => e.data.id !== id));
}

/** Kirim hasil sesi dengan 3 percobaan (jeda 1 s, 3 s). */
export async function kirimSesi(pid: string, data: SimpanSesi): Promise<HasilKirim> {
  masukAntrean(pid, data); // simpan dulu: bila tab ditutup di tengah pengiriman, data tidak hilang
  let pesan = "";
  for (const [i, tunggu] of [0, 1000, 3000].entries()) {
    if (tunggu) await jeda(tunggu);
    const h = await kirimSekali(data);
    if (h.ok) {
      keluarAntrean(data.id);
      return { status: "terkirim" };
    }
    pesan = h.pesan;
    if (!h.ulangi) {
      keluarAntrean(data.id);
      return { status: "ditolak", pesan };
    }
    if (i === 2) break;
  }
  return { status: "tertunda", pesan };
}

/** Kirim ulang sesi tertunda milik pasien ini. Mengembalikan jumlah yang berhasil. */
export async function kirimAntrean(pid: string): Promise<number> {
  let berhasil = 0;
  for (const { data } of bacaAntrean().filter((e) => e.pid === pid)) {
    const h = await kirimSekali(data);
    if (h.ok || !h.ulangi) keluarAntrean(data.id);
    if (h.ok) berhasil++;
  }
  return berhasil;
}

export const jumlahTertunda = (pid: string): number => bacaAntrean().filter((e) => e.pid === pid).length;
