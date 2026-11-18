import { describe, expect, it } from "vitest";
import { apakahBotPratinjau, deteksiPeramban, htmlPratinjau, tautanIntentChrome } from "@/lib/pasien/peramban";

const UA = {
  chromeAndroid: "Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
  safariIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  waPratinjau: "WhatsApp/2.24.21.80 A",
  waWebview: "Mozilla/5.0 (Linux; Android 12; RMX3263) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.0.0 Mobile Safari/537.36 WhatsApp/2.24.21",
  instagram:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 Instagram 350.0.0.42.92 Android (34/14; 420dpi; 1080x2400; Google; Pixel 7; panther; panther; en_US; 641123490) FBAV/1",
  facebookIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/478.0.0.43.109;FBBV/1;FBDV/iPhone14,7;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBLC/id_ID;FBOP/5]",
  line: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/13.16.0",
  tiktok:
    "Mozilla/5.0 (Linux; Android 11; V2029) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 trill_340204 BytedanceWebview/d8a21c6",
  fbBot: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  telegram: "TelegramBot (like TwitterBot)",
  imessage: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0",
};

describe("apakahBotPratinjau", () => {
  it("mengenali pengambil pratinjau", () => {
    for (const ua of [UA.waPratinjau, UA.fbBot, UA.telegram, UA.imessage, "Slackbot-LinkExpanding 1.0", "Mozilla/5.0 (compatible; Discordbot/2.0)", "LinkedInBot/1.0"]) {
      expect(apakahBotPratinjau(ua), ua).toBe(true);
    }
  });

  it("tidak menganggap manusia sebagai bot, termasuk webview WhatsApp", () => {
    for (const ua of [UA.chromeAndroid, UA.safariIos, UA.waWebview, UA.instagram, UA.facebookIos, "", null, undefined]) {
      expect(apakahBotPratinjau(ua)).toBe(false);
    }
  });
});

describe("deteksiPeramban", () => {
  it("mengenali browser dalam aplikasi + OS", () => {
    expect(deteksiPeramban(UA.waWebview)).toEqual({ aplikasi: "WhatsApp", os: "android" });
    expect(deteksiPeramban(UA.instagram)).toEqual({ aplikasi: "Instagram", os: "android" });
    expect(deteksiPeramban(UA.facebookIos)).toEqual({ aplikasi: "Facebook", os: "ios" });
    expect(deteksiPeramban(UA.line)).toEqual({ aplikasi: "LINE", os: "ios" });
    expect(deteksiPeramban(UA.tiktok)).toEqual({ aplikasi: "TikTok", os: "android" });
  });

  it("browser biasa, bot, dan UA kosong → bukan dalam aplikasi", () => {
    expect(deteksiPeramban(UA.chromeAndroid)).toEqual({ aplikasi: null, os: "android" });
    expect(deteksiPeramban(UA.safariIos)).toEqual({ aplikasi: null, os: "ios" });
    expect(deteksiPeramban(UA.waPratinjau).aplikasi).toBeNull();
    expect(deteksiPeramban(UA.imessage).aplikasi).toBeNull();
    expect(deteksiPeramban(null)).toEqual({ aplikasi: null, os: "lain" });
  });
});

describe("tautanIntentChrome", () => {
  it("membuka URL yang sama di Chrome, dengan cadangan URL asli", () => {
    const url = "https://gerakpulih.vercel.app/mulai/abc_DEF-123";
    const intent = tautanIntentChrome(url);
    expect(intent.startsWith("intent://gerakpulih.vercel.app/mulai/abc_DEF-123#Intent;")).toBe(true);
    expect(intent).toContain("scheme=https;");
    expect(intent).toContain("package=com.android.chrome;");
    expect(intent).toContain(`S.browser_fallback_url=${encodeURIComponent(url)};end`);
  });
});

describe("htmlPratinjau", () => {
  it("berisi og:title & og:description generik, noindex", () => {
    const html = htmlPratinjau();
    expect(html).toContain('<meta property="og:title" content="Link latihan GerakPulih">');
    expect(html).toContain('property="og:description"');
    expect(html).toContain("noindex");
    expect(html).not.toMatch(/Budi|Siti|mulai\//);
  });
});

describe("langkahBukaBrowser", () => {
  it("menyebut aplikasi & browser yang sesuai OS", async () => {
    const { langkahBukaBrowser, namaBrowserDisarankan } = await import("@/lib/pasien/peramban");
    expect(namaBrowserDisarankan("ios")).toBe("Safari");
    expect(namaBrowserDisarankan("android")).toBe("Chrome");
    const android = langkahBukaBrowser({ aplikasi: "WhatsApp", os: "android" });
    expect(android).toHaveLength(3);
    expect(android[0]).toContain("WhatsApp");
    expect(android[1]).toContain("Buka di Chrome");
    expect(langkahBukaBrowser({ aplikasi: "Instagram", os: "ios" })[1]).toContain("Buka di Safari");
  });
});
