-- GerakPulih - data demo untuk juri
-- SYARAT: buat dulu akun terapis demo di Dashboard → Authentication → Add user → email di bawah, centang "Auto Confirm User".
-- Aman dijalankan ulang: data demo lama dihapus dulu.
-- Link pasien demo : /mulai/demo-budi   (token = 'demo-budi')
do $$
declare
  v_terapis uuid;
  v_budi    uuid;
  v_siti    uuid;
  v_sesi    uuid;
  v_hari    date;
  i         int;
  -- 12 sesi selama ±3 minggu; nilai puncak "angkat ke samping" naik bertahap
  puncak    numeric[] := array[72,75,78,80,84,83,88,91,95,97,101,104];
  kompen    int[]     := array[3,3,3,2,2,2,2,1,1,1,1,1]; 
  offset_hr int[]     := array[20,19,18,17,15,14,13,12,10,9,8,7]; 
begin
  select id into v_terapis from auth.users where email = 'demo-terapis@example.com';
  if v_terapis is null then
    raise exception 'Akun demo-terapis@example.com belum dibuat di Authentication → Add user';
  end if;

  update public.terapis
     set nama = 'Rina (akun demo)', institusi = 'Klinik Demo GerakPulih'
   where id = v_terapis;

  delete from public.pasien where terapis_id = v_terapis and is_demo;

  -- Pasien utama demo
  insert into public.pasien (terapis_id, nama_tampilan, sisi_dilatih, token_hash, is_demo, catatan, terakhir_aktif)
  values (v_terapis, 'Pak Budi', 'kanan', encode(sha256('demo-budi'::bytea), 'hex'), true,
          'Pasca-stroke, kelemahan sisi kanan. Data contoh.', now() - interval '7 days')
  returning id into v_budi;

  insert into public.program_gerakan (pasien_id, kode_gerakan, target_sudut, repetisi, urutan) values
    (v_budi, 'angkat_samping', 90, 10, 1),
    (v_budi, 'angkat_depan',   90, 10, 2),
    (v_budi, 'tekuk_siku',    120, 10, 3);

  for i in 1 .. array_length(puncak, 1) loop
    v_hari := current_date - offset_hr[i];

    insert into public.sesi (pasien_id, mulai, selesai, dihentikan_nyeri, info_teknis)
    values (v_budi,
            v_hari + time '09:00',
            v_hari + time '09:12',
            i = 11,
            '{"model":"full","fps_rata":19}'::jsonb)
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
      values (v_sesi, v_budi, 'stop_nyeri', 'angkat_samping', 4, 82, v_hari + time '09:04');
    end if;
  end loop;

  -- Ringkasan siap tampil 
  insert into public.ringkasan_ai (pasien_id, periode_mulai, periode_selesai, isi, sumber, model, hash_input)
  values (v_budi, current_date - 20, current_date - 7,
    jsonb_build_object(
      'poin', jsonb_build_array(
        'Jangkauan angkat ke samping naik dari 72° ke 104° dalam 3 minggu; target 90° tercapai sejak sesi ke-8.',
        'Gerakan dengan badan miring turun dari 3 menjadi 1 per 10 repetisi.',
        'Satu laporan nyeri pada angkat ke samping di 82°. Pertimbangkan pemeriksaan langsung sebelum target dinaikkan.'
      ),
      'perlu_perhatian', true
    ),
    'template', null, 'seed-demo-budi');

  -- Pasien kedua 
  insert into public.pasien (terapis_id, nama_tampilan, sisi_dilatih, token_hash, is_demo, terakhir_aktif)
  values (v_terapis, 'Bu Siti', 'kiri', encode(sha256('demo-siti'::bytea), 'hex'), true, now() - interval '1 day')
  returning id into v_siti;

  insert into public.program_gerakan (pasien_id, kode_gerakan, target_sudut, repetisi, urutan) values
    (v_siti, 'angkat_samping', 100, 10, 1),
    (v_siti, 'tekuk_siku',     120, 12, 2);
end;
$$;