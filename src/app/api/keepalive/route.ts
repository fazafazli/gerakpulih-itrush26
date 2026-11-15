import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const rahasia = process.env.KEEPALIVE_SECRET ?? "";
  const diterima = request.headers.get("x-keepalive-secret") ?? "";
  const cocok = rahasia.length > 0 && diterima.length === rahasia.length && timingSafeEqual(Buffer.from(diterima), Buffer.from(rahasia));
  if (!cocok) return NextResponse.json({ ok: false }, { status: 401 });

  const { error } = await createAdminClient().from("terapis").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: !error, waktu: new Date().toISOString() }, { status: error ? 500 : 200 });
}
