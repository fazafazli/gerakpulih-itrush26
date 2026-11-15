import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buatTokenPasien, hashToken, POLA_TOKEN, tandatanganiSesi, verifikasiSesi } from "@/lib/pasien/token";

const RAHASIA = "r".repeat(48);
const SEKARANG = 1_800_000_000;

describe("token link pasien", () => {
  it("acak, cukup panjang, dan sesuai pola URL", () => {
    const a = buatTokenPasien();
    expect(a).toHaveLength(32);
    expect(POLA_TOKEN.test(a)).toBe(true);
    expect(a).not.toBe(buatTokenPasien());
  });

  it("hash sama dengan seed.sql (sha256 hex)", () => {
    expect(hashToken("demo-budi")).toBe(createHash("sha256").update("demo-budi").digest("hex"));
    expect(POLA_TOKEN.test("demo-budi")).toBe(true);
  });

  it("menolak token berformat aneh", () => {
    expect(POLA_TOKEN.test("ab")).toBe(false);
    expect(POLA_TOKEN.test("a b c d e f")).toBe(false);
    expect(POLA_TOKEN.test("../../etc/passwd")).toBe(false);
  });
});

describe("cookie sesi pasien", () => {
  const sah = tandatanganiSesi({ pid: "pasien-1", exp: SEKARANG + 60 }, RAHASIA);

  it("cookie sah terbaca", () => {
    expect(verifikasiSesi(sah, RAHASIA, SEKARANG)).toEqual({ pid: "pasien-1", exp: SEKARANG + 60 });
  });

  it("menolak cookie kedaluwarsa, dipalsukan, atau rahasia salah", () => {
    expect(verifikasiSesi(sah, RAHASIA, SEKARANG + 61)).toBeNull();
    const [data, ttd] = sah.split(".");
    const palsu = Buffer.from(JSON.stringify({ pid: "pasien-LAIN", exp: SEKARANG + 60 })).toString("base64url");
    expect(verifikasiSesi(`${palsu}.${ttd}`, RAHASIA, SEKARANG)).toBeNull();
    expect(verifikasiSesi(`${data}.xxxx`, RAHASIA, SEKARANG)).toBeNull();
    expect(verifikasiSesi(sah, "s".repeat(48), SEKARANG)).toBeNull();
    expect(verifikasiSesi(undefined, RAHASIA, SEKARANG)).toBeNull();
    expect(verifikasiSesi("tanpa-titik", RAHASIA, SEKARANG)).toBeNull();
  });

  it("menolak rahasia yang terlalu pendek", () => {
    expect(() => tandatanganiSesi({ pid: "x", exp: 1 }, "pendek")).toThrow(/PASIEN_TOKEN_SECRET/);
  });
});
