import { describe, expect, it } from "vitest";
import { pilihOrigin } from "@/lib/situs";

describe("pilihOrigin (APP_URL untuk link pasien)", () => {
  it("APP_URL diutamakan, slash akhir dibuang", () => {
    expect(pilihOrigin({ appUrl: "https://gerakpulih.vercel.app/", origin: "http://localhost:3000" })).toBe("https://gerakpulih.vercel.app");
  });

  it("APP_URL kosong/tidak valid → origin permintaan", () => {
    expect(pilihOrigin({ appUrl: "", origin: "http://localhost:3000" })).toBe("http://localhost:3000");
    expect(pilihOrigin({ appUrl: "gerakpulih.vercel.app", origin: "https://a.app" })).toBe("https://a.app");
    expect(pilihOrigin({ appUrl: "javascript:alert(1)", origin: "https://a.app" })).toBe("https://a.app");
    expect(pilihOrigin({ appUrl: "https://a.app/jalur", origin: "https://b.app" })).toBe("https://b.app");
  });

  it("tanpa origin → host + proto, dengan host yang divalidasi", () => {
    expect(pilihOrigin({ host: "gp.app", proto: "https" })).toBe("https://gp.app");
    expect(pilihOrigin({ host: "localhost:3123" })).toBe("http://localhost:3123");
    expect(pilihOrigin({ host: "jahat.app/<script>", proto: "https" })).toBe("https://localhost:3000");
    expect(pilihOrigin({})).toBe("http://localhost:3000");
  });
});

describe("originPublik (landing & QR demo, tanpa request)", () => {
  it("APP_URL → domain produksi Vercel → null", async () => {
    const { originPublik } = await import("@/lib/situs");
    expect(originPublik({ APP_URL: "https://gp.vercel.app/", VERCEL_PROJECT_PRODUCTION_URL: "lain.vercel.app" })).toBe("https://gp.vercel.app");
    expect(originPublik({ APP_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "gp-prod.vercel.app" })).toBe("https://gp-prod.vercel.app");
    expect(originPublik({ APP_URL: "bukan url" })).toBeNull();
    expect(originPublik({})).toBeNull();
  });
});
