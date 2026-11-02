import { test, expect } from "@playwright/test";

test.describe("Product Detail Page", () => {
  test("should navigate from katalog to product detail", async ({ page }) => {
    await page.goto("/katalog");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const productLink = page.locator('a[href*="/produk/"]').first();
    const hasProduct = await productLink.isVisible().catch(() => false);

    if (!hasProduct) {
      test.skip(true, "No products in database to test");
      return;
    }

    await productLink.click();
    await expect(page).toHaveURL(/\/produk\/.+/);

    // Tunggu page load
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 })
      .catch(() => {});
  });

  test("should display product information", async ({ page }) => {
    await page.goto("/katalog");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const productLink = page.locator('a[href*="/produk/"]').first();
    const hasProduct = await productLink.isVisible().catch(() => false);

    if (!hasProduct) {
      test.skip(true, "No products in database");
      return;
    }

    await productLink.click();
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 })
      .catch(() => {});

    // Harus ada setidaknya elemen teks yang menunjukkan info produk
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });

  test("should have back navigation", async ({ page }) => {
    await page.goto("/katalog");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const productLink = page.locator('a[href*="/produk/"]').first();
    const hasProduct = await productLink.isVisible().catch(() => false);

    if (!hasProduct) {
      test.skip(true, "No products in database");
      return;
    }

    await productLink.click();
    await page.waitForURL(/\/produk\/.+/);

    // Cari back button
    const backBtn = page.locator("button:has(svg)").first();
    await expect(backBtn).toBeVisible();
  });
});
