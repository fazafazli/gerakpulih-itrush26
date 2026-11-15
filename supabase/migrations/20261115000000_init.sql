-- GerakPulih - skema awal
-- Prinsip:
-- 1. Minimisasi data: hanya nama tampilan + angka latihan (UU PDP).
-- 2. RLS di SEMUA tabel. Terapis hanya melihat pasiennya sendiri.
-- 3. Pasien TIDAK punya akun & TIDAK mengakses database langsung. Semua data pasien ditulis lewat API route server (secret key) setelah token pasien diverifikasi.

-- 1. TABEL
-- Terapis = pengguna Supabase Auth
create table public.terapis (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama        text not null check (char_length(nama) between 1 and 80),
  institusi   text check (char_length(institusi) <= 120),
  dibuat      timestamptz not null default now()
);
comment on table public.terapis is 'Profil fisioterapis; satu baris per akun auth.';

-- Pasien = TIDAK punya akun. Masuk via link berisi token acak.
create table public.pasien (
  id              uuid primary key default gen_random_uuid(),
  terapis_id      uuid not null references public.terapis (id) on delete cascade,
  nama_tampilan   text not null check (char_length(nama_tampilan) between 1 and 60),
  sisi_dilatih    text not null check (sisi_dilatih in ('kiri', 'kanan')),
  token_hash      text not null unique, 
  aktif           boolean not null default true,
  is_demo         boolean not null default false,
  catatan         text check (char_length(catatan) <= 280), 
  terakhir_aktif  timestamptz,
  dibuat          timestamptz not null default now()
);
comment on column public.pasien.token_hash is 'Hash SHA-256 (hex) dari token link pasien. Token asli hanya ditampilkan sekali ke terapis.';

-- Gerakan yang diresepkan terapis
create table public.program_gerakan (
  id            uuid primary key default gen_random_uuid(),
  pasien_id     uuid not null references public.pasien (id) on delete cascade,
  kode_gerakan  text not null check (kode_gerakan in ('angkat_samping', 'angkat_depan', 'tekuk_siku')),
  target_sudut  smallint not null check (target_sudut between 10 and 180),
  repetisi      smallint not null check (repetisi between 1 and 50),
  urutan        smallint not null default 1 check (urutan between 1 and 20),
  aktif         boolean not null default true,
  dibuat        timestamptz not null default now(),
  unique (pasien_id, kode_gerakan)
);

-- Satu sesi latihan
create table public.sesi (
  id                uuid primary key default gen_random_uuid(),
  pasien_id         uuid not null references public.pasien (id) on delete cascade,
  mulai             timestamptz not null,
  selesai           timestamptz,
  dihentikan_nyeri  boolean not null default false,
  info_teknis       jsonb not null default '{}'::jsonb, 
  dibuat            timestamptz not null default now(),
  check (selesai is null or selesai >= mulai)
);

-- Ringkasan per gerakan dalam satu sesi (bukan data per frame)
create table public.sesi_gerakan (
  id                uuid primary key default gen_random_uuid(),
  sesi_id           uuid not null references public.sesi (id) on delete cascade,
  kode_gerakan      text not null check (kode_gerakan in ('angkat_samping', 'angkat_depan', 'tekuk_siku')),
  target_sudut      smallint not null check (target_sudut between 10 and 180),
  repetisi_target   smallint not null check (repetisi_target between 1 and 50),
  repetisi_selesai  smallint not null default 0 check (repetisi_selesai between 0 and 200),
  rep_capai_target  smallint not null default 0 check (rep_capai_target >= 0),
  rep_kompensasi    smallint not null default 0 check (rep_kompensasi >= 0),
  puncak_maks       numeric(5,1) check (puncak_maks between 0 and 200),
  puncak_rata       numeric(5,1) check (puncak_rata between 0 and 200),
  check (rep_capai_target <= repetisi_selesai and rep_kompensasi <= repetisi_selesai),
  unique (sesi_id, kode_gerakan)
);

-- Kejadian penting (mis. pasien menekan "Berhenti, terasa sakit")
create table public.kejadian (
  id                    uuid primary key default gen_random_uuid(),
  sesi_id               uuid not null references public.sesi (id) on delete cascade,
  pasien_id             uuid not null references public.pasien (id) on delete cascade,
  jenis                 text not null check (jenis in ('stop_nyeri', 'kamera_terputus')),
  kode_gerakan          text check (kode_gerakan in ('angkat_samping', 'angkat_depan', 'tekuk_siku')),
  repetisi_ke           smallint,
  sudut                 numeric(5,1),
  terjadi_pada          timestamptz not null default now(),
  ditindaklanjuti       boolean not null default false,
  ditindaklanjuti_pada  timestamptz
);

-- Ringkasan AI (atau template fallback) yang sudah dibuat
create table public.ringkasan_ai (
  id               uuid primary key default gen_random_uuid(),
  pasien_id        uuid not null references public.pasien (id) on delete cascade,
  periode_mulai    date not null,
  periode_selesai  date not null,
  isi              jsonb not null, 
  sumber           text not null check (sumber in ('ai', 'template')),
  model            text,
  hash_input       text not null, 
  dibuat           timestamptz not null default now(),
  check (periode_selesai >= periode_mulai),
  unique (pasien_id, hash_input)
);

