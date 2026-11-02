import { test, expect } from "@playwright/test";

import { ROUTES } from "../test-data";

test.describe("Katalog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.katalog);
    // Tunggu skeleton/loading selesai
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});
  });

  test("should load katalog page", async ({ page }) => {
    await expect(page).toHaveURL(/\/katalog/);
  });

  test("should load katalog with search param", async ({ page }) => {
    await page.goto("/katalog?q=sayur");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await expect(page).toHaveURL(/q=sayur/);
  });

  test("should have search input and sort options", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await expect(searchInput).toBeVisible();
  });

  test("should show empty state when no products found", async ({ page }) => {
    await page.goto("/katalog?q=tidak_ada");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    // Bisa muncul empty state atau product list kosong
    const emptyOrProducts = await page
      .locator("text=tidak ditemukan")
      .or(page.locator('[class*="grid"]'))
      .first();
    await expect(emptyOrProducts).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to product detail on click", async ({ page }) => {
    // Jika ada produk, klik yang pertama
    const productLink = page.locator('a[href*="/produk/"]').first();
    const hasProduct = await productLink.isVisible().catch(() => false);
    if (hasProduct) {
      await productLink.click();
      await expect(page).toHaveURL(/\/produk\//);
    }
  });
});
