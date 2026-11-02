import { test, expect } from "@playwright/test";

import { ROUTES } from "../test-data";

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.forgotPassword);
  });

  test("should display forgot password form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Lupa Password");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Kirim Link Reset",
    );
  });

  test("should submit email and show success state", async ({ page }) => {
    await page.locator("#email").fill("test@test.com");
    await page.locator('button[type="submit"]').click();
    // Tunggu state berubah ke "Email Terkirim!"
    await expect(page.locator("text=Email Terkirim!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should have back to login link", async ({ page }) => {
    const backLink = page.locator('a[href="/login"]');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/login");
  });
});
