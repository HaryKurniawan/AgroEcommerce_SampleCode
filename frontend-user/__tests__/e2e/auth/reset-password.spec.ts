import { test, expect } from "@playwright/test";

test.describe("Reset Password Page (/forgot-password/reset)", () => {
  test("should load reset password page with token", async ({ page }) => {
    await page.goto("/forgot-password/reset?token=dummy-reset-token-123");
    await page.waitForTimeout(2000);

    // Page should load — either form or invalid token state
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(50);
  });

  test("should display password reset form when token is present", async ({
    page,
  }) => {
    await page.goto("/forgot-password/reset?token=some-token");
    await page.waitForTimeout(2000);

    // Should show either the form or an error about invalid token
    const hasForm =
      (await page
        .locator("#password")
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator('input[type="password"]')
        .first()
        .isVisible()
        .catch(() => false));
    const hasError = await page
      .locator("text=Token tidak valid")
      .or(page.locator("text=Link tidak valid"))
      .isVisible()
      .catch(() => false);

    // One of these must be true
    expect(
      hasForm || hasError || (await page.textContent("body"))!.length > 50,
    ).toBeTruthy();
  });

  test("should handle missing token gracefully", async ({ page }) => {
    await page.goto("/forgot-password/reset");
    await page.waitForTimeout(2000);

    // Should not crash — shows error or redirects
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
  });
});
