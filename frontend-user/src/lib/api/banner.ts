import { apiClient } from "../api-client";

export const bannerApi = {
  getBanners: () => apiClient.get("/banner"),
};
