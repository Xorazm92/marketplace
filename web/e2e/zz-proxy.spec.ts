import { expect, test } from "@playwright/test";

// Fayl nomi ataylab oxirgi: bu test Next proxy manzilidan kelgan kirish urinishlari chegarasini
// (5/daq) tugatadi — undan keyin shu ishga tushirishda admin kirishi 429 oladi.
test("Next proxy: mijoz yuborgan X-Forwarded-For kirish chegarasini aylanib oʻta olmaydi", async ({ request }) => {
  const statuses: number[] = [];
  for (let i = 0; i < 8; i++) {
    const res = await request.post("/api/v1/admin/auth/login", {
      // Har soʻrovda "boshqa mijoz": backend shunga ishonsa, har biri alohida hisoblanadi.
      headers: { "X-Forwarded-For": `203.0.113.${i + 1}` },
      data: { phone_number: "+998900000000", password: `taxmin-${i}` },
    });
    statuses.push(res.status());
  }
  expect(statuses.every((s) => s === 401 || s === 429), statuses.join(",")).toBe(true);
  expect(statuses.filter((s) => s === 429).length, statuses.join(",")).toBeGreaterThanOrEqual(3);
});
