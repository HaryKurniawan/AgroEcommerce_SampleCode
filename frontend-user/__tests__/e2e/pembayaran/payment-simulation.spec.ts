import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

/**
 * Helper: Navigasi ke pesanan MENUNGGU_BAYAR dan buka halaman pembayaran.
 * Return orderId jika berhasil, null jika tidak ada pesanan pending.
 */
async function goToPendingPaymentOrder(page: any): Promise<string | null> {
  await page.goto("/pesanan");
  await page
    .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
    .catch(() => {});

  // Cari order card yang memiliki "Belum Bayar" badge atau "Bayar Sekarang" text
  const bayarBtn = page
    .locator('button:has-text("Bayar Sekarang")')
    .or(page.locator("text=Belum Bayar"))
    .first();
  const hasPending = await bayarBtn.isVisible().catch(() => false);

  if (!hasPending) return null;

  // Klik order card pertama
  const orderCard = page.locator('[role="button"]').first();
  await orderCard.click();
  await page.waitForURL(/\/pesanan\/.+/, { timeout: 10000 });
  await page.waitForTimeout(1000);

  const url = page.url();
  const match = url.match(/\/pesanan\/([^/]+)/);
  if (!match) return null;

  const orderId = match[1];
  // Navigate to pembayaran
  await page.goto(`/pembayaran?orderId=${orderId}`);
  await page.waitForTimeout(3000);

  const hasPendingPage = await page
    .locator("text=Menunggu Pembayaran")
    .isVisible()
    .catch(() => false);
  return hasPendingPage ? orderId : null;
}

test.describe("Payment Page — Structure", () => {
  test("should load pembayaran page (any state)", async ({
    authenticatedPage: page,
  }) => {
    // Test dengan dummy orderId
    await page.goto("/pembayaran?orderId=test");
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(20);
  });

  test("should have back navigation button", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/pembayaran?orderId=test");
    await page.waitForTimeout(3000);

    const backBtn = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await expect(backBtn).toBeVisible();
  });
});

test.describe("Payment Page — Pending State (requires real pending order)", () => {
  test("should display Menunggu Pembayaran header for pending order", async ({
    authenticatedPage: page,
  }) => {
    const orderId = await goToPendingPaymentOrder(page);
    if (!orderId) {
      test.skip(true, "No pending payment order in DB");
      return;
    }

    await expect(page.locator("text=Menunggu Pembayaran")).toBeVisible();
  });

  test("should display virtual account / payment info", async ({
    authenticatedPage: page,
  }) => {
    const orderId = await goToPendingPaymentOrder(page);
    if (!orderId) {
      test.skip(true, "No pending payment order in DB");
      return;
    }

    // Either VA number section or payment method info
    const hasVA =
      (await page
        .locator("text=Virtual Account")
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator("text=Transfer")
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator('[class*="font-mono"]')
        .first()
        .isVisible()
        .catch(() => false));

    expect(hasVA).toBeTruthy();
  });

  test("should display payment countdown timer", async ({
    authenticatedPage: page,
  }) => {
    const orderId = await goToPendingPaymentOrder(page);
    if (!orderId) {
      test.skip(true, "No pending payment order in DB");
      return;
    }

    // Timer shows hours:minutes:seconds
    await expect(page.locator("text=Menunggu Pembayaran")).toBeVisible();
    // Timer is rendered somewhere on page
    const hasTimer = await page
      .locator('[class*="tabular-nums"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasTimer).toBeTruthy();
  });

  test("should display Simulasi Bayar bypass button", async ({
    authenticatedPage: page,
  }) => {
    const orderId = await goToPendingPaymentOrder(page);
    if (!orderId) {
      test.skip(true, "No pending payment order in DB");
      return;
    }

    // The bypass/simulate payment button (dev mode)
    // Bisa: "Simulasi Bayar", "Sudah Bayar", "Konfirmasi Bayar"
    const simulasiBtn = page
      .locator("button")
      .filter({ hasText: /Simulasi|Sudah Bayar|Konfirmasi.*Bayar/i })
      .first();
    await expect(simulasiBtn).toBeVisible({ timeout: 5000 });
  });

  test("should show Pembayaran Berhasil after clicking Simulasi Bayar", async ({
    authenticatedPage: page,
  }) => {
    const orderId = await goToPendingPaymentOrder(page);
    if (!orderId) {
      test.skip(true, "No pending payment order in DB");
      return;
    }

    const simulasiBtn = page
      .locator("button")
      .filter({ hasText: /Simulasi|Sudah Bayar|Konfirmasi.*Bayar/i })
      .first();
    const hasBtn = await simulasiBtn.isVisible().catch(() => false);
    if (!hasBtn) {
      test.skip(true, "Simulasi button not found");
      return;
    }

    await simulasiBtn.click();

    // Tunggu success state (max 15 detik)
    await expect(
      page
        .locator("text=Pembayaran Berhasil")
        .or(page.locator("text=Berhasil"))
        .first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
