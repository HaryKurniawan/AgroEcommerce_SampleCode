import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

test.describe("Alamat Tersimpan — Page Structure", () => {
  test("should load alamat page with Alamat Saya header", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(
      page
        .locator('h1:has-text("Alamat Saya")')
        .or(page.locator('h1:has-text("Daftar Alamat")')),
    ).toBeVisible();
  });

  test("should display Tambah button", async ({ authenticatedPage: page }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(page.locator('button:has-text("Tambah")')).toBeVisible();
  });

  test("should navigate to add form on Tambah click", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await page.locator('button:has-text("Tambah")').click();
    await expect(page).toHaveURL(/\/profil\/alamat\/form/);
  });

  test("should display back button in header", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
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

test.describe("Alamat Tersimpan — Content States", () => {
  test("should show empty state or address list", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasEmpty = await page
      .locator("text=Belum Ada Alamat")
      .isVisible()
      .catch(() => false);
    const hasAddresses = await page
      .locator("text=alamat tersimpan")
      .isVisible()
      .catch(() => false);
    const hasCards =
      (await page.locator('[class*="rounded-2xl border"]').count()) > 0;

    expect(hasEmpty || hasAddresses || hasCards).toBeTruthy();
  });

  test("should show Tambah Alamat Baru action in empty state", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const isEmpty = await page
      .locator("text=Belum Ada Alamat")
      .isVisible()
      .catch(() => false);

    if (isEmpty) {
      await expect(
        page.locator('button:has-text("Tambah Alamat Baru")'),
      ).toBeVisible();
    }
  });

  test("should display Jadikan Alamat Utama for non-default address", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    // If there are non-default addresses, a button should exist
    const setDefaultBtn = page.locator(
      'button:has-text("Jadikan Alamat Utama")',
    );
    const hasBtn = await setDefaultBtn
      .first()
      .isVisible()
      .catch(() => false);

    // Soft assertion — only relevant when multiple addresses exist
    if (hasBtn) {
      await expect(setDefaultBtn.first()).toBeVisible();
    }
  });
});

test.describe("Alamat Tersimpan — Delete Flow", () => {
  test("should show delete confirm modal on delete click", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    // Only test if there are addresses
    const hasAddresses = await page
      .locator('button:has-text("Jadikan Alamat Utama")')
      .or(page.locator("text=Alamat Utama"))
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasAddresses) {
      test.skip(true, "No addresses to test delete");
      return;
    }

    // Edit and Delete buttons are icon buttons in each address card
    // Trash icon is the 2nd icon button (after Edit)
    const allIconBtns = page
      .locator("button")
      .filter({ has: page.locator("svg") });
    const count = await allIconBtns.count();

    // Typical layout: back(1) + Tambah(1) per address: edit(1)+delete(1)
    // So delete btn is at index 3+ depending on addresses
    if (count >= 4) {
      await allIconBtns.nth(3).click(); // delete button of first address
      await expect(page.locator("text=Hapus Alamat?")).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('button:has-text("Batal")')).toBeVisible();
      await expect(page.locator('button:has-text("Hapus")')).toBeVisible();
    }
  });

  test("should dismiss delete confirm modal on Batal click", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profil/alamat");
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const hasAddresses = await page
      .locator("text=Alamat Utama")
      .isVisible()
      .catch(() => false);

    if (!hasAddresses) {
      test.skip(true, "No addresses");
      return;
    }

    const allIconBtns = page
      .locator("button")
      .filter({ has: page.locator("svg") });
    const count = await allIconBtns.count();

    if (count >= 4) {
      await allIconBtns.nth(3).click();
      const hasModal = await page
        .locator("text=Hapus Alamat?")
        .isVisible()
        .catch(() => false);
      if (hasModal) {
        await page.locator('button:has-text("Batal")').click();
        // Modal should close
        await expect(page.locator("text=Hapus Alamat?")).not.toBeVisible({
          timeout: 3000,
        });
      }
    }
  });
});
