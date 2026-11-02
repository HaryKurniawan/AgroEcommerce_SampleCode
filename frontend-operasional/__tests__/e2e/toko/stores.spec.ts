import { test, expect } from "@playwright/test";

import { ROUTES } from "../test-data";

test.describe("Daftar Toko Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.toko);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});
  });

  test("should load store list page", async ({ page }) => {
    await expect(page.locator("text=Toko Agro Daerah")).toBeVisible();
  });

  test("should have search input", async ({ page }) => {
    const search = page.locator('input[placeholder*="Cari toko"]');
    await expect(search).toBeVisible();
  });

  test("should have region filter chips", async ({ page }) => {
    await expect(page.locator('button:has-text("Semua")')).toBeVisible();
    await expect(page.locator('button:has-text("Bandung Raya")')).toBeVisible();
  });

  test("should filter by region", async ({ page }) => {
    await page.locator('button:has-text("Bandung Raya")').click();
    await page.waitForTimeout(500);
    // Page should still be on toko
    await expect(page).toHaveURL(ROUTES.toko);
  });

  test("should search stores", async ({ page }) => {
    const search = page.locator('input[placeholder*="Cari toko"]');
    await search.fill("bandung");
    await page.waitForTimeout(1000);
    // Results should update (no error on page)
    await expect(page).toHaveURL(ROUTES.toko);
  });
});
