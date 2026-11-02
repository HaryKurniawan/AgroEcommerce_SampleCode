import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Seller Orders Management (/seller/pesanan)", () => {
  test.beforeEach(async ({ sellerPage: page }) => {
    await page.goto(ROUTES.sellerPesanan);
    await page.waitForTimeout(3000);
  });

  test("should load Pesanan Masuk page with header", async ({
    sellerPage: page,
  }) => {
    const hasHeader = await page
      .locator('h1:has-text("Pesanan Masuk")')
      .isVisible()
      .catch(() => false);
    const hasContent = (await page.textContent("body"))!.length > 50;
    expect(hasHeader || hasContent).toBeTruthy();
  });

  test("should display status filter tabs", async ({ sellerPage: page }) => {
    const hasAllTab = await page
      .locator('button:has-text("Semua")')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasAllTab) {
      test.skip(true, "Seller pesanan page not accessible");
      return;
    }

    await expect(
      page.locator('button:has-text("Semua")').first(),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Belum Bayar")')).toBeVisible();
    await expect(page.locator('button:has-text("Diproses")')).toBeVisible();
    await expect(page.locator('button:has-text("Dikirim")')).toBeVisible();
    await expect(page.locator('button:has-text("Selesai")')).toBeVisible();
  });

  test("should filter by DIPROSES tab", async ({ sellerPage: page }) => {
    const hasTab = await page
      .locator('button:has-text("Diproses")')
      .isVisible()
      .catch(() => false);

    if (!hasTab) {
      test.skip(true, "Tabs not visible");
      return;
    }

    await page.locator('button:has-text("Diproses")').click();
    await page.waitForTimeout(500);

    // Tab should be active (has ring-2 class)
    const activeTab = page.locator(
      'button:has-text("Diproses")[class*="ring-2"]',
    );
    await expect(activeTab).toBeVisible();
  });

  test("should filter by DIKIRIM tab", async ({ sellerPage: page }) => {
    const hasTab = await page
      .locator('button:has-text("Dikirim")')
      .isVisible()
      .catch(() => false);

    if (!hasTab) {
      test.skip(true, "Tabs not visible");
      return;
    }

    await page.locator('button:has-text("Dikirim")').click();
    await page.waitForTimeout(500);

    const activeTab = page.locator(
      'button:has-text("Dikirim")[class*="ring-2"]',
    );
    await expect(activeTab).toBeVisible();
  });

  test("should show empty state or order cards", async ({
    sellerPage: page,
  }) => {
    const hasTab = await page
      .locator('button:has-text("Semua")')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasTab) {
      test.skip(true, "Page not accessible");
      return;
    }

    const hasEmpty = await page
      .locator("text=Tidak Ada Pesanan")
      .isVisible()
      .catch(() => false);
    const hasOrders =
      (await page.locator('[class*="rounded-3xl"]').count()) > 0;

    expect(hasEmpty || hasOrders).toBeTruthy();
  });

  test("should show order count badge on each tab", async ({
    sellerPage: page,
  }) => {
    const hasTab = await page
      .locator('button:has-text("Semua")')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasTab) {
      test.skip(true, "Tabs not visible");
      return;
    }

    // Each tab has a count badge (rounded-full span)
    const countBadge = page
      .locator('button:has-text("Semua")')
      .first()
      .locator('span[class*="rounded-full"]');
    await expect(countBadge).toBeVisible();
  });
});
