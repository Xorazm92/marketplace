import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";

// SHOTS=papka — dizaynni ko'z bilan tekshirish uchun asosiy qadamlarda skrinshot.
const shot = async (page: import("@playwright/test").Page, name: string) => {
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: true });
};


function lastOtp(): string {
  const log = readFileSync(".e2e/api.log", "utf8");
  const codes = [...log.matchAll(/\[DEV SMS\] \+998901234567: INBOLA: tasdiqlash kodi (\d{6})/g)];
  if (!codes.length) throw new Error("OTP kodi log'da topilmadi");
  return codes[codes.length - 1][1];
}

test("xaridor: yosh → mahsulot → kirish → savat → naqd buyurtma; admin: yetkazildi", async ({ page }) => {
  // Bosh sahifadan yosh bo'yicha katalogga
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bolangiz necha yoshda?" })).toBeVisible();
  await page.getByRole("link", { name: /3–5/ }).click();
  await expect(page).toHaveURL(/age_months=48/);

  // Mahsulot sahifasi; mehmon savatga qo'shmoqchi bo'lsa kirishga yo'naltiriladi
  await page.getByRole("link", { name: /Magnitli harflar/ }).click();
  await expect(page.getByRole("heading", { name: /Magnitli harflar/ })).toBeVisible();
  await page.getByRole("button", { name: "Savatga qoʻshish" }).click();
  await expect(page).toHaveURL(/\/login\?next=/);

  // SMS kod bilan kirish (yangi hisob)
  await page.getByLabel("Telefon raqam").fill("90 123 45 67");
  await page.getByRole("button", { name: "Kod olish" }).click();
  await expect(page.getByLabel("SMS kod")).toBeVisible();
  await page.getByLabel("SMS kod").fill(lastOtp());
  await page.getByLabel("Ismingiz").fill("Dilnoza");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page.getByRole("heading", { name: /Magnitli harflar/ })).toBeVisible();

  // Savatga ikki dona
  await page.getByRole("button", { name: "Koʻpaytirish" }).click();
  await page.getByRole("button", { name: "Savatga qoʻshish" }).click();
  await expect(page.getByText("Savatga qoʻshildi")).toBeVisible();
  await page.getByRole("link", { name: /Savat/ }).first().click();
  await expect(page.getByText("130 000 soʻm").first()).toBeVisible();

  // Rasmiylashtirish: manzil + naqd
  await page.getByRole("link", { name: "Rasmiylashtirish" }).click();
  await page.getByLabel("Viloyat").selectOption({ label: "Toshkent shahri" });
  await page.getByLabel("Tuman").selectOption({ label: "Chilonzor" });
  await page.getByLabel("Manzil", { exact: true }).fill("Chilonzor 9-kvartal, 12-uy");
  await page.getByRole("button", { name: "Manzilni saqlash" }).click();
  await expect(page.getByText("Chilonzor 9-kvartal, 12-uy")).toBeVisible();
  await expect(page.getByText("Naqd, yetkazganda")).toBeVisible();
  // 130 000 + 20 000 yetkazish
  await expect(page.getByText("150 000 soʻm")).toBeVisible();
  await shot(page, "checkout");
  await page.getByRole("button", { name: "Buyurtma berish" }).click();

  await expect(page.getByText("Buyurtma qabul qilindi")).toBeVisible();
  const orderNumber = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  expect(orderNumber).toMatch(/^INB-/);
  await expect(page.getByText("150 000 soʻm")).toBeVisible();
  await shot(page, "order");

  // Admin: tasdiqlash → yo'lda → yetkazildi (naqd pul olindi)
  await page.goto("/admin/login");
  await page.getByLabel("Telefon raqam").fill("+998909990000");
  await page.getByLabel("Parol").fill("e2e-admin-password");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page.getByRole("heading", { name: "Umumiy holat" })).toBeVisible();
  await shot(page, "admin-dashboard");
  await page.getByRole("link", { name: "Buyurtmalar", exact: true }).click();
  await page.getByRole("link", { name: orderNumber }).click();
  for (const status of ["Tasdiqlandi", "Yoʻlda", "Yetkazildi"]) {
    await page.getByRole("button", { name: status }).click();
    await expect(page.getByText(status).first()).toBeVisible();
  }
  await expect(page.getByText("Bu buyurtma yakunlangan.")).toBeVisible();
  await shot(page, "admin-order");
  await expect(page.getByText("Toʻlangan").first()).toBeVisible();

  // Xaridor o'z buyurtmasida yangi holatni ko'radi
  await page.goto("/orders");
  await expect(page.getByText(orderNumber)).toBeVisible();
  await expect(page.getByText("Yetkazildi")).toBeVisible();
});

test("mehmon savat va buyurtmalar sahifasiga kira olmaydi", async ({ page }) => {
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/login\?next=%2Forders/);
});
