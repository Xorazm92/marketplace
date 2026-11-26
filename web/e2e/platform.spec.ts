import { expect, test } from "@playwright/test";
import { API } from "./helpers";

test("ochiq katalog: web server IPʼsi umumiy chegaraga tushmaydi (SSR 300/daq dan keyin 500 berardi)", async ({ request }) => {
  // Web server barcha xaridorlar nomidan bitta IPʼdan soʻraydi. Backend buni bitta mijoz deb
  // hisoblab 300-soʻrovdan keyin 429 qaytarardi va mahsulot sahifalari hammaga 500 boʻlardi.
  for (const path of ["/products/demo-1", "/products?limit=8", "/category", "/reviews/product/1/stats"]) {
    const statuses: Record<number, number> = {};
    for (let batch = 0; batch < 16; batch++) {
      const results = await Promise.all(Array.from({ length: 20 }, () => request.get(`${API}${path}`)));
      for (const res of results) statuses[res.status()] = (statuses[res.status()] ?? 0) + 1;
    }
    expect(statuses, path).toEqual({ 200: 320 });
  }
});

test("xavfsizlik sarlavhalari va CSP: sahifalar buzilmasdan ishlaydi", async ({ page, request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  const csp = headers["content-security-policy"] ?? "";
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) {
    expect(csp, directive).toContain(directive);
  }
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();

  // CSP sahifaning oʻzini sindirmasin: brauzer bloklagan har resurs konsolga yoziladi.
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/content security policy/i.test(message.text())) violations.push(message.text());
  });
  page.on("pageerror", (error) => violations.push(String(error)));
  for (const path of ["/", "/catalog", "/p/demo-1", "/login", "/cart", "/admin/login"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  await expect(page.getByRole("heading", { name: "Admin kirishi" })).toBeVisible();
  expect(violations).toEqual([]);
});

test("robots.txt: shaxsiy va admin sahifalar indekslanmaydi; 404 sahifa oʻzbekcha", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const path of ["/admin", "/cart", "/checkout", "/orders", "/profile", "/api/"]) {
    expect(robots).toContain(`Disallow: ${path}`);
  }
  const missing = await page.goto("/p/bunday-mahsulot-yoq");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Bu sahifa topilmadi" })).toBeVisible();
});
