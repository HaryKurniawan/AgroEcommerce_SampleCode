import { test, expect } from "@playwright/test";

test.describe("Email Verification Page (/register/verify)", () => {
  const VERIFY_URL = "/register/verify?email=test%40example.com";

  test.beforeEach(async ({ page }) => {
    await page.goto(VERIFY_URL);
    await page.waitForTimeout(1000);
  });

  test("should display Cek Email Anda heading", async ({ page }) => {
    await expect(page.locator('h1:has-text("Cek Email Anda")')).toBeVisible();
  });

  test("should display the email address passed in URL param", async ({
    page,
  }) => {
    await expect(page.locator("text=test@example.com")).toBeVisible();
  });

  test("should display 3-step indicator (Daftar, Verifikasi Email, Masuk)", async ({
    page,
  }) => {
    await expect(page.locator("text=Daftar")).toBeVisible();
    await expect(page.locator("text=Verifikasi Email")).toBeVisible();
    await expect(page.locator("text=Masuk")).toBeVisible();
  });

  test("should display Buka Aplikasi Email link", async ({ page }) => {
    const emailLink = page.locator('a:has-text("Buka Aplikasi Email")');
    await expect(emailLink).toBeVisible();
  });

  test("should display Kirim Ulang Email button", async ({ page }) => {
    const resendBtn = page.locator('button:has-text("Kirim Ulang Email")');
    await expect(resendBtn).toBeVisible();
    // Button should not be disabled initially
    await expect(resendBtn).not.toBeDisabled();
  });

  test("should display Kembali ke Login button", async ({ page }) => {
    const backBtn = page.locator('button:has-text("Kembali ke Login")');
    await expect(backBtn).toBeVisible();
  });

  test("should navigate to /login on Kembali ke Login click", async ({
    page,
  }) => {
    await page.locator('button:has-text("Kembali ke Login")').click();
    await expect(page).toHaveURL("/login");
  });

  test("should expand DEV OPTIONS when toggled", async ({ page }) => {
    const devToggle = page.locator("text=DEV OPTIONS");
    await expect(devToggle).toBeVisible();

    await devToggle.click();
    await expect(
      page.locator("text=Simulasi: Email Sudah Diverifikasi"),
    ).toBeVisible();
  });

  test("should show Agro Jabar Market brand logo", async ({ page }) => {
    await expect(page.locator("text=Agro Jabar Market")).toBeVisible();
  });
});
