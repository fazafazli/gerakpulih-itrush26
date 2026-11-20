# Arsitektur GerakPulih

Dokumen ini menjelaskan alur data dan alasan di balik keputusan teknis utama. Ringkasan dan diagram ada di [README](../README.md#arsitektur).

## Prinsip

1. **Video tidak pernah keluar dari HP.** Semua pemrosesan gambar terjadi di browser pasien.
2. **Logika penting adalah fungsi murni.** Deteksi gerak, validasi, dan olah data dashboard ada di `src/lib/**` tanpa React/DOM, sehingga bisa diuji dengan Vitest tanpa kamera.
3. **Otorisasi di server, bukan di proxy.** `src/proxy.ts` hanya pengalih cepat; pemeriksaan sebenarnya ada di Data Access Layer (`wajibPasien()`, `wajibTerapis()`) dan RLS Postgres.
4. **AI generatif tidak ada di jalur latihan.** Hitungan, suara, dan peringatan postur adalah aturan deterministik di perangkat.

## Alur 1: pasien masuk lewat link

```
/mulai/<token>  →  sha256(token) dicocokkan dengan pasien.token_hash (admin client, server)
                →  cookie gp_pasien = pasien_id + HMAC (PASIEN_TOKEN_SECRET), httpOnly
                →  /beranda  (atau halaman "Buka di Chrome" bila dibuka dari WhatsApp/Instagram)
```

- Token asli hanya ditampilkan sekali ke terapis; database hanya menyimpan hash.
- Bot pratinjau link (WhatsApp, Telegram, dll.) mendapat halaman generik tanpa query database, agar pratinjau tidak "memakai" link atau memperbarui `terakhir_aktif`.
- Sebelum kamera pertama kali menyala, pasien membaca halaman privasi; persetujuan (waktu + versi) dicatat di database dan cookie `gp_setuju`.

## Alur 2: sesi latihan (di browser)

Satu halaman, empat tahap: **Siapkan → Cek posisi → Latihan → Selesai**. Elemen `<video>` dan model MediaPipe tetap hidup antar-tahap, jadi tidak ada jeda memuat ulang.

```
Kamera → PoseLandmarker (WASM/GPU, dimuat dinamis) → landmark 33 titik per frame
       → pilihOrang      kunci satu orang bila ada pendamping di frame
       → nilaiKesiapan   orang, bingkai, jarak, cahaya, HP tegak, ketajaman (satu instruksi utama)
       → kalibrasi       posisi istirahat 3 detik per gerakan
       → penghitung      repetisi relatif terhadap posisi istirahat, puncak sudut, target tercapai
       → kompensasi      badan miring / bahu terangkat dibanding kalibrasi
       → UI + suara      state React hanya diperbarui saat nilai tampil berubah
```

Keputusan penting:

| Keputusan | Alasan |
|---|---|
| Hitungan **relatif** terhadap posisi istirahat | Lengan pasien stroke sering tidak bisa turun penuh atau naik tinggi; ambang absolut akan gagal menghitung |
| Data per-frame di `ref`, bukan state | Menghindari render ulang 20–30×/detik di HP kelas bawah |
| Pemantau FPS menurunkan model (full → lite) | HP lemah tetap jalan walau akurasi sedikit turun |
| Aturan cahaya hanya menghalangi bila pose tak terbaca | Uji HP: aturan "membelakangi cahaya" sering salah deteksi; yang penting lengan terbaca |
| Tombol nyeri menempel di bawah layar | Harus selalu terlihat apa pun ukuran video kamera |

## Alur 3: menyimpan hasil

```
Selesai → kiriman JSON (hanya angka) → antrean di localStorage
        → POST /api/sesi  →  wajibPasien() (cookie)  →  Zod  →  admin client insert
                             pasien_id dari cookie, BUKAN dari body
```

- **Idempoten:** id sesi dibuat di klien. Kiriman ulang dengan id yang sama dianggap berhasil (`23505` → `duplikat: true`), jadi antrean offline aman dicoba berkali-kali.
- Data yang disimpan: waktu sesi, per gerakan (repetisi, puncak sudut, repetisi capai target, jumlah kompensasi), kejadian nyeri, dan info teknis ringan (model, FPS).

## Alur 4: dashboard terapis

- Login Supabase Auth; semua query memakai client atas nama terapis sehingga **RLS** membatasi ke pasiennya sendiri.
- Kolom pasien selalu dipilih eksplisit; `token_hash` tidak pernah dibaca dari klien terapis.
- Olah data (kepatuhan, status "perlu ditinjau", seri grafik) adalah fungsi murni di `src/lib/terapis/olah.ts` dan diuji.

## Alur 5: ringkasan AI

```
POST /api/ringkasan → wajibTerapis() → agregat anonim (angka saja) → hash input
   ├─ hash sama dengan ringkasan tersimpan → pakai yang tersimpan (hemat kuota)
   └─ baru → prompt → Gemini → JSON → validasi Zod → pengaman (laporan nyeri wajib tetap disebut)
              └─ gagal / timeout / tanpa API key → template dari aturan tetap
```

- Ke Gemini tidak dikirim nama, ID, email, atau teks bebas.
- Output selalu berlabel **"Dibuat AI · perlu ditinjau"** atau **"Template otomatis"**, sehingga terapis tahu sumbernya.
- Nama model diambil dari env `GEMINI_MODEL`.

## Skema data

Sumber satu-satunya: `supabase/migrations/`.

| Tabel | Isi |
|---|---|
| `terapis` | Profil terapis, terhubung ke `auth.users` |
| `pasien` | Nama panggilan, sisi dilatih, `token_hash`, aktif, `is_demo`, persetujuan |
| `program_gerakan` | Gerakan, target sudut, repetisi, urutan per pasien |
| `sesi` / `sesi_gerakan` | Hasil latihan per sesi dan per gerakan |
| `kejadian` | Laporan nyeri (dan tindak lanjutnya) |
| `ringkasan_ai` | Ringkasan tersimpan + hash input + sumber (AI/template) |

## Operasional

- **CI** (`.github/workflows/ci.yml`): lint, typecheck, dan test di setiap push.
- **Keepalive** (`.github/workflows/keepalive.yml`): memanggil `/api/keepalive` tiap 3 hari agar project Supabase gratis tidak dijeda.
- **Seed demo** (`supabase/seed.sql`): aman dijalankan berulang, tanggal relatif terhadap hari ini.
