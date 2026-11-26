import { expect, test } from "@playwright/test";
import { ADMIN, API, adminToken, bearer, signInAdmin } from "./helpers";

test("admin: ixtiyoriy maydon boʻshatiladi; zaxira faqat koʻrilgan qiymat oʻzgarmagan boʻlsa yoziladi", async ({ page, request }) => {
  const admin = await signInAdmin(page, request);
  await page.goto("/admin/products");
  await page.getByRole("link", { name: /Konstruktor "Shahar"/ }).click();
  await page.waitForURL(/\/admin\/products\/\d+$/);
  const productId = Number(page.url().split("/").pop());

  // Eski narx (chegirma) olib tashlanadi — ilgari boʻsh maydon yuborilmasdi va qiymat qolaverardi.
  await expect(page.getByLabel("Eski narx")).toHaveValue("290000");
  await page.getByLabel("Eski narx").fill("");
  await page.getByLabel("Material").fill("");
  await page.getByRole("button", { name: "Saqlash" }).click();
  await expect(page.getByText("Saqlandi")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nomi")).toHaveValue(/Konstruktor/);
  await expect(page.getByLabel("Eski narx")).toHaveValue("");
  const savedRes = await request.get(`${API}/admin/products/${productId}`, { headers: bearer(admin) });
  expect(savedRes.status(), await savedRes.text()).toBe(200);
  const saved = await savedRes.json();
  expect([saved.original_price, saved.discount_percentage, saved.price]).toEqual([null, 0, 245000]);

  // Zaxira: oddiy yangilash.
  await expect(page.getByLabel("Zaxira soni")).toHaveValue("8");
  await page.getByLabel("Zaxira soni").fill("12");
  await page.getByRole("button", { name: "Yangilash" }).click();
  await expect(page.getByText("Zaxira yangilandi")).toBeVisible();

  // Sahifa ochiq turganda zaxira boshqa joydan oʻzgardi (masalan buyurtma tushdi):
  // admin kiritgan son eski qiymat ustidan yozilmaydi, ekranda yangi qiymat koʻrsatiladi.
  const changed = await request.put(`${API}/admin/products/${productId}/stock`, { headers: bearer(admin), data: { stock_quantity: 20, expected_quantity: 12 } });
  expect(changed.status()).toBe(200);
  await page.getByLabel("Zaxira soni").fill("15");
  await page.getByRole("button", { name: "Yangilash" }).click();
  await expect(page.getByText(/hozir 20 dona/)).toBeVisible();
  await expect(page.getByLabel("Zaxira soni")).toHaveValue("20");
  const after = await (await request.get(`${API}/admin/products/${productId}`, { headers: bearer(admin) })).json();
  expect(after.stock_quantity).toBe(20);
});

test("moderator: faqat mahsulot kontenti; buyurtma, xaridor va narx yopiq", async ({ page, request }) => {
  const root = await adminToken(request);
  const moderator = { phone_number: "+998909990077", password: "e2e-moderator-password" };
  const created = await request.post(`${API}/admin/admins`, { headers: bearer(root), data: { ...moderator, first_name: "Mod", last_name: "Erator", role: "MODERATOR" } });
  expect(created.status(), await created.text()).toBe(201);

  await signInAdmin(page, request, moderator);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("link", { name: "Mahsulotlar" })).toBeVisible();
  for (const hidden of ["Buyurtmalar", "Xaridorlar", "Boʻlimlar", "Umumiy holat", "Adminlar"]) {
    await expect(page.getByRole("link", { name: hidden, exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole("link", { name: "Mahsulot qoʻshish" })).toHaveCount(0);

  await page.getByRole("link", { name: /Plastilin/ }).click();
  await expect(page.getByLabel("Narx, soʻm")).toBeDisabled();
  await expect(page.getByLabel("Eski narx")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Oʻchirish" })).toHaveCount(0);
  await expect(page.getByLabel("Zaxira soni")).toHaveCount(0);
  await page.getByLabel("Qisqa tavsif").fill("12 xil rang, yumshoq");
  await page.getByRole("button", { name: "Saqlash" }).click();
  await expect(page.getByText("Saqlandi")).toBeVisible();

  // Manzilni qoʻlda terish ham ochmaydi: toʻsiq serverda.
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/products$/);
  expect(ADMIN.phone_number).not.toBe(moderator.phone_number);
});
