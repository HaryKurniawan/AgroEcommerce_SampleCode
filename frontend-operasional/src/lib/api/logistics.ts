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

  getConfig: () => apiClient.get("/logistics/config"),

  updateConfig: (data: {
    jarakDasarKm?: number;
    hargaDasar?: number;
    hargaPerKmExtra?: number;
    beratDasarKg?: number;
    hargaPerKgExtra?: number;
    jarakMaksKm?: number;
    gratisBawahKm?: number;
    ongkirFlat?: number;
    gratisAboveKg?: number;
    ekspedisiBaseCost?: number;
    ekspedisiPerKgCost?: number;
    ekspedisiPerKmCost?: number;
  }) => apiClient.put("/logistics/config", data),
};
