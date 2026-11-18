import { ImageResponse } from "next/og";

export const alt = "GerakPulih: latihan lengan di rumah, dipantau fisioterapis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Gambar pratinjau saat link situs dibagikan. ImageResponse tidak bisa membaca CSS variable,
 * jadi warnanya ditulis langsung (sama dengan token --mint, --primary, --teal-segar, --foreground di globals.css).
 */
const WARNA = { latar: "#e8f7f3", utama: "#087f75", segar: "#14b8a6", teks: "#173b3a", redup: "#5b7370", putih: "#ffffff" } as const;

export default function GambarOg() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: WARNA.latar,
          color: WARNA.teks,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700, color: WARNA.utama }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill={WARNA.putih} />
            <path d="M9 23c1-7 5.5-12 13-13" fill="none" stroke={WARNA.utama} strokeWidth="3" strokeLinecap="round" />
            <circle cx="9" cy="23" r="2.6" fill={WARNA.segar} />
            <circle cx="22.5" cy="10" r="2.6" fill={WARNA.utama} />
          </svg>
          GerakPulih
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 960 }}>Latihan lengan di rumah, tetap dipantau fisioterapis.</div>
          <div style={{ fontSize: 28, color: WARNA.redup }}>Kamera HP menghitung gerakan · Video tidak pernah meninggalkan HP</div>
        </div>
      </div>
    ),
    size,
  );
}
