-- GerakPulih - kebutuhan dashboard terapis
-- 1. Terapis boleh membuat link baru (ganti token_hash) untuk pasiennya sendiri.
-- 2. Kolom yang boleh diisi saat menambah pasien dibatasi (is_demo, terakhir_aktif tidak).
-- 3. Data contoh untuk juri dilindungi dari hapus / nonaktif / ganti link lewat akun terapis.

-- 1. Policy "terapis ubah pasiennya" tetap membatasi ke pasien milik sendiri.
grant update (token_hash) on public.pasien to authenticated;

-- 2.
revoke insert on public.pasien from authenticated;
grant insert (terapis_id, nama_tampilan, sisi_dilatih, token_hash, catatan) on public.pasien to authenticated;

-- 3. Hanya berlaku untuk role authenticated: seed (postgres) & admin client (service_role) tetap bisa.
create or replace function public.lindungi_pasien_demo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce((select auth.role()), '') <> 'authenticated' then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' and old.is_demo then
    raise exception using errcode = 'P0001', message = 'pasien_demo_terlindungi';
  end if;

  if tg_op = 'UPDATE' and old.is_demo
     and (new.aktif is distinct from old.aktif or new.token_hash is distinct from old.token_hash) then
    raise exception using errcode = 'P0001', message = 'pasien_demo_terlindungi';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.lindungi_pasien_demo() from public, anon, authenticated;

create trigger lindungi_pasien_demo
  before update or delete on public.pasien
  for each row execute function public.lindungi_pasien_demo();
