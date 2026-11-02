import { apiClient } from "../api-client";

export const addressesApi = {
  getAll: () => apiClient.get("/alamat"),
  create: (data: {
    label: string;
    penerima?: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kecamatan?: string;
    kelurahan?: string;
    kodePos?: string;
    telepon?: string;
    isDefault?: boolean;
    lat?: number;
    lng?: number;
  }) => apiClient.post("/alamat", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/alamat/${id}`, data),
  remove: (id: string) => apiClient.delete(`/alamat/${id}`),
  setDefault: (id: string) => apiClient.patch(`/alamat/${id}/default`),
};
