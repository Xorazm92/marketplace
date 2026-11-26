import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, signInUser } from "./helpers";

// Payme oʻrnida testning oʻzi: provayder serverdan-serverga yuboradigan soʻrovlar (Merchant API)
// shu ishga tushirish uchun yaratilgan tasodifiy kalit bilan yuboriladi. Haqiqiy sandbox emas —
// protokolning biz tomondagi yarmi va brauzerdagi oqim tekshiriladi.
const paymeAuth = "Basic " + Buffer.from(`Paycom:${process.env.E2E_PAYME_KEY}`).toString("base64");
const payme = async (request: APIRequestContext, method: string, params: object) =>
  (await (await request.post(`${API}/payments/payme`, { headers: { Authorization: paymeAuth }, data: { jsonrpc: "2.0", id: 1, method, params } })).json()) as {
    result?: Record<string, unknown>;
    error?: { code: number };
  };

async function checkoutWithPayme(page: Page, slug: string) {
  await page.goto(`/p/${slug}`);
  await page.getByRole("button", { name: "Savatga qoʻshish" }).click();
  await expect(page.getByText("Savatga qoʻshildi")).toBeVisible();
  await page.goto("/checkout");
  await page.getByLabel("Viloyat").selectOption({ label: "Toshkent shahri" });
  await page.getByLabel("Manzil", { exact: true }).fill("Mirobod, 5-uy");
  await page.getByRole("button", { name: "Manzilni saqlash" }).click();
  await expect(page.getByText("Mirobod, 5-uy")).toBeVisible();
  await page.getByLabel("Payme").check();
  await page.getByRole("button", { name: "Toʻlovga oʻtish" }).click();
  await page.waitForURL(/\/e2e-payme\//);
  // Provayder sahifasiga faqat server bergan parametrlar bilan boriladi.
  const params = Buffer.from(decodeURIComponent(page.url().split("/e2e-payme/")[1]), "base64").toString();
  const [, orderId, amount, returnUrl] = params.match(/ac\.order_id=(\d+);a=(\d+);c=(.+)$/)!;
  return { account: { order_id: orderId }, amount: Number(amount), returnPath: new URL(returnUrl).pathname };
}

test("onlayn toʻlov: checkout → provayder → toʻlov tasdigʻi → buyurtma holati oʻzi yangilanadi", async ({ page, request }) => {
  await signInUser(page, request, "+998941110001", "Toʻlovchi");
  const order = await checkoutWithPayme(page, "demo-4"); // 45 000 + 20 000 yetkazish
  expect(order.amount).toBe(6_500_000);

  // Xaridor toʻlov sahifasida turibdi; biz tomonda hali hech narsa toʻlanmagan.
  expect((await payme(request, "CheckPerformTransaction", { amount: 100, account: order.account })).error?.code).toBe(-31001);
  expect((await payme(request, "CheckPerformTransaction", { amount: order.amount, account: order.account })).result).toEqual({ allow: true });
  expect((await payme(request, "CreateTransaction", { id: "e2e-pay-1", time: Date.now(), amount: order.amount, account: order.account })).result?.state).toBe(1);

  // Xaridor callback kelishidan OLDIN qaytdi: sahifa "toʻlanmagan" koʻrsatadi va oʻzi qayta soʻraydi.
  await page.goto(order.returnPath);
  await expect(page.getByText("Toʻlanmagan")).toBeVisible();
  expect((await payme(request, "PerformTransaction", { id: "e2e-pay-1" })).result?.state).toBe(2);
  await expect(page.getByText("Toʻlangan")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Tasdiqlandi").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Toʻlash" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bekor qilish" })).toHaveCount(0);

  // Takroriy callback hech narsani oʻzgartirmaydi; buyurtmalar roʻyxatida bitta toʻlangan buyurtma.
  expect((await payme(request, "PerformTransaction", { id: "e2e-pay-1" })).result?.state).toBe(2);
  await page.goto("/orders");
  await expect(page.getByRole("link", { name: /^INB-/ })).toHaveCount(1);
  await expect(page.getByText("Tasdiqlandi")).toBeVisible();
});

test("toʻlov boshlangach bekor qilingan buyurtma: kechikkan toʻlov rad etiladi, buyurtma bekorligicha qoladi", async ({ page, request }) => {
  await signInUser(page, request, "+998941110002", "Bekorchi");
  const order = await checkoutWithPayme(page, "demo-2");
  expect((await payme(request, "CreateTransaction", { id: "e2e-pay-2", time: Date.now(), amount: order.amount, account: order.account })).result?.state).toBe(1);

  // Xaridor toʻlov oynasidan qaytib, buyurtmani bekor qiladi.
  await page.goto(order.returnPath);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Bekor qilish" }).click();
  await expect(page.getByText("Bekor qilindi").first()).toBeVisible();
  await expect(page.getByText("Sabab: Mijoz bekor qildi")).toBeVisible();

  // Provayder pulni yechib boʻlgan boʻlsa ham biz "bajarildi" demaymiz: Payme -31008 ni olib pulni qaytaradi.
  expect((await payme(request, "PerformTransaction", { id: "e2e-pay-2" })).error?.code).toBe(-31008);
  expect((await payme(request, "CancelTransaction", { id: "e2e-pay-2", reason: 3 })).result?.state).toBe(-1);
  await page.reload();
  await expect(page.getByText("Bekor qilindi").first()).toBeVisible();
  await expect(page.getByText("Toʻlanmagan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toʻlash" })).toHaveCount(0);
});
