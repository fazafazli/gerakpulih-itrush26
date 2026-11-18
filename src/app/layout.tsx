import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { originPublik } from "@/lib/situs";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const judul = "GerakPulih · Fisioterapis di Kamera";
const deskripsi = "Pendamping latihan rehabilitasi lengan pasca-stroke di rumah, dipantau fisioterapis. Video tidak pernah keluar dari perangkat.";

export const metadata: Metadata = {
  // URL absolut untuk og:image dkk. Tanpa APP_URL (mis. lokal) dipakai localhost.
  metadataBase: new URL(originPublik() ?? "http://localhost:3000"),
  title: judul,
  description: deskripsi,
  applicationName: "GerakPulih",
  openGraph: { type: "website", locale: "id_ID", siteName: "GerakPulih", title: judul, description: deskripsi },
  twitter: { card: "summary_large_image", title: judul, description: deskripsi },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
