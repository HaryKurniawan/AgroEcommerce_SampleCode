import { apiClient } from "../api-client";

export const pajakApi = {
  getConfig: () => apiClient.get("/pajak/config"),
  updateConfig: (data: { isAktif?: boolean; persenPPN?: number }) =>
    apiClient.put("/pajak/config", data),
};
