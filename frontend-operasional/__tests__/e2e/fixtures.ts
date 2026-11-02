import { test as base, expect, Page } from "@playwright/test";

import { TEST_CUSTOMER, TEST_SELLER } from "./test-data";

/**
 * Helper: Login via UI dan tunggu redirect selesai.
 */
async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();
  // Tunggu sampai navigasi keluar dari /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });
}

/**
 * Custom fixtures untuk E2E test.
 */
export const test = base.extend<{
  authenticatedPage: Page;
  sellerPage: Page;
}>({
  /** Page yang sudah login sebagai CUSTOMER */
  authenticatedPage: async ({ page }, run) => {
    await loginViaUI(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    await run(page);
  },

  /** Page yang sudah login sebagai SELLER */
  sellerPage: async ({ page }, run) => {
    await loginViaUI(page, TEST_SELLER.email, TEST_SELLER.password);
    await run(page);
  },
});

export { expect };
