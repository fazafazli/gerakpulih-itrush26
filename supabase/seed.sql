-- Data demo untuk juri (akun demo-terapis@example.com).
--
-- Aman dijalankan berulang kali:
-- * Pak Budi & Bu Siti dipertahankan id-nya (upsert lewat token_hash). Link /mulai/demo-budi dan cookie
--   pasien yang sudah tersimpan di HP juri tetap berlaku. Isinya (program, sesi, kejadian, ringkasan) diset ulang.
-- * Semua tanggal dihitung dari hari ini (WIB): 12 sesi Pak Budi tersebar di 14 hari terakhir, sesi terakhir
--   kemarin. Jadi kepatuhan, "sesi terakhir", dan grafik selalu wajar kapan pun seed dijalankan.
-- * Pasien non-demo tidak disentuh.
--
-- Prasyarat: akun auth demo-terapis@example.com sudah dibuat (Authentication → Add user).
do $$
declare
  v_terapis  uuid;
  v_budi     uuid;
  v_siti     uuid;
  v_sesi     uuid;
  v_mulai    timestamptz;
  -- "Hari ini" menurut WIB, bukan UTC server, agar sesi jatuh di tanggal kalender yang benar.
  v_hari_ini date := (now() at time zone 'Asia/Jakarta')::date;
  i          int;
  puncak     numeric[] := array[72,75,78,80,84,83,88,91,95,97,101,104];
  kompen     int[]     := array[3,3,3,2,2,2,2,1,1,1,1,1];
  -- Jumlah hari sebelum hari ini. Sesi ke-11 (laporan nyeri) = 2 hari lalu, sesi ke-12 = kemarin.
  offset_hr  int[]     := array[14,13,12,11,10,8,7,6,4,3,2,1];
  hash_budi  text      := encode(sha256('demo-budi'::bytea), 'hex');
  hash_siti  text      := encode(sha256('demo-siti'::bytea), 'hex');
