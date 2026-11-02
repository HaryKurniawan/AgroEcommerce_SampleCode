import { apiClient } from "../api-client";

export const cartApi = {
  get: () => apiClient.get("/keranjang"),
  addItem: (produkId: string, jumlah: number, varianKemasanId?: string) =>
    apiClient.post("/keranjang/item", { produkId, jumlah, varianKemasanId }),
  updateItem: (itemId: string, jumlah: number, varianKemasanId?: string) =>
    apiClient.patch(`/keranjang/item/${itemId}`, { jumlah, varianKemasanId }),
  removeItem: (itemId: string) => apiClient.delete(`/keranjang/item/${itemId}`),
  clear: () => apiClient.delete("/keranjang"),
};
