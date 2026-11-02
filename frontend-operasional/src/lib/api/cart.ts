import { apiClient } from "../api-client";

export const cartApi = {
  get: () => apiClient.get("/keranjang"),
  addItem: (produkId: string, jumlah: number, grade: string = "A") =>
    apiClient.post("/keranjang/item", { produkId, jumlah, grade }),
  updateItem: (itemId: string, jumlah: number) =>
    apiClient.patch(`/keranjang/item/${itemId}`, { jumlah }),
  updateItemGrade: (itemId: string, grade: string) =>
    apiClient.patch(`/keranjang/item/${itemId}/grade`, { grade }),
  removeItem: (itemId: string) => apiClient.delete(`/keranjang/item/${itemId}`),
  clear: () => apiClient.delete("/keranjang"),
};
