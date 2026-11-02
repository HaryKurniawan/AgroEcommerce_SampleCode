import { apiClient } from "../api-client";

export const gudangApi = {
  // ─── Warehouses ───────────────────────────────────────────────────────────
  getWarehouses: () => apiClient.get("/toko/warehouses"),

  // ✅ Get ALL warehouses for open marketplace (no affiliation filter)
  getAllWarehousesForMarketplace: () => apiClient.get("/toko/warehouses"),

  getWarehouseById: (id: string) => apiClient.get(`/gudang/${id}`),

  // ✅ Get warehouse product catalog (semua gudang atau per gudang)
  getProdukGudang: (gudangId?: string) =>
    apiClient.get(`/gudang/produk${gudangId ? `?gudangId=${gudangId}` : ""}`),

  // ─── Stock Requests (PengajuanStok) ────────────────────────────────────────
  getStockRequests: () => apiClient.get("/ecommerce/pengajuan-stok"),

  getAdminAllStockRequests: () =>
    apiClient.get("/ecommerce/pengajuan-stok/admin/all"),

  getStockRequestById: (id: string) =>
    apiClient.get(`/ecommerce/pengajuan-stok/${id}`),

  createStockRequest: (data: {
    gudangId: string;
    catatan?: string;
    tipePengiriman?: string;
    tanggalPermintaanKirim?: string | Date;
    items: {
      produkGudangId: string;
      jumlahPermintaan: number;
      ukuranKemasanKg?: number;
      jumlahKemasan?: number;
      totalKg?: number;
      kemasanDetail?: { ukuranKg: number; jumlahKemasan: number }[];
    }[];
  }) => apiClient.post("/ecommerce/pengajuan-stok", data),

  getProductsForRequest: (gudangId: string) =>
    apiClient.get(
      `/ecommerce/pengajuan-stok/products?gudangId=${gudangId}&all=true`,
    ),

  getProductHistory: () =>
    apiClient.get("/ecommerce/pengajuan-stok/history/products"),

  updateStockRequestStatus: (
    id: string,
    data: {
      status: string;
      catatan?: string;
      itemUpdates?: {
        itemId: string;
        jumlahDisetujui: number;
      }[];
    },
  ) => apiClient.patch(`/ecommerce/pengajuan-stok/${id}/status`, data),

  // ─── Master Komoditas (Read-only from Gudang) ──────────────────────────────
  getMasterKomoditas: (params?: { search?: string; kategori?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.kategori) query.append("kategori", params.kategori);
    return apiClient.get(
      `/master-komoditas${query.toString() ? "?" + query.toString() : ""}`,
    );
  },

  getMasterKomoditasById: (id: string) =>
    apiClient.get(`/master-komoditas/${id}`),
};
