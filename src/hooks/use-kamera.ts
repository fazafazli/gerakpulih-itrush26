"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StatusKamera = "mati" | "meminta" | "aktif" | "ditolak" | "tidak_ada" | "dipakai" | "tidak_didukung" | "galat" | "terputus";

/** Pesan ramah untuk setiap kegagalan kamera (ditampilkan & dibacakan). */
export const PESAN_KAMERA: Partial<Record<StatusKamera, string>> = {
  ditolak: "Izin kamera ditolak. Ketuk ikon gembok di atas, izinkan Kamera, lalu coba lagi.",
  tidak_ada: "Kamera tidak ditemukan di perangkat ini.",
  dipakai: "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu, lalu coba lagi.",
  tidak_didukung: "Browser ini tidak mendukung kamera. Buka link latihan di Google Chrome.",
  galat: "Kamera tidak bisa dinyalakan. Coba lagi.",
  terputus: "Kamera terputus. Ketuk tombol di bawah untuk menyambung lagi.",
};

function statusDariGalat(e: unknown): StatusKamera {
  const nama = e instanceof DOMException ? e.name : "";
  if (nama === "NotAllowedError" || nama === "SecurityError") return "ditolak";
  if (nama === "NotFoundError" || nama === "OverconstrainedError") return "tidak_ada";
  if (nama === "NotReadableError" || nama === "AbortError") return "dipakai";
  return "galat";
}

/**
 * Kamera depan untuk deteksi pose. Video hanya ditampilkan & diproses di perangkat — tidak pernah dikirim.
 * Elemen <video> harus selalu ter-render (boleh tersembunyi) agar stream bertahan antar-tahap.
 */
export function useKamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<StatusKamera>("mati");

  const hentikanStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      t.onended = null;
      t.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  /** Harus dipanggil dari aksi pengguna (ketukan) agar izin & pemutaran video diizinkan browser. */
  const nyalakan = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("tidak_didukung");
      return false;
    }
    hentikanStream();
    setStatus("meminta");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        // Resolusi kecil cukup untuk pose dan jauh lebih ringan di HP murah.
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
      });
      streamRef.current = stream;
      const [track] = stream.getVideoTracks();
      if (track) track.onended = () => setStatus("terputus");
      const video = videoRef.current;
      if (!video) throw new Error("Elemen video belum siap");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setStatus("aktif");
      return true;
    } catch (e) {
      hentikanStream();
      setStatus(statusDariGalat(e));
      return false;
    }
  }, [hentikanStream]);

  const matikan = useCallback(() => {
    hentikanStream();
    setStatus("mati");
  }, [hentikanStream]);

  // Lampu kamera wajib mati saat pengguna meninggalkan halaman.
  useEffect(() => hentikanStream, [hentikanStream]);

  return { videoRef, status, nyalakan, matikan };
}
