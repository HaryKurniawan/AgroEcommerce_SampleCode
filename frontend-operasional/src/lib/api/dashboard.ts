import { apiClient } from "../api-client";

export const dashboardApi = {
  getStats: () => apiClient.get("/core/dashboard/stats"),
};
