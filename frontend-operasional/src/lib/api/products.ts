import { apiClient } from "../api-client";

export const productsApi = {
  getAll: (params?: {
    kategoriId?: string;
    tokoId?: string;
    search?: string;
    isFlashSale?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) => apiClient.get("/ecom-produk", { params }),
  getById: (id: string) => apiClient.get(`/ecom-produk/${id}`),
  getByStore: (tokoId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/ecom-produk/toko/${tokoId}`, { params }),
  getAllByStore: (tokoId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/ecom-produk/toko/${tokoId}/all`, { params }),
  getStockHistory: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/ecom-produk/${id}/stock-history`, { params }),
  getBatches: (id: string) => apiClient.get(`/ecom-produk/${id}/batches`),
  updateBatchExpiry: (
    produkId: string,
    batchId: string,
    tanggalKadaluarsa: string | null,
  ) =>
    apiClient.patch(`/ecom-produk/${produkId}/batches/${batchId}/expiry`, {
      tanggalKadaluarsa,
    }),
  getGrades: (produkId: string) =>
    apiClient.get(`/ecom-produk/${produkId}/grade`),
  create: (tokoId: string, data: Record<string, unknown>) =>
    apiClient.post(`/ecom-produk/toko/${tokoId}`, data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/ecom-produk/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/ecom-produk/${id}/status`, { status }),
  updateStock: (
    id: string,
    data: {
      tipe: "IN" | "OUT" | "ADJUSTMENT";
      kuantitas: number;
      catatan?: string;
    },
  ) => apiClient.patch(`/ecom-produk/${id}/stock`, data),
  updatePhotos: (id: string, fotoUrls: string[]) =>
    apiClient.patch(`/ecom-produk/${id}/photos`, { fotoUrls }),
  setDiskon: (id: string, diskonPersen: number) =>
    apiClient.patch(`/ecom-produk/${id}`, { diskonPersen }),
  remove: (id: string) => apiClient.delete(`/ecom-produk/${id}`),
};
