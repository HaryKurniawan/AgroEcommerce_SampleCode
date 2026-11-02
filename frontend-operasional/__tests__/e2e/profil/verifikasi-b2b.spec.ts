import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

test.describe("Verifikasi B2B — Page Load", () => {
  test("should load B2B page without crash", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(50);
  });

  test("should show one of the expected states", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const isOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    const isPending = await page
      .locator("text=Menunggu Verifikasi")
      .isVisible()
      .catch(() => false);
    const isApproved = await page
      .locator("text=Terverifikasi")
      .isVisible()
      .catch(() => false);

    expect(isOnboarding || isPending || isApproved).toBeTruthy();
  });
});

test.describe("Verifikasi B2B — Onboarding Slides", () => {
  test("should display first onboarding slide", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "User already verified/pending — onboarding not shown");
      return;
    }

    await expect(page.locator("text=Menjadi Pembeli Institusi")).toBeVisible();
    await expect(
      page.locator('button[aria-label="Selanjutnya"]'),
    ).toBeVisible();
  });

  test("should navigate to second slide on next click", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "Onboarding not shown");
      return;
    }

    await page.locator('button[aria-label="Selanjutnya"]').click();
    await expect(page.locator("text=Pemesanan Skala Besar")).toBeVisible({
      timeout: 3000,
    });
  });

  test("should navigate to third slide", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "Onboarding not shown");
      return;
    }

    await page.locator('button[aria-label="Selanjutnya"]').click();
    await page.waitForTimeout(200);
    await page.locator('button[aria-label="Selanjutnya"]').click();
    await expect(page.locator("text=Harga Khusus Institusi")).toBeVisible({
      timeout: 3000,
    });
  });

  test("should show Daftar Sekarang on last slide", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "Onboarding not shown");
      return;
    }

    const nextBtn = page.locator('button[aria-label="Selanjutnya"]');
    // Navigate through all 4 slides
    for (let i = 0; i < 3; i++) {
      const visible = await nextBtn.isVisible().catch(() => false);
      if (visible) {
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }

    await expect(
      page.locator('button:has-text("Daftar Sekarang")'),
    ).toBeVisible({ timeout: 3000 });
  });

  test("should navigate to B2B form on Daftar Sekarang click", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "Onboarding not shown");
      return;
    }

    const nextBtn = page.locator('button[aria-label="Selanjutnya"]');
    for (let i = 0; i < 3; i++) {
      const visible = await nextBtn.isVisible().catch(() => false);
      if (visible) {
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }

    const daftarBtn = page.locator('button:has-text("Daftar Sekarang")');
    if (await daftarBtn.isVisible().catch(() => false)) {
      await daftarBtn.click();
      await expect(page).toHaveURL(/\/profil\/verifikasi-b2b\/form/);
    }
  });

  test("should show back button on slides after first", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/verifikasi-b2b");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasOnboarding = await page
      .locator("text=Menjadi Pembeli Institusi")
      .isVisible()
      .catch(() => false);
    if (!hasOnboarding) {
      test.skip(true, "Onboarding not shown");
      return;
    }

    await page.locator('button[aria-label="Selanjutnya"]').click();
    await page.waitForTimeout(200);

    // Back button should now appear
    await expect(page.locator('button[aria-label="Kembali"]')).toBeVisible({
      timeout: 3000,
    });
  });
});
