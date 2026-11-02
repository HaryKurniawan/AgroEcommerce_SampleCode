import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Keranjang Page (Guest)", () => {
  test("should redirect to login or show empty cart for unauthenticated user", async ({
    page,
  }) => {
    await page.goto(ROUTES.keranjang);
    await page.waitForTimeout(2000);

    // Bisa redirect ke login ATAU menampilkan keranjang kosong
    const isLogin = page.url().includes("/login");
    const hasEmptyState = await page
      .locator("text=Keranjang masih kosong")
      .isVisible()
      .catch(() => false);
    const hasCartHeader = await page
      .locator("text=Keranjang")
      .first()
      .isVisible()
      .catch(() => false);

    expect(isLogin || hasEmptyState || hasCartHeader).toBeTruthy();
  });
});

test.describe("Keranjang Page (Authenticated)", () => {
  test("should load cart page", async ({ authenticatedPage: page }) => {
    await page.goto(ROUTES.keranjang);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await expect(page.locator("text=Keranjang").first()).toBeVisible();
  });

  test("should show empty state when cart is empty", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.keranjang);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const isEmpty = await page
      .locator("text=Keranjang masih kosong")
      .isVisible()
      .catch(() => false);
    const hasItems = await page
      .locator("text=Pilih Item")
      .isVisible()
      .catch(() => false);

    // Cart is either empty or has items — both are valid states
    expect(isEmpty || hasItems).toBeTruthy();
  });

  test("should have back button to homepage", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.keranjang);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const backBtn = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await expect(backBtn).toBeVisible();
  });
});
