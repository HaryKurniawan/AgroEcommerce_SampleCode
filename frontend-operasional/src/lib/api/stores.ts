import { apiClient } from "../api-client";

export const storesApi = {
  getAll: (params?: {
    wilayah?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/toko", { params }),
  getById: (id: string) => apiClient.get(`/toko/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/toko/slug/${slug}`),
  getMyStore: () => apiClient.get("/toko/my-toko"),
  getMyStockHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/toko/my-toko/stock-history", { params }),
  create: (data: Record<string, unknown>) => apiClient.post("/toko", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/toko/${id}`, data),
  adminGetAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get("/toko/admin/all", { params }),
  adminUpdateStatus: (id: string, status: string) =>
    apiClient.patch(`/toko/admin/${id}/status`, { status }),
};
