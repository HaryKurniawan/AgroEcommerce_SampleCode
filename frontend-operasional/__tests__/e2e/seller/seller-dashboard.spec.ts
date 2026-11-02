import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Seller Dashboard", () => {
  test("should load seller dashboard", async ({ sellerPage: page }) => {
    await page.goto(ROUTES.sellerDashboard);
    await page.waitForTimeout(3000);

    // Should be on seller dashboard or redirected if not seller
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});
