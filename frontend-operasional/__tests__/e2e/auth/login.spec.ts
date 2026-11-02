import { test, expect } from "@playwright/test";

import { TEST_CUSTOMER, ROUTES } from "../test-data";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login);
  });

  test("should display login form with email and password fields", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toContainText("Login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.locator("#email").fill("invalid-email");
    await page.locator("#password").fill("Test123!");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=Format email tidak valid")).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.locator("#email").fill("user@test.com");
    await page.locator("#password").fill("12");
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator("text=Password minimal 6 karakter"),
    ).toBeVisible();
  });

  test("should show error message on failed login", async ({ page }) => {
    await page.locator("#email").fill("wrong@email.com");
    await page.locator("#password").fill("WrongPass123");
    await page.locator('button[type="submit"]').click();
    // Tunggu error muncul (dari API response)
    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 10000 });
  });

  test("should login successfully and redirect to homepage", async ({
    page,
  }) => {
    await page.locator("#email").fill(TEST_CUSTOMER.email);
    await page.locator("#password").fill(TEST_CUSTOMER.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("/", { timeout: 15000 });
    await expect(page).toHaveURL("/");
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Klik tombol toggle (eye icon button)
    await page
      .locator("#password ~ button, button:has(svg):near(#password)")
      .first()
      .click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("should have link to forgot password page", async ({ page }) => {
    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toContainText("Lupa password");
  });

  test("should have link to register page", async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL("/register");
  });

  test("should have Google OAuth button", async ({ page }) => {
    const googleBtn = page.locator("text=Masuk dengan Google");
    await expect(googleBtn).toBeVisible();
  });
});
