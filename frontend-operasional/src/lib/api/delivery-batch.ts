import { apiClient } from "../api-client";

export const deliveryBatchApi = {
  // Kurir
  getCourierBatches: (params?: { tanggal?: string }) =>
    apiClient.get("/delivery-batch/kurir/batches", { params }),
  getBatchDetail: (id: string) =>
    apiClient.get(`/delivery-batch/kurir/batches/${id}`),
  startBatch: (id: string) =>
    apiClient.post(`/delivery-batch/kurir/batches/${id}/start`),
  markItemDelivered: (batchId: string, pesananId: string) =>
    apiClient.post(
      `/delivery-batch/kurir/batches/${batchId}/items/${pesananId}/delivered`,
    ),

  // Seller
  getStoreBatches: (tokoId: string, params?: { tanggal?: string }) =>
    apiClient.get(`/delivery-batch/toko/${tokoId}/batches`, { params }),

  // Admin / Manual Trigger
  generateBatches: (data: { tipeBatch: "PAGI" | "SIANG" }) =>
    apiClient.post("/delivery-batch/generate", data),
  generateBatchForStore: (
    tokoId: string,
    data: { tipeBatch: "PAGI" | "SIANG" },
  ) => apiClient.post(`/delivery-batch/generate/${tokoId}`, data),
};
