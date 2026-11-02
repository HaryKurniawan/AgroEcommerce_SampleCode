import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Checkout Page", () => {
  test("should show empty state or checkout content", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.checkout);
    await page.waitForTimeout(3000);

    const hasCheckoutHeader = await page
      .locator("text=Checkout")
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .locator("text=Checkout Kosong")
      .isVisible()
      .catch(() => false);

    expect(hasCheckoutHeader || hasEmptyState).toBeTruthy();
  });

  test("should display checkout header with back button", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.checkout);
    await page.waitForTimeout(3000);

    const header = page.locator('h1:has-text("Checkout")');
    await expect(header).toBeVisible();
  });
});
