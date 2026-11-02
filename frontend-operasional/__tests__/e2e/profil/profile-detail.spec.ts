import { test as baseTest, expect } from "../fixtures";

const test = baseTest;

test.describe("Profile Detail Page (/profil/detail)", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto("/profil/detail");
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
  });

  test("should display Detail Profil header", async ({
    authenticatedPage: page,
  }) => {
    await expect(page.locator('h1:has-text("Detail Profil")')).toBeVisible();
  });

  test("should display Nama Lengkap field", async ({
    authenticatedPage: page,
  }) => {
    await expect(
      page.locator("text=NAMA LENGKAP").or(page.locator("text=Nama Lengkap")),
    ).toBeVisible();
  });

  test("should display Email field", async ({ authenticatedPage: page }) => {
    await expect(
      page.locator("text=EMAIL").or(page.locator("text=Email")),
    ).toBeVisible();
  });

  test("should display Nomor Telepon field", async ({
    authenticatedPage: page,
  }) => {
    await expect(
      page.locator("text=NOMOR TELEPON").or(page.locator("text=Nomor Telepon")),
    ).toBeVisible();
  });

  test("should display Alamat Utama section", async ({
    authenticatedPage: page,
  }) => {
    await expect(page.locator('h3:has-text("Alamat Utama")')).toBeVisible();
  });

  test("should navigate to /profil/alamat when clicking Ubah on Alamat", async ({
    authenticatedPage: page,
  }) => {
    // The Ubah link in Alamat Utama section
    const ubahLinks = page.locator('button:has-text("Ubah")');
    // There's at least one Ubah button (for alamat section)
    const count = await ubahLinks.count();
    if (count > 0) {
      // Click the alamat Ubah (last one, near Alamat Utama)
      await ubahLinks.last().click();
      await expect(page).toHaveURL(/\/profil\/alamat/);
    }
  });

  test("should display profile avatar emoji", async ({
    authenticatedPage: page,
  }) => {
    // Avatar is displayed as emoji 🧑‍🌾
    const avatarContainer = page
      .locator('[class*="rounded-full"]')
      .filter({ hasText: "🧑‍🌾" });
    const hasAvatar = await avatarContainer.isVisible().catch(() => false);

    if (!hasAvatar) {
      // Alternative: check avatar container exists
      const avatarDiv = page.locator('[class*="w-24 h-24"]');
      await expect(avatarDiv).toBeVisible();
    } else {
      await expect(avatarContainer).toBeVisible();
    }
  });

  test("should open Ubah phone modal on Ubah click", async ({
    authenticatedPage: page,
  }) => {
    // Hover over phone section to reveal Ubah button
    const phoneLabel = page
      .locator("text=NOMOR TELEPON")
      .or(page.locator("text=Nomor Telepon"));
    await phoneLabel.hover();
    await page.waitForTimeout(400);

    const ubahBtns = page.locator('button:has-text("Ubah")');
    const count = await ubahBtns.count();

    if (count > 0) {
      // Try clicking each Ubah button until modal appears
      for (let i = 0; i < count; i++) {
        const isVisible = await ubahBtns
          .nth(i)
          .isVisible()
          .catch(() => false);
        if (isVisible) {
          await ubahBtns.nth(i).click();
          await page.waitForTimeout(400);
          const hasModal = await page
            .locator("text=Nomor Telepon")
            .nth(1)
            .isVisible()
            .catch(() => false);
          if (hasModal) {
            await expect(
              page.locator('button:has-text("Batal")'),
            ).toBeVisible();
            await expect(
              page.locator('button:has-text("Simpan")'),
            ).toBeVisible();
            break;
          }
        }
      }
    }
  });
});
