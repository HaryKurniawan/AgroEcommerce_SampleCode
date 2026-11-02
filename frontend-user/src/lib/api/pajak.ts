import { apiClient } from "../api-client";

export const pajakApi = {
  getConfig: () => apiClient.get("/pajak/config"),
};
