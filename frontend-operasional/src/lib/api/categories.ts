import { apiClient } from "../api-client";

export const categoriesApi = {
  getAll: () => apiClient.get("/kategori"),
  getById: (id: string) => apiClient.get(`/kategori/${id}`),
  create: (data: { nama: string; icon?: string }) =>
    apiClient.post("/kategori", data),
  update: (id: string, data: { nama?: string; icon?: string }) =>
    apiClient.patch(`/kategori/${id}`, data),
  remove: (id: string) => apiClient.delete(`/kategori/${id}`),
};
