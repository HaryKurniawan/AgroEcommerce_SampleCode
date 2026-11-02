import { apiClient } from "../api-client";

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/notifikasi", { params }),
  markAsRead: (id: string) => apiClient.patch(`/notifikasi/${id}/read`),
  markAllAsRead: () => apiClient.patch("/notifikasi/read-all"),
};