-- 2. INDEKS (untuk query dashboard & kolom yang dipakai RLS)
create index pasien_terapis_idx        on public.pasien (terapis_id);
create index program_pasien_idx        on public.program_gerakan (pasien_id);
create index sesi_pasien_mulai_idx     on public.sesi (pasien_id, mulai desc);
create index sesi_gerakan_sesi_idx     on public.sesi_gerakan (sesi_id);
create index kejadian_pasien_idx       on public.kejadian (pasien_id, ditindaklanjuti, terjadi_pada desc);
create index kejadian_sesi_idx         on public.kejadian (sesi_id);
create index ringkasan_pasien_idx      on public.ringkasan_ai (pasien_id, dibuat desc);

-- 3. FUNGSI BANTU
-- Buat profil terapis otomatis saat akun auth dibuat
create or replace function public.buat_profil_terapis()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.terapis (id, nama, institusi)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nama', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'institusi', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger saat_user_dibuat
  after insert on auth.users
  for each row execute function public.buat_profil_terapis();

-- security definer agar tidak memicu RLS berulang pada tabel pasien.
create or replace function public.milik_terapis(p_pasien uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pasien p
    where p.id = p_pasien
      and p.terapis_id = (select auth.uid())
  );
$$;

revoke all on function public.milik_terapis(uuid) from public, anon;
grant execute on function public.milik_terapis(uuid) to authenticated;
revoke all on function public.buat_profil_terapis() from public, anon, authenticated;

-- 4. HAK AKSES DASAR (defense in depth)
-- anon: tidak boleh apa pun (pasien lewat server, bukan langsung)
-- authenticated (terapis): hanya yang perlu
revoke all on public.terapis, public.pasien, public.program_gerakan, public.sesi,
              public.sesi_gerakan, public.kejadian, public.ringkasan_ai
  from anon, authenticated;

grant select, update                 on public.terapis         to authenticated;
grant select, insert, update, delete on public.pasien          to authenticated;
grant select, insert, update, delete on public.program_gerakan to authenticated;
grant select                         on public.sesi            to authenticated;
grant select                         on public.sesi_gerakan    to authenticated;
grant select, update                 on public.kejadian        to authenticated;
grant select                         on public.ringkasan_ai    to authenticated;

-- 5. ROW LEVEL SECURITY
alter table public.terapis         enable row level security;
alter table public.pasien          enable row level security;
alter table public.program_gerakan enable row level security;
alter table public.sesi            enable row level security;
alter table public.sesi_gerakan    enable row level security;
alter table public.kejadian        enable row level security;
alter table public.ringkasan_ai    enable row level security;

-- terapis: hanya profil sendiri
create policy "terapis lihat profil sendiri" on public.terapis
  for select to authenticated using (id = (select auth.uid()));
create policy "terapis ubah profil sendiri" on public.terapis
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- pasien: hanya milik terapis yang login
create policy "terapis lihat pasiennya" on public.pasien
  for select to authenticated using (terapis_id = (select auth.uid()));
create policy "terapis tambah pasien" on public.pasien
  for insert to authenticated with check (terapis_id = (select auth.uid()));
create policy "terapis ubah pasiennya" on public.pasien
  for update to authenticated using (terapis_id = (select auth.uid())) with check (terapis_id = (select auth.uid()));
create policy "terapis hapus pasiennya" on public.pasien
  for delete to authenticated using (terapis_id = (select auth.uid()));

-- program_gerakan: penuh untuk terapis pemilik pasien
create policy "terapis kelola program" on public.program_gerakan
  for all to authenticated
  using (public.milik_terapis(pasien_id))
  with check (public.milik_terapis(pasien_id));

-- sesi & sesi_gerakan: terapis hanya membaca (yang menulis = server)
create policy "terapis lihat sesi" on public.sesi
  for select to authenticated using (public.milik_terapis(pasien_id));
create policy "terapis lihat sesi_gerakan" on public.sesi_gerakan
  for select to authenticated using (
    exists (select 1 from public.sesi s where s.id = sesi_id and public.milik_terapis(s.pasien_id))
  );

-- kejadian: terapis membaca & menandai "sudah ditindaklanjuti"
create policy "terapis lihat kejadian" on public.kejadian
  for select to authenticated using (public.milik_terapis(pasien_id));
create policy "terapis tindak lanjuti kejadian" on public.kejadian
  for update to authenticated
  using (public.milik_terapis(pasien_id))
  with check (public.milik_terapis(pasien_id));

-- ringkasan_ai: terapis hanya membaca (yang menulis = server)
create policy "terapis lihat ringkasan" on public.ringkasan_ai
  for select to authenticated using (public.milik_terapis(pasien_id));

-- 6. KOLOM SENSITIF: terapis tidak perlu melihat token_hash
revoke select on public.pasien from authenticated;
grant select (id, terapis_id, nama_tampilan, sisi_dilatih, aktif, is_demo, catatan, terakhir_aktif, dibuat)
  on public.pasien to authenticated;
revoke update on public.pasien from authenticated;
grant update (nama_tampilan, sisi_dilatih, aktif, catatan) on public.pasien to authenticated;

-- kejadian: terapis hanya boleh mengubah status tindak lanjut
revoke update on public.kejadian from authenticated;
grant update (ditindaklanjuti, ditindaklanjuti_pada) on public.kejadian to authenticated;

-- terapis: hanya nama & institusi yang boleh diubah
revoke update on public.terapis from authenticated;
grant update (nama, institusi) on public.terapis to authenticated;
