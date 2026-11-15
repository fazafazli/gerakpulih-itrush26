import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Uji route POST /api/sesi dengan database tiruan di memori.
 * Memastikan: pasien_id dari cookie, idempoten, rollback bila gagal, dan validasi.
 */

type Baris = Record<string, unknown>;
const db: Record<string, Baris[]> = {};
let gagalInsert: string | null = null;
let pasienAktif: { id: string; nama_tampilan: string; sisi_dilatih: "kanan"; is_demo: boolean } | null = null;

function tabel(nama: string) {
  db[nama] ??= [];
  const filter: ((b: Baris) => boolean)[] = [];
  let mode: "select" | "delete" | "update" = "select";
  let perubahan: Baris = {};
  let hitung = false;
  const cocok = () => db[nama].filter((b) => filter.every((f) => f(b)));
  const q = {
    select(_k?: string, opsi?: { count?: string; head?: boolean }) {
      hitung = Boolean(opsi?.head);
      return q;
    },
    eq(k: string, v: unknown) {
      filter.push((b) => b[k] === v);
      return q;
    },
    gte(k: string, v: string) {
      filter.push((b) => String(b[k]) >= v);
      return q;
    },
    async maybeSingle() {
      return { data: cocok()[0] ?? null, error: null };
    },
    insert(isi: Baris | Baris[]) {
      if (gagalInsert === nama) return Promise.resolve({ error: { code: "XX000", message: "gagal" } });
      const daftar = Array.isArray(isi) ? isi : [isi];
      if (nama === "sesi" && daftar.some((d) => db.sesi.some((s) => s.id === d.id))) {
        return Promise.resolve({ error: { code: "23505", message: "duplikat" } });
      }
      db[nama].push(...daftar.map((d) => ({ dibuat: new Date().toISOString(), ...d })));
      return Promise.resolve({ error: null });
    },
    delete() {
      mode = "delete";
      return q;
    },
    update(p: Baris) {
      mode = "update";
      perubahan = p;
      return q;
    },
    then(selesai: (h: unknown) => void) {
      const c = cocok();
      if (mode === "delete") {
        db[nama] = db[nama].filter((b) => !c.includes(b));
        if (nama === "sesi") for (const anak of ["sesi_gerakan", "kejadian"]) db[anak] = (db[anak] ?? []).filter((b) => !c.some((s) => s.id === b.sesi_id));
      }
      if (mode === "update") c.forEach((b) => Object.assign(b, perubahan));
      selesai(hitung ? { count: c.length, error: null } : { data: c, error: null });
    },
  };
  return q;
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: tabel }) }));
vi.mock("@/lib/pasien/sesi", () => ({ getPasienSaatIni: async () => pasienAktif }));

const { POST } = await import("@/app/api/sesi/route");

const PASIEN = "11111111-2222-4333-8444-555555555555";
const ID = "6f1c2b9e-3a4d-4c5e-9f00-1a2b3c4d5e6f";

const body = (o: Record<string, unknown> = {}) => {
  const kini = Date.now();
  return {
    id: ID,
    mulai: new Date(kini - 8 * 60_000).toISOString(),
    selesai: new Date(kini - 60_000).toISOString(),
    dihentikan_nyeri: false,
    info_teknis: { model: "full", delegasi: "GPU", fps_rata: 20, turun_model: 0, userAgent: "jangan-disimpan" },
    gerakan: [
      { kode_gerakan: "angkat_samping", repetisi_selesai: 10, rep_capai_target: 8, rep_kompensasi: 1, puncak_maks: 99, puncak_rata: 92, target_sudut: 5 },
    ],
    kejadian: [],
    pasien_id: "pasien-lain",
    ...o,
  };
};

const kirim = (isi: unknown) => POST(new Request("http://x/api/sesi", { method: "POST", body: typeof isi === "string" ? isi : JSON.stringify(isi) }));

beforeEach(() => {
  for (const k of Object.keys(db)) delete db[k];
  db.pasien = [{ id: PASIEN, terakhir_aktif: null }];
  db.program_gerakan = [{ pasien_id: PASIEN, kode_gerakan: "angkat_samping", target_sudut: 90, repetisi: 10 }];
  gagalInsert = null;
  pasienAktif = { id: PASIEN, nama_tampilan: "Pak Budi", sisi_dilatih: "kanan", is_demo: true };
});

describe("POST /api/sesi", () => {
  it("401 tanpa cookie pasien yang sah", async () => {
    pasienAktif = null;
    expect((await kirim(body())).status).toBe(401);
  });

  it("400 untuk JSON rusak atau tidak valid", async () => {
    expect((await kirim("{rusak")).status).toBe(400);
    expect((await kirim({ ...body(), id: "bukan-uuid" })).status).toBe(400);
  });

  it("201: menyimpan dengan pasien_id dari cookie & target dari program, membuang field asing", async () => {
    const res = await kirim(body());
    expect(res.status).toBe(201);
    expect(db.sesi[0]).toMatchObject({ id: ID, pasien_id: PASIEN });
    expect(db.sesi[0].info_teknis).not.toHaveProperty("userAgent");
    expect(db.sesi_gerakan[0]).toMatchObject({ sesi_id: ID, target_sudut: 90, repetisi_target: 10 });
    expect(db.pasien[0].terakhir_aktif).not.toBeNull();
  });

  it("idempoten: kiriman ulang tidak membuat sesi ganda", async () => {
    await kirim(body());
    const res = await kirim(body());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ duplikat: true });
    expect(db.sesi).toHaveLength(1);
    expect(db.sesi_gerakan).toHaveLength(1);
  });

  it("409 bila id sesi milik pasien lain", async () => {
    db.sesi = [{ id: ID, pasien_id: "99999999-2222-4333-8444-555555555555" }];
    expect((await kirim(body())).status).toBe(409);
  });

  it("422 untuk gerakan di luar program", async () => {
    const b = body({ gerakan: [{ kode_gerakan: "tekuk_siku", repetisi_selesai: 3, rep_capai_target: 0, rep_kompensasi: 0, puncak_maks: 50, puncak_rata: 40 }] });
    expect((await kirim(b)).status).toBe(422);
    expect(db.sesi).toHaveLength(0);
  });

  it("rollback: bila simpan detail gagal, sesi ikut dihapus agar bisa dikirim ulang utuh", async () => {
    gagalInsert = "sesi_gerakan";
    expect((await kirim(body())).status).toBe(500);
    expect(db.sesi).toHaveLength(0);
    gagalInsert = null;
    expect((await kirim(body())).status).toBe(201);
  });

  it("menyimpan kejadian nyeri & menandai sesi", async () => {
    const terjadi = new Date(Date.now() - 2 * 60_000).toISOString();
    const res = await kirim(body({ kejadian: [{ jenis: "stop_nyeri", kode_gerakan: "angkat_samping", repetisi_ke: 4, sudut: 82, terjadi_pada: terjadi }] }));
    expect(res.status).toBe(201);
    expect(db.sesi[0].dihentikan_nyeri).toBe(true);
    expect(db.kejadian[0]).toMatchObject({ pasien_id: PASIEN, jenis: "stop_nyeri" });
  });

  it("429 bila sesi hari ini sudah terlalu banyak", async () => {
    db.sesi = Array.from({ length: 20 }, (_, i) => ({ id: `s${i}`, pasien_id: PASIEN, dibuat: new Date().toISOString() }));
    expect((await kirim(body())).status).toBe(429);
  });
});
