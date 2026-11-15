import { createHash } from "node:crypto";

/** JSON dengan urutan key stabil, agar data yang sama selalu menghasilkan hash yang sama. */
function stabil(nilai: unknown): string {
  if (Array.isArray(nilai)) return `[${nilai.map(stabil).join(",")}]`;
  if (nilai && typeof nilai === "object") {
    const entri = Object.entries(nilai as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entri.map(([k, v]) => `${JSON.stringify(k)}:${stabil(v)}`).join(",")}}`;
  }
  return JSON.stringify(nilai);
}

/** SHA-256 (hex) dari input ringkasan. Dipakai untuk memakai ulang ringkasan bila data tidak berubah. */
export function hashInput(input: unknown, versiPrompt: string): string {
  return createHash("sha256").update(`${versiPrompt}|${stabil(input)}`).digest("hex");
}
