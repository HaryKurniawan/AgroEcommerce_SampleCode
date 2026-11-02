import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Pesanan Page (Unauthenticated)", () => {
  test("should redirect to login", async ({ page }) => {
    await page.goto(ROUTES.pesanan);
    await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
    expect(page.url()).toContain("/login");
  });
});

test.describe("Pesanan Page (Authenticated)", () => {
  test("should load orders page with tabs", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.pesanan);
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(
      page.locator("h1").filter({ hasText: "Pesanan Saya" }),
    ).toBeVisible();

    // Tab buttons should be visible
    await expect(page.locator("text=Semua")).toBeVisible();
    await expect(page.locator("text=Belum Bayar")).toBeVisible();
    await expect(page.locator("text=Dikemas")).toBeVisible();
    await expect(page.locator("text=Dikirim")).toBeVisible();
    await expect(page.locator("text=Selesai")).toBeVisible();
  });

  test("should filter by tab", async ({ authenticatedPage: page }) => {
    await page.goto(ROUTES.pesanan);
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    // Klik tab "Dikirim"
    await page.locator('button:has-text("Dikirim")').click();
    await page.waitForTimeout(1000);

    // Page should still be on pesanan
    await expect(page).toHaveURL(/\/pesanan/);
  });

  test("should show empty state or order list", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.pesanan);
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOrders = await page
      .locator('[role="button"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .locator("text=Belum ada pesanan")
      .isVisible()
      .catch(() => false);

    expect(hasOrders || hasEmpty).toBeTruthy();
  });
});
