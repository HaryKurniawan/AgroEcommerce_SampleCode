/**
 * Centralized Query Keys untuk TanStack Query
 * Semua queryKey didefinisikan di sini agar konsisten dan mudah di-invalidate
 */

export const queryKeys = {
  // === PUBLIC ===
  products: {
    all: ["products"] as const,
    list: (params?: object) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    reviews: (id: string, params?: object) =>
      ["products", "reviews", id, params] as const,
  },
  stores: {
    all: ["stores"] as const,
    list: (params?: object) => ["stores", "list", params] as const,
    detail: (id: string) => ["stores", "detail", id] as const,
    myStore: () => ["stores", "my-store"] as const,
  },
  categories: {
    all: ["categories"] as const,
  },

  // === AUTH-REQUIRED ===
  cart: {
    all: ["cart"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params?: object) => ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  profile: {
    me: () => ["profile", "me"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    list: () => ["addresses", "list"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    list: () => ["conversations", "list"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  sellerDashboard: {
    all: () => ["seller", "dashboard"] as const,
    orders: (tokoId: string) => ["seller", "orders", tokoId] as const,
    stats: (tokoId: string) => ["seller", "stats", tokoId] as const,
    grosirOrders: (tokoId: string) =>
      ["seller", "orders", "grosir", tokoId] as const,
    bookings: (tokoId: string) => ["seller", "bookings", tokoId] as const,
  },
  analytics: {
    produkTerlaris: (filters?: object) =>
      ["analytics", "produk-terlaris", filters] as const,
    riwayatTerlaris: (filters?: object) =>
      ["analytics", "riwayat-terlaris", filters] as const,
    trenBulanan: (tokoId: string, bulanKe: number) =>
      ["analytics", "tren-bulanan", tokoId, bulanKe] as const,
    trenProdukBulanan: (tokoId: string, month?: number, year?: number) =>
      ["analytics", "tren-produk-bulanan", tokoId, month, year] as const,
    polaPenjualan: (tokoId: string, year?: number) =>
      ["analytics", "pola-penjualan", tokoId, year] as const,
    pertumbuhanProduk: (tokoId: string) =>
      ["analytics", "pertumbuhan-produk", tokoId] as const,
  },
};
