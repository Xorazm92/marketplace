import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "fs";

export const API = "http://localhost:4100/api/v1";
export const ADMIN = { phone_number: "+998909990000", password: "e2e-admin-password" };

// Testning o'zi backend'ga to'g'ridan-to'g'ri murojaat qilganda har chaqiruvga alohida "mijoz IP"si
// beriladi: aks holda yordamchi loginlar brauzer oqimidagi kirish chegarasini (5/daq) yeb qo'yardi.
let fakeIp = 0;
const viaProxy = () => ({ "X-Forwarded-For": `10.99.0.${++fakeIp}` });

// Backend log faylga biroz kechikib yozadi — kod paydo bo'lguncha kutiladi.
export async function lastOtp(phone = "+998901234567"): Promise<string> {
  let code = "";
  await expect.poll(() => (code = readOtp(phone)), { timeout: 5_000 }).not.toBe("");
  return code;
}

function readOtp(phone: string): string {
  const log = readFileSync(".e2e/api.log", "utf8");
  const codes = [...log.matchAll(new RegExp(`\\[DEV SMS\\] \\${phone}: INBOLA: tasdiqlash kodi (\\d{6})`, "g"))];
  return codes.length ? codes[codes.length - 1][1] : "";
}

type Tokens = { access_token: string; refresh_token: string };

// Sessiyani UI'siz ochadi: kirish oqimining o'zi happy-path testida tekshirilgan.
export async function signInUser(page: Page, request: APIRequestContext, phone: string, firstName = "Sinov"): Promise<Tokens> {
  const sent = await request.post(`${API}/auth/otp/send`, { data: { phone_number: phone }, headers: viaProxy() });
  expect(sent.status(), await sent.text()).toBe(200);
  const res = await request.post(`${API}/auth/otp/verify`, { data: { phone_number: phone, code: await lastOtp(phone), first_name: firstName }, headers: viaProxy() });
  expect(res.status(), await res.text()).toBe(200);
  const tokens = (await res.json()) as Tokens;
  await storeSession(page, "inbola.session", tokens);
  return tokens;
}

export async function adminToken(request: APIRequestContext, credentials = ADMIN): Promise<Tokens> {
  const res = await request.post(`${API}/admin/auth/login`, { data: credentials, headers: viaProxy() });
  expect(res.status(), await res.text()).toBe(200);
  return (await res.json()) as Tokens;
}

export async function signInAdmin(page: Page, request: APIRequestContext, credentials = ADMIN): Promise<Tokens> {
  const tokens = await adminToken(request, credentials);
  await storeSession(page, "inbola.admin", tokens);
  return tokens;
}

async function storeSession(page: Page, key: string, tokens: Tokens) {
  // localStorage origin'ga bog'liq: avval shu saytning (ma'lumot so'ramaydigan) sahifasi ochiladi.
  await page.goto("/login");
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })]);
}

export const bearer = (tokens: Tokens) => ({ Authorization: `Bearer ${tokens.access_token}` });
