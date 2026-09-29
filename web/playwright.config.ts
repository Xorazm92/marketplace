import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "crypto";

// Butun stek: backend (dist) + frontend (next start), alohida portlar va alohida baza.
// Oldin: `npm run build` (web) va `npm run build` (backend-main).
const DB = process.env.E2E_DATABASE_URL ?? "postgresql://inbola_test@127.0.0.1:5544/inbola_mkt_pw_test";
process.env.E2E_DATABASE_URL = DB;
const API_PORT = 4100;
const WEB_PORT = 5100;
// test-results/ ni Playwright ishga tushishda tozalaydi — log boshqa joyda turadi.
export const API_LOG = ".e2e/api.log";
const secret = () => randomBytes(24).toString("hex");

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: `http://localhost:${WEB_PORT}`, trace: "retain-on-failure" },
  projects: [
    // PW_CHANNEL=chrome — Playwright brauzerini yuklab bo'lmasa, tizimdagi Chrome bilan.
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL || undefined } },
  ],
  webServer: [
    {
      // development: SMS o'rniga kod log'ga yoziladi va test uni shu fayldan o'qiydi.
      command: `mkdir -p .e2e && node ../backend-main/dist/main > ${API_LOG} 2>&1`,
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      env: {
        NODE_ENV: "development",
        PORT: String(API_PORT),
        DATABASE_URL: DB,
        JWT_ACCESS_SECRET: secret(),
        JWT_REFRESH_SECRET: secret(),
        JWT_OTP_SECRET: secret(),
        FRONTEND_URL: `http://localhost:${WEB_PORT}`,
        CORS_ORIGIN: `http://localhost:${WEB_PORT}`,
        SHIPPING_FLAT_FEE: "20000",
      },
    },
    {
      command: `npx next start -p ${WEB_PORT}`,
      // Bazaga bog'liq bo'lmagan sahifa: web-serverlar globalSetup (migratsiya) dan OLDIN ko'tariladi.
      url: `http://localhost:${WEB_PORT}/login`,
      reuseExistingServer: false,
      env: { API_URL: `http://localhost:${API_PORT}` },
    },
  ],
});
