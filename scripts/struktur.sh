#!/usr/bin/env bash
set -e

dirs=(
  .github/workflows
  docs/uji-teknis
  public/contoh-gerakan public/ikon
  supabase/migrations
  tests/pose
  "src/app/mulai/[kode]"
  "src/app/(pasien)/beranda" "src/app/(pasien)/privasi" "src/app/(pasien)/sesi" "src/app/(pasien)/selesai"
  "src/app/(terapis)/masuk" "src/app/(terapis)/dashboard"
  "src/app/(terapis)/pasien/baru" "src/app/(terapis)/pasien/[id]/program"
  src/app/api/sesi src/app/api/ringkasan src/app/api/keepalive
  src/components/shared src/components/pasien src/components/terapis
  src/hooks
  src/lib/pose src/lib/supabase src/lib/ai src/lib/validators
)

for d in "${dirs[@]}"; do
  mkdir -p "$d"
  [ -z "$(ls -A "$d")" ] && touch "$d/.gitkeep"
done

echo "Struktur selesai dibuat."