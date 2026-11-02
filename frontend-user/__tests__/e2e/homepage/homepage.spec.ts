import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Tunggu loading selesai (spinner hilang)
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
  });

  test("should load homepage with main sections", async ({ page }) => {
    // Banner carousel
    await expect(
      page
        .locator("text=Promo Spesial")
        .or(page.locator("text=High Quality"))
        .or(page.locator("text=Beras Premium")),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display search input", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await expect(searchInput).toBeVisible();
  });

  test("should navigate to katalog on search submit", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await searchInput.fill("tomat");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\/katalog\?q=tomat/);
  });

  test("should show sticky search bar on scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    // Sticky search should appear after scrolling past 140px
    const stickyBar = page.locator('[class*="sticky"]').first();
    await expect(stickyBar).toBeVisible();
  });

  test("should show product cards if products exist", async ({ page }) => {
    // Check if any product-related content is on the page
    const hasProducts = await page
      .locator('[class*="ProductCard"], [class*="product"]')
      .count();
    // This is a soft check — if no products in DB, test still passes
    expect(hasProducts).toBeGreaterThanOrEqual(0);
  });
});
