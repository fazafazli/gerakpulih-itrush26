"use client";

import { useEffect } from "react";

/**
 * Animasi masuk section (.gp-muncul), sekali per section. Hanya diaktifkan bila JS jalan DAN pengguna
 * tidak meminta gerak berkurang; tanpa itu konten langsung terlihat (lihat globals.css).
 */
export function PenandaMuncul() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const akar = document.documentElement;
    const io = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-tampil", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const target = document.querySelectorAll(".gp-muncul");
    // Section yang sudah terlihat saat halaman dibuka langsung ditandai, jadi tidak "berkedip".
    for (const el of target) {
      if (el.getBoundingClientRect().top < innerHeight) el.setAttribute("data-tampil", "");
      else io.observe(el);
    }
    akar.setAttribute("data-animasi", "");
    return () => {
      io.disconnect();
      akar.removeAttribute("data-animasi");
    };
  }, []);
  return null;
}
