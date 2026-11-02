import { apiClient } from "../api-client";

export const shippingApi = {
  init: (orderId: string) =>
    apiClient.post(`/ecom-pesanan/${orderId}/pengiriman`, {}),
  advance: (orderId: string, body: { note?: string }) =>
    apiClient.patch(`/ecom-pesanan/${orderId}/pengiriman/next`, body),
};
