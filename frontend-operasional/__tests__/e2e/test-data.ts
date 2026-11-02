/**
 * Konstanta test data yang digunakan oleh semua E2E test.
 * Pastikan user ini sudah ada di database sebelum running test.
 */
export const TEST_CUSTOMER = {
  email: "test-customer@agro.com",
  password: "Test123!",
  name: "Test Customer",
};

export const TEST_SELLER = {
  email: "test-seller@agro.com",
  password: "Test123!",
  name: "Test Seller",
};

/** Email unik untuk test register (agar tidak bentrok) */
export function generateTestEmail(): string {
  return `e2e-${Date.now()}@test.com`;
}

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  katalog: "/katalog",
  keranjang: "/keranjang",
  checkout: "/checkout",
  pesanan: "/pesanan",
  profil: "/profil",
  toko: "/toko",
  notifikasi: "/notifikasi",
  chat: "/chat",
  sellerDashboard: "/seller/dashboard",
  sellerProduk: "/seller/produk",
  sellerPesanan: "/seller/pesanan",
};
