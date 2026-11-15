import { NextResponse } from "next/server";
import { getPasienSaatIni } from "@/lib/pasien/sesi";
import { isKodeGerakan } from "@/lib/pose/exercises";
import { olahSesi, type ProgramPasien } from "@/lib/sesi/olah";
import { SimpanSesiSchema } from "@/lib/sesi/schema";
import { createAdminClient } from "@/lib/supabase/admin";

/** Data sesi hanya berisi angka ringkasan; kiriman lebih besar dari ini pasti bukan dari aplikasi. */
const UKURAN_MAKS_BYTE = 16 * 1024;
/** Pengaman sederhana bila link pasien tersebar: batasi jumlah sesi per hari. */
const SESI_MAKS_PER_HARI = 20;

const jawab = (status: number, isi: Record<string, unknown>) =>
  NextResponse.json(isi, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Menyimpan hasil satu sesi latihan pasien.
 * pasien_id diambil dari cookie bertanda tangan (bukan dari body), lalu data diperiksa
 * terhadap program terapis sebelum ditulis dengan admin client.
 * Idempoten: id sesi dibuat perangkat, jadi pengiriman ulang tidak membuat sesi ganda.
 */
export async function POST(request: Request) {
  const pasien = await getPasienSaatIni();
  if (!pasien) return jawab(401, { pesan: "Link latihan tidak berlaku. Minta link baru ke terapis." });

  const teks = await request.text();
  if (teks.length > UKURAN_MAKS_BYTE) return jawab(413, { pesan: "Data sesi terlalu besar." });

  let json: unknown;
  try {
    json = JSON.parse(teks);
  } catch {
    return jawab(400, { pesan: "Data sesi tidak dapat dibaca." });
  }
  const parsed = SimpanSesiSchema.safeParse(json);
  if (!parsed.success) return jawab(400, { pesan: "Data sesi tidak lengkap atau tidak valid." });

  const db = createAdminClient();

  // Pengiriman ulang sesi yang sama → anggap berhasil (perangkat mungkin tidak menerima jawaban sebelumnya).
  const { data: ada, error: galatCek } = await db.from("sesi").select("pasien_id").eq("id", parsed.data.id).maybeSingle();
  if (galatCek) return jawab(500, { pesan: "Gagal menyimpan. Coba lagi sebentar." });
  if (ada) {
    return ada.pasien_id === pasien.id
      ? jawab(200, { id: parsed.data.id, duplikat: true })
      : jawab(409, { pesan: "Data sesi tidak valid." });
  }

  const sehariLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("sesi")
    .select("id", { count: "exact", head: true })
    .eq("pasien_id", pasien.id)
    .gte("dibuat", sehariLalu);
  if ((count ?? 0) >= SESI_MAKS_PER_HARI) {
    return jawab(429, { pesan: "Latihan hari ini sudah banyak sekali. Istirahat dulu, lanjutkan besok." });
  }

  // Semua program (termasuk yang baru dinonaktifkan) agar sesi tertunda tetap bisa disimpan.
  const { data: barisProgram, error: galatProgram } = await db
    .from("program_gerakan")
    .select("kode_gerakan, target_sudut, repetisi")
    .eq("pasien_id", pasien.id);
  if (galatProgram) return jawab(500, { pesan: "Gagal menyimpan. Coba lagi sebentar." });

  const program: ProgramPasien[] = (barisProgram ?? []).flatMap((p) =>
    isKodeGerakan(p.kode_gerakan) ? [{ kode_gerakan: p.kode_gerakan, target_sudut: p.target_sudut, repetisi: p.repetisi }] : [],
  );

  const hasil = olahSesi(parsed.data, pasien.id, program, new Date());
  if (!hasil.ok) return jawab(422, { pesan: hasil.pesan });

  const { error: galatSesi } = await db.from("sesi").insert(hasil.sesi);
  if (galatSesi) {
    // 23505 = id sudah ada (dua kiriman bersamaan). Kiriman lain sudah menyimpannya.
    if (galatSesi.code === "23505") return jawab(200, { id: hasil.sesi.id, duplikat: true });
    return jawab(500, { pesan: "Gagal menyimpan. Coba lagi sebentar." });
  }

  const [g, k] = await Promise.all([
    hasil.gerakan.length ? db.from("sesi_gerakan").insert(hasil.gerakan) : Promise.resolve({ error: null }),
    hasil.kejadian.length ? db.from("kejadian").insert(hasil.kejadian) : Promise.resolve({ error: null }),
  ]);
  if (g.error || k.error) {
    // Tanpa transaksi di PostgREST: hapus sesi (anak ikut terhapus via cascade) agar perangkat bisa mengirim ulang utuh.
    await db.from("sesi").delete().eq("id", hasil.sesi.id);
    return jawab(500, { pesan: "Gagal menyimpan. Coba lagi sebentar." });
  }

  await db.from("pasien").update({ terakhir_aktif: new Date().toISOString() }).eq("id", pasien.id);

  return jawab(201, { id: hasil.sesi.id });
}