begin
  select id into v_terapis from auth.users where email = 'demo-terapis@example.com';
  if v_terapis is null then
    raise exception 'Akun demo-terapis@example.com belum dibuat di Authentication → Add user';
  end if;

  update public.terapis
     set nama = 'Rina (akun demo)', institusi = 'Klinik Demo GerakPulih'
   where id = v_terapis;

  -- Pasien demo lain (bila pernah ada) dibersihkan; Pak Budi & Bu Siti dipertahankan.
  delete from public.pasien
   where terapis_id = v_terapis and is_demo and token_hash not in (hash_budi, hash_siti);

  -- ---------- Pak Budi: pasien utama demo ----------
  insert into public.pasien (terapis_id, nama_tampilan, sisi_dilatih, token_hash, is_demo, aktif, catatan)
  values (v_terapis, 'Pak Budi', 'kanan', hash_budi, true, true, 'Pasca-stroke, kelemahan sisi kanan. Data contoh.')
  on conflict (token_hash) do update
     set terapis_id    = excluded.terapis_id,
         nama_tampilan = excluded.nama_tampilan,
         sisi_dilatih  = excluded.sisi_dilatih,
         is_demo       = true,
         aktif         = true,
         catatan       = excluded.catatan
  returning id into v_budi;

  -- Set ulang data turunan (sesi_gerakan & kejadian ikut terhapus lewat cascade dari sesi).
  delete from public.sesi            where pasien_id = v_budi;
  delete from public.kejadian        where pasien_id = v_budi;
  delete from public.program_gerakan where pasien_id = v_budi;
  delete from public.ringkasan_ai    where pasien_id = v_budi;

  insert into public.program_gerakan (pasien_id, kode_gerakan, target_sudut, repetisi, urutan) values
    (v_budi, 'angkat_samping', 90, 10, 1),
    (v_budi, 'angkat_depan',   90, 10, 2),
    (v_budi, 'tekuk_siku',    120, 10, 3);

  for i in 1 .. array_length(puncak, 1) loop
    -- Pukul 09.00 WIB pada hari tersebut.
    v_mulai := ((v_hari_ini - offset_hr[i]) + time '09:00') at time zone 'Asia/Jakarta';

    insert into public.sesi (pasien_id, mulai, selesai, dihentikan_nyeri, info_teknis)
    values (v_budi, v_mulai, v_mulai + interval '12 minutes', i = 11, '{"model":"full","fps_rata":19}'::jsonb)
    returning id into v_sesi;

    insert into public.sesi_gerakan
      (sesi_id, kode_gerakan, target_sudut, repetisi_target, repetisi_selesai, rep_capai_target, rep_kompensasi, puncak_maks, puncak_rata)
    values
      (v_sesi, 'angkat_samping', 90, 10,
               case when i = 11 then 4 else 10 end,
               case when puncak[i] >= 90 then (case when i = 11 then 3 else 8 end) else 0 end,
               least(kompen[i], case when i = 11 then 4 else 10 end),
               puncak[i], puncak[i] - 9),
      (v_sesi, 'angkat_depan', 90, 10, 10,
               case when puncak[i] - 8 >= 90 then 6 else 0 end,
               kompen[i], puncak[i] - 8, puncak[i] - 16),
      (v_sesi, 'tekuk_siku', 120, 10, case when i = 11 then 7 else 10 end,
               case when i >= 6 then 5 else 2 end,
               0, 100 + i * 1.5, 92 + i * 1.5);

    if i = 11 then
      insert into public.kejadian (sesi_id, pasien_id, jenis, kode_gerakan, repetisi_ke, sudut, terjadi_pada)
      values (v_sesi, v_budi, 'stop_nyeri', 'angkat_samping', 4, 82, v_mulai + interval '4 minutes');
    end if;
  end loop;

  -- v_mulai sekarang = sesi ke-12 (kemarin).
  update public.pasien set terakhir_aktif = v_mulai + interval '12 minutes' where id = v_budi;

  -- Ringkasan contoh (sumber template), dibuat setelah semua sesi sehingga tidak ditandai usang.
  insert into public.ringkasan_ai (pasien_id, periode_mulai, periode_selesai, isi, sumber, model, hash_input)
  values (v_budi, v_hari_ini - 14, v_hari_ini - 1,
    jsonb_build_object(
      'poin', jsonb_build_array(
        'Jangkauan angkat ke samping naik dari 72° ke 104° dalam 2 minggu; target 90° tercapai sejak sesi ke-8.',
        'Gerakan dengan badan miring turun dari 3 menjadi 1 per 10 repetisi.',
        'Satu laporan nyeri pada angkat ke samping di 82°. Pertimbangkan pemeriksaan langsung sebelum target dinaikkan.'
      ),
      'perlu_perhatian', true,
      'alasan_perhatian', 'ada laporan nyeri'
    ),
    'template', null, 'seed-demo-budi');

  -- ---------- Bu Siti: pasien kedua, belum pernah latihan ----------
  insert into public.pasien (terapis_id, nama_tampilan, sisi_dilatih, token_hash, is_demo, aktif, catatan)
  values (v_terapis, 'Bu Siti', 'kiri', hash_siti, true, true, null)
  on conflict (token_hash) do update
     set terapis_id    = excluded.terapis_id,
         nama_tampilan = excluded.nama_tampilan,
         sisi_dilatih  = excluded.sisi_dilatih,
         is_demo       = true,
         aktif         = true,
         catatan       = excluded.catatan
  returning id into v_siti;

  delete from public.sesi            where pasien_id = v_siti;
  delete from public.kejadian        where pasien_id = v_siti;
  delete from public.program_gerakan where pasien_id = v_siti;
  delete from public.ringkasan_ai    where pasien_id = v_siti;

  insert into public.program_gerakan (pasien_id, kode_gerakan, target_sudut, repetisi, urutan) values
    (v_siti, 'angkat_samping', 100, 10, 1),
    (v_siti, 'tekuk_siku',     120, 12, 2);

  update public.pasien set terakhir_aktif = now() - interval '1 day' where id = v_siti;
end;
$$;
