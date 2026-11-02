import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Seller Products Page", () => {
  test("should load seller products page", async ({ sellerPage: page }) => {
    await page.goto(ROUTES.sellerProduk);
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});
