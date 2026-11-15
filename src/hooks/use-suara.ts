"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pembaca instruksi (Web Speech API, id-ID). Gratis, offline di sebagian besar HP Android,
 * dan tidak memakai AI generatif — sesuai aturan jalur latihan.
 */
export function useSuara() {
  const [aktif, setAktifState] = useState(true);
  const aktifRef = useRef(true);
  const suaraRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const pilih = () => {
      suaraRef.current = synth.getVoices().find((v) => v.lang?.toLowerCase().replace("_", "-").startsWith("id")) ?? null;
    };
    pilih();
    synth.addEventListener("voiceschanged", pilih);
    return () => {
      synth.removeEventListener("voiceschanged", pilih);
      synth.cancel();
    };
  }, []);

  /** `sela: true` memotong ucapan sebelumnya — angka repetisi tidak boleh tertinggal di belakang gerakan. */
  const ucapkan = useCallback((teks: string, opsi: { sela?: boolean } = {}) => {
    if (!aktifRef.current || !teks || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (opsi.sela ?? true) synth.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = "id-ID";
    if (suaraRef.current) u.voice = suaraRef.current;
    u.rate = 0.95;
    synth.speak(u);
  }, []);

  const setAktif = useCallback((nilai: boolean) => {
    aktifRef.current = nilai;
    setAktifState(nilai);
    if (!nilai && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { aktif, setAktif, ucapkan };
}
