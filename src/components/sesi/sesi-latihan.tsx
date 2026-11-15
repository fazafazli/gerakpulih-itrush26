"use client";

import { RefreshCw, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { PESAN_KAMERA, useKamera } from "@/hooks/use-kamera";
import { useKemiringanHp } from "@/hooks/use-kemiringan-hp";
import { type BingkaiMentah, useLoopPose } from "@/hooks/use-loop-pose";
import { useMesinPose } from "@/hooks/use-mesin-pose";
import { useSuara } from "@/hooks/use-suara";
import { GERAKAN, type KodeGerakan } from "@/lib/pose/exercises";
import type { Landmark, Sisi } from "@/lib/pose/landmarks";
import { suaraRepetisi } from "@/lib/pose/messages";
import { pilihOrang, type Pusat } from "@/lib/pose/pick-pose";
import { type ItemKesiapan, nilaiKesiapan, type StatistikGambar } from "@/lib/pose/readiness";
import { PelacakGerakan, type RingkasanGerakan } from "@/lib/pose/tracker";
import { kirimAntrean, kirimSesi } from "@/lib/sesi/kirim";
import { bangunKirimanSesi, PemantauFps, PenilaiStabil } from "@/lib/sesi/pemantau";
import type { KejadianSesi, SimpanSesi } from "@/lib/sesi/schema";
import { namaDenganSisi, SUARA_PANDUAN, suaraPengantar } from "@/lib/sesi/teks";
import { gambarRangka, WARNA_RANGKA } from "./gambar-rangka";
import { PenandaLangkah } from "./langkah";
import { type BarisHasil, LayarSelesai, type StatusKirim } from "./layar-selesai";
import { LayarSiapkan } from "./layar-siapkan";
import { PanelCek } from "./panel-cek";
import { OverlayLatihan, PanelLatihan, type TampilanLatihan } from "./panel-latihan";
import { PanelPengantar } from "./panel-pengantar";
import { TombolBerhenti, TombolUtama } from "./tombol";
import { ukurGambar } from "./ukur-gambar";

export type ProgramSesi = { kode: KodeGerakan; target: number; repetisi: number };

type Tahap =
  | { jenis: "siapkan" }
  | { jenis: "pengantar"; i: number }
  | { jenis: "cek"; i: number }
  | { jenis: "latihan"; i: number }
  | { jenis: "selesai"; nyeri: boolean };

type TampilanCek = { instruksi: ItemKesiapan | null; item: ItemKesiapan[]; siap: boolean };

const TAMPILAN_LATIHAN_AWAL: TampilanLatihan = { sudut: null, jumlah: 0, capai: 0, kompensasi: [], terlihat: true, kalibrasiDetik: null };
const TAMPILAN_CEK_AWAL: TampilanCek = { instruksi: null, item: [], siap: false };

/** Posisi harus benar terus selama ini sebelum latihan dimulai otomatis (mencegah mulai saat pasien masih bergerak). */
const SIAP_STABIL_MS = 1500;
/** Pasien dianggap keluar bingkai setelah tidak terdeteksi selama ini. */
const HILANG_MS = 2000;
/** Jeda minimal antar-instruksi suara pada tahap cek agar tidak cerewet. */
const JEDA_SUARA_CEK_MS = 3000;

const bulat1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Satu halaman untuk Siapkan → Cek → Latihan → Selesai.
 * Kamera & model dimuat sekali dan dipakai lintas tahap. Semua perhitungan pose terjadi di perangkat;
 * yang dikirim ke server hanya ringkasan angka (lihat lib/sesi/schema.ts).
 */
export function SesiLatihan(props: { pasienId: string; nama: string; sisi: Sisi; program: readonly ProgramSesi[] }) {
  const { pasienId, nama, sisi, program } = props;
  // Didestrukturisasi: objek yang memuat ref tidak boleh dibaca saat render (aturan react-hooks/refs).
  const { videoRef, status: statusKamera, nyalakan: nyalakanKamera, matikan: matikanKamera } = useKamera();
  const { aktif: suaraAktif, setAktif: setSuaraAktif, ucapkan } = useSuara();
  const pose = useMesinPose();

  const [tahap, setTahap] = useState<Tahap>({ jenis: "siapkan" });
  const [cek, setCek] = useState<TampilanCek>(TAMPILAN_CEK_AWAL);
  const [tampil, setTampil] = useState<TampilanLatihan>(TAMPILAN_LATIHAN_AWAL);
  const [kirim, setKirim] = useState<StatusKirim>({ status: "mengirim" });
  const [hasilTampil, setHasilTampil] = useState<BarisHasil[]>([]);
  const [rasioVideo, setRasioVideo] = useState(3 / 4);

  // Data yang berubah tiap frame disimpan di ref agar tidak memicu render 24×/detik.
  const kanvasRef = useRef<HTMLCanvasElement>(null);
  const kanvasKecilRef = useRef<HTMLCanvasElement | null>(null);
  const pelacakRef = useRef<PelacakGerakan | null>(null);
  const hasilRef = useRef<RingkasanGerakan[]>([]);
  const kejadianRef = useRef<KejadianSesi[]>([]);
  const sesiRef = useRef<{ id: string; mulai: Date } | null>(null);
  const kirimanRef = useRef<SimpanSesi | null>(null);
  const kunciRef = useRef<Pusat | null>(null);
  const stabilRef = useRef(new PenilaiStabil(SIAP_STABIL_MS));
  const fpsRef = useRef(new PemantauFps());
  const statistikRef = useRef<{ t: number; nilai: StatistikGambar | null }>({ t: -Infinity, nilai: null });
  const terlihatRef = useRef(0);
  const sudutRef = useRef<number | null>(null);
  const capaiRef = useRef(0);
  const uiRef = useRef({ t: 0, tampil: TAMPILAN_LATIHAN_AWAL, kunciCek: "" });
  const suaraCekRef = useRef({ pesan: "", t: -Infinity });
  const terputusRef = useRef(false);

  const kemiringanRef = useKemiringanHp(tahap.jenis === "cek");
  const iAktif = tahap.jenis === "pengantar" || tahap.jenis === "cek" || tahap.jenis === "latihan" ? tahap.i : null;

  // Sesi yang gagal terkirim sebelumnya (mis. sinyal hilang) dikirim ulang diam-diam.
  useEffect(() => {
    void kirimAntrean(pasienId);
  }, [pasienId]);

  // ---------- gambar ----------
  const gambar = (b: BingkaiMentah, lm: readonly Landmark[] | null, warna: string) => {
    const c = kanvasRef.current;
    if (!c) return;
    if (c.width !== b.lebar) c.width = b.lebar;
    if (c.height !== b.tinggi) c.height = b.tinggi;
    const ctx = c.getContext("2d");
    if (ctx) gambarRangka(ctx, lm, sisi, warna);
  };

  const bersihkanKanvas = () => {
    const c = kanvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  // ---------- transisi tahap ----------
  const keGerakan = (i: number) => {
    bersihkanKanvas();
    setTahap({ jenis: "pengantar", i });
    const p = program[i];
    ucapkan(suaraPengantar(i + 1, p.kode, sisi, p.repetisi), { sela: false });
  };

  const kirimkan = async (data: SimpanSesi) => {
    setKirim({ status: "mengirim" });
    const h = await kirimSesi(pasienId, data);
    setKirim(h.status === "terkirim" ? { status: "terkirim" } : h);
  };

  const simpanBagianGerakan = () => {
    if (pelacakRef.current) hasilRef.current.push(pelacakRef.current.ringkasan());
    pelacakRef.current = null;
  };

  const selesaiSesi = (nyeri: boolean) => {
    simpanBagianGerakan();
    matikanKamera();
    bersihkanKanvas();
    const sesi = sesiRef.current ?? { id: crypto.randomUUID(), mulai: new Date() };
    const data = bangunKirimanSesi({
      id: sesi.id,
      mulai: sesi.mulai,
      selesai: new Date(),
      gerakan: hasilRef.current,
      kejadian: kejadianRef.current,
      info: {
        model: pose.mesin?.model ?? "lite",
        delegasi: pose.mesin?.delegasi ?? "CPU",
        fps_rata: fpsRef.current.fpsRata,
        turun_model: pose.jumlahTurun,
      },
    });
    setHasilTampil(
      data.gerakan.map((g) => ({
        nama: namaDenganSisi(g.kode_gerakan, sisi),
        selesai: g.repetisi_selesai,
        target: program.find((p) => p.kode === g.kode_gerakan)?.repetisi ?? g.repetisi_selesai,
        puncak: g.puncak_maks,
      })),
    );
    setTahap({ jenis: "selesai", nyeri });
    if (!nyeri) ucapkan("Hebat! Latihan hari ini selesai.", { sela: false });
    if (data.gerakan.length === 0 && data.kejadian.length === 0) {
      setKirim({ status: "kosong" });
      return;
    }
    kirimanRef.current = data;
    void kirimkan(data);
  };

  const selesaikanGerakan = (i: number) => {
    simpanBagianGerakan();
    if (i + 1 < program.length) {
      ucapkan("Bagus! Gerakan selesai.", { sela: false });
      keGerakan(i + 1);
    } else {
      selesaiSesi(false);
    }
  };

  const mulaiLatihan = (i: number, t: number) => {
    const p = program[i];
    const pelacak = new PelacakGerakan({ gerakan: p.kode, sisi, targetSudut: p.target });
    pelacak.mulaiKalibrasi(t);
    pelacakRef.current = pelacak;
    terlihatRef.current = t;
    sudutRef.current = null;
    capaiRef.current = 0;
    stabilRef.current.reset();
    const awal = { ...TAMPILAN_LATIHAN_AWAL, kalibrasiDetik: 3 };
    uiRef.current.tampil = awal;
    setTampil(awal);
    setTahap({ jenis: "latihan", i });
    ucapkan("Diam sebentar. Tangan di posisi istirahat.");
  };

  const keCek = (i: number) => {
    kunciRef.current = null;
    stabilRef.current.reset();
    statistikRef.current = { t: -Infinity, nilai: null };
    uiRef.current.kunciCek = "";
    suaraCekRef.current = { pesan: "", t: -Infinity };
    setCek(TAMPILAN_CEK_AWAL);
    setTahap({ jenis: "cek", i });
    ucapkan("Lihat layar, dan ikuti petunjuknya.");
  };

  // ---------- aksi pengguna ----------
  const mulaiSesi = async () => {
    ucapkan("Menyalakan kamera."); // dipanggil di dalam ketukan agar suara diizinkan browser (iOS)
    if (!(await nyalakanKamera())) {
      ucapkan("Kamera belum bisa dinyalakan. Baca petunjuk di layar.");
      return;
    }
    sesiRef.current ??= { id: crypto.randomUUID(), mulai: new Date() };
    keGerakan(0);
  };

  const berhentiNyeri = () => {
    const pelacak = pelacakRef.current;
    if (kejadianRef.current.length < 10) {
      kejadianRef.current.push({
        jenis: "stop_nyeri",
        kode_gerakan: iAktif == null ? null : program[iAktif].kode,
        repetisi_ke: pelacak ? Math.min(200, pelacak.ringkasan().repetisi_selesai + 1) : null,
        sudut: tahap.jenis === "latihan" && sudutRef.current != null ? bulat1(Math.min(200, Math.max(0, sudutRef.current))) : null,
        terjadi_pada: new Date().toISOString(),
      });
    }
    ucapkan("Latihan dihentikan. Istirahatkan tangan dulu.");
    selesaiSesi(true);
  };

  const sambungUlang = async () => {
    if (iAktif == null) return;
    if (await nyalakanKamera()) {
      terputusRef.current = false;
      keCek(iAktif);
    }
  };

  // Kamera terputus di tengah latihan → catat sebagai kejadian, simpan repetisi yang sudah ada.
  useEffect(() => {
    if (statusKamera !== "terputus" || iAktif == null || terputusRef.current) return;
    terputusRef.current = true;
    if (kejadianRef.current.length < 10) {
      kejadianRef.current.push({
        jenis: "kamera_terputus",
        kode_gerakan: program[iAktif].kode,
        repetisi_ke: pelacakRef.current ? Math.min(200, pelacakRef.current.ringkasan().repetisi_selesai + 1) : null,
        sudut: null,
        terjadi_pada: new Date().toISOString(),
      });
    }
    simpanBagianGerakan();
    ucapkan(PESAN_KAMERA.terputus ?? "");
  }, [statusKamera, iAktif, program, ucapkan]);

  // ---------- pemrosesan per frame ----------
  const prosesCek = (b: BingkaiMentah, i: number) => {
    const daftar = b.hasil.landmarks;
    const { indeks, kunci } = pilihOrang(daftar, kunciRef.current);
    kunciRef.current = kunci;
    const lm = indeks >= 0 ? daftar[indeks] : null;
    gambar(b, lm, WARNA_RANGKA.normal);

    if (b.t - statistikRef.current.t > 500) {
      kanvasKecilRef.current ??= document.createElement("canvas");
      statistikRef.current = { t: b.t, nilai: ukurGambar(b.video, kanvasKecilRef.current, lm) };
    }

    const hasil = nilaiKesiapan({
      statistik: statistikRef.current.nilai,
      landmark: lm,
      jumlahOrang: daftar.length,
      kemiringanHp: kemiringanRef.current,
      gerakan: GERAKAN[program[i].kode],
      sisi,
    });

    const kunciCek = `${hasil.siap}|${hasil.item.map((x) => `${x.status}:${x.pesan}`).join("|")}`;
    if (kunciCek !== uiRef.current.kunciCek) {
      uiRef.current.kunciCek = kunciCek;
      setCek({ instruksi: hasil.instruksiUtama, item: hasil.item, siap: hasil.siap });
    }

    const pesan = hasil.instruksiUtama?.pesan;
    if (pesan && pesan !== suaraCekRef.current.pesan && b.t - suaraCekRef.current.t > JEDA_SUARA_CEK_MS) {
      suaraCekRef.current = { pesan, t: b.t };
      ucapkan(pesan);
    }

    if (stabilRef.current.perbarui(hasil.siap, b.t)) mulaiLatihan(i, b.t);
  };

  const prosesLatihan = (b: BingkaiMentah, i: number) => {
    const pelacak = pelacakRef.current;
    if (!pelacak) return;
    const p = program[i];
    const out = pelacak.proses({ landmark: b.hasil.landmarks, dunia: b.hasil.worldLandmarks, lebar: b.lebar, tinggi: b.tinggi, t: b.t });
    gambar(b, out.indeksOrang >= 0 ? b.hasil.landmarks[out.indeksOrang] : null, out.kompensasi.aktif ? WARNA_RANGKA.kompensasi : WARNA_RANGKA.normal);

    if (out.adaOrang) terlihatRef.current = b.t;
    const terlihat = b.t - terlihatRef.current < HILANG_MS;
    if (!terlihat && uiRef.current.tampil.terlihat) ucapkan("Kamu tidak terlihat. Kembali duduk di depan kamera.");
    if (out.sudut != null) sudutRef.current = out.sudut;

    if (out.baselineBaru === null) {
      // Kalibrasi gagal (badan tidak terlihat jelas) → ulangi, jangan mulai menghitung dari posisi yang salah.
      pelacak.mulaiKalibrasi(b.t);
      ucapkan("Belum terlihat jelas. Diam sebentar lagi.");
    } else if (out.baselineBaru) {
      ucapkan(`Mulai. ${GERAKAN[p.kode].instruksi}`);
    }

    if (out.repetisiBaru) {
      capaiRef.current = pelacak.ringkasan().rep_capai_target;
      ucapkan(suaraRepetisi(out.repetisiBaru, out.repetisiBaru.alasanKompensasi, true));
      if (out.jumlahRepetisi >= p.repetisi) {
        selesaikanGerakan(i);
        return;
      }
    }

    const baru: TampilanLatihan = {
      sudut: out.sudut,
      jumlah: out.jumlahRepetisi,
      capai: capaiRef.current,
      kompensasi: out.kompensasi.alasan,
      terlihat,
      kalibrasiDetik: out.kalibrasi.aktif ? Math.ceil(out.kalibrasi.sisaMs / 1000) : null,
    };
    const lama = uiRef.current.tampil;
    const diskritBerubah =
      lama.jumlah !== baru.jumlah ||
      lama.capai !== baru.capai ||
      lama.terlihat !== baru.terlihat ||
      lama.kalibrasiDetik !== baru.kalibrasiDetik ||
      lama.kompensasi.join() !== baru.kompensasi.join();
    const sudutBerubah = Math.round(lama.sudut ?? -1) !== Math.round(baru.sudut ?? -1) && b.t - uiRef.current.t >= 100;
    if (diskritBerubah || sudutBerubah) {
      uiRef.current.tampil = baru;
      uiRef.current.t = b.t;
      setTampil(baru);
    }
  };

  useLoopPose({
    videoRef: videoRef,
    mesin: pose.mesin,
    berjalan: (tahap.jenis === "cek" || tahap.jenis === "latihan") && statusKamera === "aktif",
    onBingkai: (b) => {
      fpsRef.current.catat(b.t);
      if (fpsRef.current.perluTurun(b.t)) pose.turunkan();
      if (tahap.jenis === "cek") prosesCek(b, tahap.i);
      else if (tahap.jenis === "latihan") prosesLatihan(b, tahap.i);
    },
  });

  const saatMetadata = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.videoWidth && v.videoHeight) setRasioVideo(v.videoWidth / v.videoHeight);
  }, []);

  // ---------- tampilan ----------
  const pesanKamera = PESAN_KAMERA[statusKamera] ?? null;
  const kameraTampil = iAktif != null;
  const p = iAktif != null ? program[iAktif] : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-5 text-[#0F1E2E]">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setSuaraAktif(!suaraAktif)}
          aria-pressed={suaraAktif}
          aria-label={suaraAktif ? "Matikan suara panduan" : "Nyalakan suara panduan"}
          className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-[15px] font-semibold text-[#3D4C5C] hover:bg-[#F4F7FA]"
        >
          {suaraAktif ? <Volume2 aria-hidden className="size-5" /> : <VolumeX aria-hidden className="size-5" />}
          {suaraAktif ? "Suara nyala" : "Suara mati"}
        </button>
      </div>

      {tahap.jenis === "siapkan" && (
        <LayarSiapkan
          meminta={statusKamera === "meminta"}
          pesanGalat={statusKamera === "terputus" ? null : pesanKamera}
          onSiap={mulaiSesi}
          onPutarUlang={() => ucapkan(SUARA_PANDUAN)}
        />
      )}

      {/* Video selalu ada di DOM (tersembunyi saat tidak dipakai) agar stream kamera tidak terputus antar-tahap. */}
      <div className={kameraTampil ? "flex flex-col gap-4" : "hidden"}>
        <PenandaLangkah aktif={tahap.jenis === "latihan" ? 2 : 1} />
        <div className="relative w-full overflow-hidden rounded-3xl bg-[#0F1E2E]" style={{ aspectRatio: rasioVideo }}>
          <video
            ref={videoRef}
            onLoadedMetadata={saatMetadata}
            playsInline
            muted
            aria-label="Pratinjau kamera (tidak direkam)"
            className="absolute inset-0 size-full -scale-x-100 object-contain"
          />
          <canvas ref={kanvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full -scale-x-100 object-contain" />
          {tahap.jenis === "cek" && (
            <div aria-hidden className="pointer-events-none absolute inset-x-[14%] inset-y-[5%] rounded-[45%_45%_14%_14%] border-4 border-dashed border-white/70" />
          )}
          {tahap.jenis === "latihan" && p && <OverlayLatihan t={tampil} target={p.target} repetisi={p.repetisi} />}
          {statusKamera === "terputus" && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 p-6 text-center text-white">
              <TriangleAlert aria-hidden className="size-12" />
              <p className="text-xl font-bold">{PESAN_KAMERA.terputus}</p>
              <TombolUtama onClick={sambungUlang} className="max-w-xs">
                <RefreshCw aria-hidden className="size-5" /> Sambungkan kamera
              </TombolUtama>
            </div>
          )}
        </div>

        {pose.galat && (tahap.jenis === "cek" || tahap.jenis === "latihan") && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-4">
            <p className="text-lg font-semibold text-[#912018]">{pose.galat}</p>
            <TombolUtama onClick={pose.muatUlang}>
              <RefreshCw aria-hidden className="size-5" /> Muat ulang pendeteksi
            </TombolUtama>
          </div>
        )}

        {tahap.jenis === "pengantar" && p && (
          <PanelPengantar
            nomor={tahap.i + 1}
            total={program.length}
            kode={p.kode}
            sisi={sisi}
            repetisi={p.repetisi}
            onMulai={() => keCek(tahap.i)}
            onLewati={() => (tahap.i + 1 < program.length ? keGerakan(tahap.i + 1) : selesaiSesi(false))}
          />
        )}
        {tahap.jenis === "cek" && !pose.galat && <PanelCek memuat={!pose.mesin} instruksi={cek.instruksi} item={cek.item} siap={cek.siap} />}
        {tahap.jenis === "latihan" && p && (
          <PanelLatihan
            nomor={tahap.i + 1}
            total={program.length}
            nama={namaDenganSisi(p.kode, sisi)}
            capai={tampil.capai}
            onSelesaiGerakan={() => selesaikanGerakan(tahap.i)}
          />
        )}

        <TombolBerhenti onClick={berhentiNyeri} />
      </div>

      {tahap.jenis === "selesai" && (
        <LayarSelesai
          nama={nama}
          nyeri={tahap.nyeri}
          hasil={hasilTampil}
          kirim={kirim}
          onKirimUlang={() => kirimanRef.current && void kirimkan(kirimanRef.current)}
        />
      )}
    </main>
  );
}
