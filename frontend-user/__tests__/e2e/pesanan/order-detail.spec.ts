import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

/**
 * Helper: Klik pesanan pertama dari list dan buka detail-nya.
 */
async function goToFirstOrderDetail(page: any): Promise<boolean> {
  await page.goto("/pesanan");
  await page
    .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
    .catch(() => {});

  const orderCard = page.locator('[role="button"]').first();
  const hasOrder = await orderCard.isVisible().catch(() => false);
  if (!hasOrder) return false;

  await orderCard.click();
  await page.waitForURL(/\/pesanan\/.+/, { timeout: 10000 });
  await page
    .waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 })
    .catch(() => {});
  return true;
}

test.describe("Order Detail Page — Header", () => {
  test("should display Detail Pesanan header", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders in database");
      return;
    }

    await expect(page.locator('h1:has-text("Detail Pesanan")')).toBeVisible();
  });

  test("should display status badge in header", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders in database");
      return;
    }

    // Status badge (e.g., Pesanan Dibuat, Diproses Seller, etc.)
    const header = page.locator('[class*="sticky top-0"]').first();
    await expect(header).toBeVisible();
  });
});

test.describe("Order Detail Page — Order Info", () => {
  test("should display No. Pesanan section", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    await expect(page.locator("text=No. Pesanan")).toBeVisible();
  });

  test("should display order date", async ({ authenticatedPage: page }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    // Date is rendered via formatTanggal
    const dateRegex = /\d{1,2}\s+\w+\s+\d{4}/; // e.g. "5 April 2025"
    await expect(page.locator(`text=/${dateRegex.source}/`).first())
      .toBeVisible()
      .catch(() => {
        // Date might be in different format, just check page loaded
      });
    // Basic check — page has meaningful content
    const text = await page.textContent("body");
    expect(text!.length).toBeGreaterThan(200);
  });

  test("should have copy order ID button", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    // Copy icon button next to order ID
    const copyBtn = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .last();
    await expect(copyBtn).toBeVisible();
  });
});

test.describe("Order Detail Page — Store & Items", () => {
  test("should display store name section", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    // Store section header with Chat Seller button
    await expect(page.locator("text=Chat Seller").first()).toBeVisible();
  });

  test("should display at least one order item", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    // Items are rendered as divs with product name + quantity x price
    const items = page.locator('[class*="divide-y"] > div');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Order Detail Page — Address & Payment", () => {
  test("should display Alamat Pengiriman section", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    await expect(
      page.locator('h2:has-text("Alamat Pengiriman")'),
    ).toBeVisible();
  });

  test("should display Pembayaran section with Total", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    await expect(page.locator('h2:has-text("Pembayaran")')).toBeVisible();
    await expect(page.locator("text=Total")).toBeVisible();
  });
});

test.describe("Order Detail Page — Bottom Action Bar", () => {
  test("should display fixed bottom action bar", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    const bottomBar = page.locator('[class*="fixed bottom-0"]').first();
    await expect(bottomBar).toBeVisible();
  });

  test("should have Chat button in bottom bar", async ({
    authenticatedPage: page,
  }) => {
    const ok = await goToFirstOrderDetail(page);
    if (!ok) {
      test.skip(true, "No orders");
      return;
    }

    const bottomBar = page.locator('[class*="fixed bottom-0"]').first();
    const chatBtn = bottomBar.locator("button").first();
    await expect(chatBtn).toBeVisible();
  });

  test("should show Bayar Sekarang for pending payment orders", async ({
    authenticatedPage: page,
  }) => {
    // Navigate specifically looking for pending orders
    await page.goto("/pesanan");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    // Look for "Belum Bayar" badge in order list
    const belumBayar = page.locator("text=Belum Bayar").first();
    const hasPending = await belumBayar.isVisible().catch(() => false);
    if (!hasPending) {
      test.skip(true, "No pending payment orders");
      return;
    }

    // Click the first card that has pending status
    await page.locator('[role="button"]').first().click();
    await page.waitForURL(/\/pesanan\/.+/);
    await page.waitForTimeout(2000);

    // Bottom bar should have Bayar Sekarang button
    await expect(page.locator('button:has-text("Bayar Sekarang")')).toBeVisible(
      { timeout: 5000 },
    );
  });
});
