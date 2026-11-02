import { apiClient } from "../api-client";

export const bannerApi = {
  getAdminBanners: () => apiClient.get("/banner/admin"),
  createBanner: (data: any) => apiClient.post("/banner/admin", data),
  updateBanner: (id: string, data: any) =>
    apiClient.patch(`/banner/admin/${id}`, data),
  deleteBanner: (id: string) => apiClient.delete(`/banner/admin/${id}`),
  reorderBanners: (orderedIds: string[]) =>
    apiClient.patch("/banner/admin/reorder", { orderedIds }),
};
