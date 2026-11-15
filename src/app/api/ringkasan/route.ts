import { NextResponse } from "next/server";
import { z } from "zod";
import { bangunInput } from "@/lib/ai/agregat";
import { buatRingkasan } from "@/lib/ai/gemini";
import { hashInput } from "@/lib/ai/hash";
import { VERSI_PROMPT } from "@/lib/ai/prompts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Catatan: jangan tambahkan `export const runtime` — tidak kompatibel dengan cacheComponents
// (Node.js sudah default). maxDuration tetap boleh.
export const maxDuration = 30;

const Body = z.object({
  pasienId: z.string().uuid(),
  periodeHari: z.number().int().min(7).max(60).default(14),
});

const tanggal = (d: Date) => d.toISOString().slice(0, 10);

/**
 * POST /api/ringkasan  { pasienId, periodeHari? }
 * Dipanggil dari dashboard terapis. Alur:
 *   1. pastikan terapis login & pasien miliknya (RLS)
 *   2. ambil data → ubah jadi angka agregat anonim
 *   3. data sama dengan sebelumnya? pakai ulang ringkasan tersimpan (hemat kuota)
 *   4. panggil Gemini; gagal → template. Simpan hanya hasil AI.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  const { pasienId, periodeHari } = body.data;

  // RLS: hanya mengembalikan baris bila pasien milik terapis ini
  const { data: pasien } = await supabase.from("pasien").select("id").eq("id", pasienId).maybeSingle();
  if (!pasien) return NextResponse.json({ error: "Pasien tidak ditemukan." }, { status: 404 });

  const selesai = new Date();
  const mulai = new Date(selesai.getTime() - periodeHari * 86_400_000);

  const [program, sesi, kejadian] = await Promise.all([
    supabase.from("program_gerakan").select("kode_gerakan, target_sudut, aktif").eq("pasien_id", pasienId),
    supabase
      .from("sesi")
      .select("mulai, sesi_gerakan(kode_gerakan, repetisi_selesai, rep_kompensasi, puncak_maks)")
      .eq("pasien_id", pasienId)
      .gte("mulai", mulai.toISOString())
      .order("mulai"),
    supabase
      .from("kejadian")
      .select("jenis, kode_gerakan, sudut, repetisi_ke")
      .eq("pasien_id", pasienId)
      .gte("terjadi_pada", mulai.toISOString()),
  ]);
  if (program.error || sesi.error || kejadian.error) {
    return NextResponse.json({ error: "Gagal mengambil data pasien." }, { status: 500 });
  }

  const input = bangunInput({
    program: program.data ?? [],
    sesi: sesi.data ?? [],
    kejadian: kejadian.data ?? [],
    periodeHari,
  });
  const hash = hashInput(input, VERSI_PROMPT);

  const { data: tersimpan } = await supabase
    .from("ringkasan_ai")
    .select("isi, sumber, model, dibuat")
    .eq("pasien_id", pasienId)
    .eq("hash_input", hash)
    .maybeSingle();
  if (tersimpan) return NextResponse.json({ ...tersimpan, dipakaiUlang: true });

  const hasil = await buatRingkasan(input);
  if (hasil.alasanFallback) console.warn(`[ringkasan] memakai template: ${hasil.alasanFallback}`);

  if (hasil.sumber === "ai") {
    const admin = createAdminClient();
    const { error } = await admin.from("ringkasan_ai").upsert(
      {
        pasien_id: pasienId,
        periode_mulai: tanggal(mulai),
        periode_selesai: tanggal(selesai),
        isi: hasil.isi,
        sumber: hasil.sumber,
        model: hasil.model,
        hash_input: hash,
      },
      { onConflict: "pasien_id,hash_input" },
    );
    if (error) console.error("[ringkasan] gagal menyimpan:", error.message);
  }

  return NextResponse.json({
    isi: hasil.isi,
    sumber: hasil.sumber,
    model: hasil.model,
    dibuat: new Date().toISOString(),
    dipakaiUlang: false,
  });
}
