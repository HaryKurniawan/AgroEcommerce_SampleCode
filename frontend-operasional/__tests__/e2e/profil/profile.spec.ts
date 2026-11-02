import { test as baseTest, expect } from "../fixtures";
import { ROUTES } from "../test-data";

const test = baseTest;

test.describe("Profile Page", () => {
  test("should load profile page with user info", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.profil);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(page.locator("text=Profil Saya")).toBeVisible();
  });

  test("should display order quick access section", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.profil);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(page.locator("text=Pesanan Saya")).toBeVisible();
    await expect(page.locator("text=Lihat Semua")).toBeVisible();
  });

  test("should navigate to pesanan from quick access", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.profil);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await page.locator("text=Lihat Semua").click();
    await expect(page).toHaveURL(/\/pesanan/);
  });

  test("should display menu items", async ({ authenticatedPage: page }) => {
    await page.goto(ROUTES.profil);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    await expect(page.locator("text=Detail Profil")).toBeVisible();
    await expect(page.locator("text=Chat Customer Service")).toBeVisible();
    await expect(page.locator("text=Alamat Tersimpan")).toBeVisible();
  });

  test("should show logout button and modal", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.profil);
    await page
      .waitForSelector(".animate-pulse", { state: "hidden", timeout: 15000 })
      .catch(() => {});

    const logoutBtn = page.locator("text=Keluar Akun").first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Harus muncul modal konfirmasi
    await expect(page.locator("text=Apakah Anda yakin")).toBeVisible();
    await expect(page.locator("text=Ya, Keluar")).toBeVisible();
    await expect(page.locator("text=Batal")).toBeVisible();
  });
});
