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
      item: {
        produkId: string;
        jumlah: number;
        harga: number;
        grade: string;
      }[];
    }[];
  }) => apiClient.post("/ecom-pesanan", data),
  getMyOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/my-pesanan", { params }),
  getById: (id: string) => apiClient.get(`/ecom-pesanan/${id}`),
  updateStatus: (
    id: string,
    data: { status: string; fotoSebelumKirimUrl?: string },
  ) => apiClient.patch(`/ecom-pesanan/${id}/status`, data),
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
  getDashboardStats: (tokoId: string) =>
    apiClient.get(`/ecom-pesanan/penjual/${tokoId}/dashboard-stats`),
  confirmWholesale: (id: string, data: any) =>
    apiClient.patch(`/ecom-pesanan/${id}/konfirmasi-grosir`, data),
  ajukanGudang: (id: string, gudangId: string) =>
    apiClient.post(`/ecom-pesanan/${id}/ajukan-gudang`, { gudangId }),
  getCourierTasks: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/courier/tasks", { params }),
  getCourierHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/ecom-pesanan/courier/history", { params }),
  advanceShippingStatus: (id: string, body: { note?: string }) =>
    apiClient.patch(`/ecom-pesanan/${id}/pengiriman/next`, body),
  confirmReceived: (id: string) =>
    apiClient.patch(`/ecom-pesanan/${id}/complete`),
  createWholesale: (data: {
    tokoId: string;
    produkId: string;
    grade: string;
    jumlah: number;
    alamatKirim: string;
    catatan?: string;
  }) => apiClient.post("/ecom-pesanan/grosir", data),
  submitDeliveryProof: (
    pesananId: string,
    data: {
      buktiKirimFoto: string[];
      buktiKirimCatatan?: string;
      buktiKirimLat?: number;
      buktiKirimLng?: number;
    },
  ) => apiClient.patch(`/ecom-pesanan/${pesananId}/bukti-kirim`, data),
  sellerConfirm: (id: string) =>
    apiClient.patch(`/ecom-pesanan/${id}/seller-confirm`),
};
