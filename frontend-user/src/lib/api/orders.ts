import { apiClient } from "../api-client";

export const ordersApi = {
  create: (data: {
    metodeBayar: string;
    alamatKirim: string;
    jadwalKirim?: string;
    pesanan: {
      tokoId: string;
      ongkir: number;
      catatan?: string;
      metodeKirim?: string;
      item: {
        produkId: string;
        jumlah: number;
        harga: number;
      }[];
    }[];
  }) => apiClient.post("/ecom-pesanan", data),
  getMyOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/my-pesanan", { params }),
  getById: (id: string) => apiClient.get(`/ecom-pesanan/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/ecom-pesanan/${id}/status`, { status }),
  adminGetAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
    tokoId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get("/ecom-pesanan/admin/all", { params }),
  sellerGetOrders: (
    tokoId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
      isGrosir?: boolean;
    },
  ) => apiClient.get(`/ecom-pesanan/penjual/${tokoId}`, { params }),
  confirmWholesale: (
    id: string,
    data: {
      harga?: number;
      catatan?: string;
      [key: string]: unknown;
    },
  ) => apiClient.patch(`/ecom-pesanan/${id}/konfirmasi-grosir`, data),
  getCourierTasks: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/courier/tasks", { params }),
  getCourierHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/courier/history", { params }),
  advanceShippingStatus: (id: string, body: { note?: string }) =>
    apiClient.patch(`/ecom-pesanan/${id}/pengiriman/next`, body),
  confirmReceived: (id: string) =>
    apiClient.patch(`/ecom-pesanan/${id}/complete`),
  /**
   * Konfirmasi pembayaran oleh konsumen pemilik pesanan.
   * Backend memvalidasi: kepemilikan, status harus MENUNGGU_BAYAR.
   * Transisi: MENUNGGU_BAYAR → DIPROSES.
   */
  confirmPayment: (id: string) =>
    apiClient.post(`/ecom-pesanan/${id}/confirm-payment`),
  createWholesale: (data: {
    tokoId: string;
    produkId: string;
    jumlah: number;
    harga: number;
    alamatKirim: string;
    catatan?: string;
    metodeBayar?: string;
    packagingSpecs?: any[];
    diskonGrosirPersen?: number;
    tanggalPermintaanKirim?: string;
  }) =>
    apiClient.post("/ecom-pesanan/grosir", {
      item: [
        {
          produkId: data.produkId,
          jumlah: data.jumlah,
          harga: data.harga,
          catatan: data.catatan,
        },
      ],
      alamatKirim: data.alamatKirim,
      catatan: data.catatan,
      metodeBayar: data.metodeBayar || "MANUAL",
      packagingSpecs: data.packagingSpecs,
      diskonGrosirPersen: data.diskonGrosirPersen,
      tanggalPermintaanKirim: data.tanggalPermintaanKirim,
      tipePengiriman: "CUSTOM",
    }),
};
