import { expect, test } from "@playwright/test";
import { lastOtp } from "./helpers";

// SHOTS=papka — dizaynni ko'z bilan tekshirish uchun asosiy qadamlarda skrinshot.
const shot = async (page: import("@playwright/test").Page, name: string) => {
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: true });
};


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
  await page.getByLabel("SMS kod").fill(await lastOtp());
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
  await page.getByLabel("Naqd, yetkazganda").check();
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

  // Yetkazilgan mahsulotga sharh qoldiradi
  await page.getByRole("link", { name: orderNumber }).click();
  await page.getByRole("link", { name: /Magnitli harflar/ }).click();
  await page.getByRole("button", { name: "Sharh yozish" }).click();
  await page.getByRole("button", { name: "4 yulduz" }).click();
  await page.getByLabel("Fikringiz").fill("Bolam juda yaxshi koʻrdi");
  await page.getByRole("button", { name: "Sharhni yuborish" }).click();
  await expect(page.getByText("Bolam juda yaxshi koʻrdi")).toBeVisible();
  await expect(page.getByText("Xarid qilgan")).toBeVisible();
  await shot(page, "product-review");
});

test("onlayn toʻlov: havola olinmasa ham bitta buyurtma; summa serverdan; login tashqi saytga yoʻnaltirmaydi", async ({ page }) => {
  // `/\host` brauzerda `//host` deb oʻqiladi — kirishdan keyin tashqi saytga ketmasligi kerak.
  await page.goto("/login?next=/%5Cexample.com");
  await page.getByLabel("Telefon raqam").fill("+998977770011");
  await page.getByRole("button", { name: "Kod olish" }).click();
  await page.getByLabel("SMS kod").fill(await lastOtp("+998977770011"));
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page.getByRole("heading", { name: "Bolangiz necha yoshda?" })).toBeVisible();
  expect(new URL(page.url()).host).toBe("localhost:5100");

  await page.goto("/p/demo-6");
  await page.getByRole("button", { name: "Savatga qoʻshish" }).click();
  await expect(page.getByText("Savatga qoʻshildi")).toBeVisible();
  await page.goto("/checkout");
  await page.getByLabel("Viloyat").selectOption({ label: "Toshkent shahri" });
  await page.getByLabel("Manzil", { exact: true }).fill("Yunusobod 4-kvartal, 7-uy");
  await page.getByRole("button", { name: "Manzilni saqlash" }).click();
  await page.getByLabel("Payme").check();

  // Buyurtma yaratildi, lekin toʻlov havolasi kelmadi: checkoutʼda qolib qayta bosish
  // ikkinchi buyurtma ochardi — foydalanuvchi buyurtma sahifasiga oʻtkaziladi.
  await page.route("**/api/v1/payments/checkout/*", (route) => route.fulfill({ status: 502, json: { message: "Server vaqtincha javob bermayapti" } }));
  await page.getByRole("button", { name: "Toʻlovga oʻtish" }).click();
  await expect(page).toHaveURL(/\/orders\/\d+\?pay=failed/);
  await expect(page.getByText("toʻlov sahifasi ochilmadi")).toBeVisible();
  await expect(page.getByText("Toʻlanmagan")).toBeVisible();
  const orderUrl = page.url();

  await page.goto("/orders");
  await expect(page.getByRole("link", { name: /^INB-/ })).toHaveCount(1);
  await page.goto("/cart");
  await expect(page.getByText("Savat boʻsh")).toBeVisible();

  // Qayta urinish: provayder manzili va summa serverdan (28 000 + 20 000 soʻm = 4 800 000 tiyin).
  await page.unroute("**/api/v1/payments/checkout/*");
  await page.goto(orderUrl);
  await page.getByRole("button", { name: "Toʻlash" }).click();
  await page.waitForURL(/\/e2e-payme\//);
  const params = Buffer.from(decodeURIComponent(page.url().split("/e2e-payme/")[1]), "base64").toString();
  expect(params).toMatch(/^m=e2e-merchant;ac\.order_id=\d+;a=4800000;c=http:\/\/localhost:5100\/orders\/\d+$/);
});

test("mehmon savat va buyurtmalar sahifasiga kira olmaydi", async ({ page }) => {
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/login\?next=%2Forders/);
});

test("mobil (375px): xaridor sahifalarida gorizontal scroll yoʻq", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/login");
  await page.getByLabel("Telefon raqam").fill("+998935550011");
  await page.getByRole("button", { name: "Kod olish" }).click();
  await expect(page.getByLabel("SMS kod")).toBeVisible();
  await page.getByLabel("SMS kod").fill(await lastOtp("+998935550011"));
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page.getByRole("link", { name: "Profil" })).toBeVisible();

  for (const path of ["/", "/catalog", "/catalog?age_months=48", "/p/demo-3", "/cart", "/checkout", "/orders", "/profile", "/login"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} gorizontal scroll`).toBeLessThanOrEqual(0);
    await shot(page, `mobile${path.replace(/[/?=]/g, "_")}`);
  }
});
