import { test, expect } from "@playwright/test";

import { generateTestEmail, ROUTES } from "../test-data";

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.register);
  });

  test("should display registration form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Daftar Akun");
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Daftar Sekarang",
    );
  });

  test("should show error for short name", async ({ page }) => {
    await page.locator("#name").fill("A");
    await page.locator("#email").fill("test@test.com");
    await page.locator("#password").fill("Test123!");
    await page.locator("#confirmPassword").fill("Test123!");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=at least 2 characters")).toBeVisible();
  });

  test("should show error for password mismatch", async ({ page }) => {
    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@test.com");
    await page.locator("#password").fill("Test123!");
    await page.locator("#confirmPassword").fill("Different!");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("should register and redirect to verify page", async ({ page }) => {
    const email = generateTestEmail();
    await page.locator("#name").fill("E2E Test User");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Test123!");
    await page.locator("#confirmPassword").fill("Test123!");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/register\/verify/, { timeout: 15000 });
    await expect(page.url()).toContain("/register/verify");
    await expect(page.url()).toContain(encodeURIComponent(email));
  });

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL("/login");
  });
});
