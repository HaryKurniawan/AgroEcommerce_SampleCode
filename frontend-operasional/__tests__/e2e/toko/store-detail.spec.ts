import { test, expect } from "@playwright/test";

import { ROUTES } from "../test-data";

test.describe("Store Detail Page", () => {
  test("should navigate from store list to detail", async ({ page }) => {
    await page.goto(ROUTES.toko);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const storeLink = page.locator('a[href*="/toko/"]').first();
    const hasStore = await storeLink.isVisible().catch(() => false);

    if (!hasStore) {
      test.skip(true, "No stores in database");
      return;
    }

    await storeLink.click();
    await expect(page).toHaveURL(/\/toko\/.+/);
  });
});
