-- GerakPulih - bukti persetujuan privasi pasien (UU PDP: data kesehatan = data pribadi spesifik).
-- Diisi server (admin client) setelah cookie pasien diverifikasi, saat pasien menekan "Saya setuju".
-- Terapis hanya bisa MEMBACA; tidak ada grant insert/update untuk kolom ini dari klien.

alter table public.pasien
  add column persetujuan_pada  timestamptz,
  add column persetujuan_versi text check (persetujuan_versi is null or persetujuan_versi ~ '^v[0-9]{1,4}$');

comment on column public.pasien.persetujuan_pada is 'Waktu pasien menyetujui halaman privasi (versi persetujuan_versi). Ditulis server, bukan klien.';

-- Grant kolom pasien untuk terapis bersifat per kolom (lihat migrasi awal), jadi kolom baru perlu ditambahkan eksplisit.
grant select (persetujuan_pada, persetujuan_versi) on public.pasien to authenticated;
