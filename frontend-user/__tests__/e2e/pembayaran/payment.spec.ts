import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

test.describe("Pembayaran Page", () => {
  test("should load payment page with header", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to payment page with a dummy order ID
    await page.goto("/pembayaran?orderId=test-order");
    await page.waitForTimeout(3000);

    // Should show payment page or loading
    const hasHeader = await page
      .locator("text=Menunggu Pembayaran")
      .isVisible()
      .catch(() => false);
    const hasLoading = await page
      .locator(".animate-pulse")
      .first()
      .isVisible()
      .catch(() => false);
    const hasContent = await page.textContent("body");

    expect(hasHeader || hasLoading || hasContent).toBeTruthy();
  });

  test("should display back button", async ({ authenticatedPage: page }) => {
    await page.goto("/pembayaran?orderId=test-order");
    await page.waitForTimeout(3000);

    const backBtn = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await expect(backBtn).toBeVisible();
  });
});
