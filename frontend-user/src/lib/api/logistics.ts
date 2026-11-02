import { apiClient } from "../api-client";

export const logisticsApi = {
  calculate: (data: {
    customerAddressId: string;
    stores: { tokoId: string; totalWeightGram: number }[];
  }) =>
    apiClient.post("/logistics/calculate", {
      customerAddressId: data.customerAddressId,
      toko: data.stores,
    }),
};
