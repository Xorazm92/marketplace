import path from "node:path";
import type { NextConfig } from "next";

// CSP (Next 16 qo'llanmasi, "Without Nonces"): sahifa faqat o'z domenidan skript, rasm va so'rov
// yuklaydi. Tokenlar localStorage'da bo'lgani uchun bu — XSS oqibatini cheklaydigan asosiy to'siq:
// begona skript ulanmaydi, ma'lumot begona serverga yuborilmaydi (connect-src), sahifa freymga
// olinmaydi. 'unsafe-inline' — Next'ning o'z inline skriptlari uchun (nonce'siz rejim).
// To'lov provayderiga o'tish — oddiy navigatsiya, CSP uni to'smaydi.
// HSTS bu yerda emas: uni TLS'ni yakunlovchi nginx qo'yadi (deploy/nginx).
const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  // Repo ildizidagi lockfile tufayli Next ildizni noto'g'ri topib, standalone'ni web/ ichiga
  // joylardi; Docker va lokal build bir xil tuzilma bersin.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
