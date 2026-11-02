import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Seller Orders Page", () => {
  test("should load seller orders page", async ({ sellerPage: page }) => {
    await page.goto(ROUTES.sellerPesanan);
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});
