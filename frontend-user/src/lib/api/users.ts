import { apiClient } from "../api-client";

export const usersApi = {
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string | string[];
    search?: string;
  }) => {
    const { role, ...rest } = params || {};
    return apiClient
      .get("/pengguna", { params: { ...rest, peran: role } })
      .then((res) => {
        // Normalize backend (Indonesian) to frontend (English) keys
        if (res.data?.data && Array.isArray(res.data.data)) {
          res.data.data = res.data.data.map(
            (u: {
              nama?: string;
              peran?: string;
              noTelepon?: string;
              terverifikasiB2B?: boolean;
              pengajuanB2B?: unknown;
              profilPenjual?: { namaToko?: string; status?: string } | null;
              profilPetani?: { namaKebun?: string; status?: string } | null;
              [key: string]: unknown;
            }) => ({
              ...u,
              name: u.nama,
              role: u.peran,
              phoneNumber: u.noTelepon,
              isVerifiedB2B: u.terverifikasiB2B,
              b2bVerification: u.pengajuanB2B,
              sellerProfile: u.profilPenjual
                ? {
                    storeName: u.profilPenjual.namaToko,
                    status: u.profilPenjual.status,
                  }
                : null,
              farmerProfile: u.profilPetani
                ? {
                    fullName: u.profilPetani.namaKebun,
                    status: u.profilPetani.status,
                  }
                : null,
            }),
          );
        }
        return res;
      });
  },
  getCourierStaff: () => apiClient.get("/pengguna/courier-staff"),
  createCourierStaff: (data: {
    name: string;
    email: string;
    password: string;
  }) => apiClient.post("/pengguna/courier-staff", data),
  remove: (id: string) => apiClient.delete(`/pengguna/${id}`),

  // Seller + Courier Affiliation
  createSellerWithCourier: (data: Record<string, unknown>) =>
    apiClient.post("/pengguna/penjual-with-courier", data),
  getSellerCourierAffiliations: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get("/pengguna/penjual-courier-affiliations", { params }),
  getAllCouriersForSelection: () =>
    apiClient.get("/pengguna/all-couriers-for-selection"),
  updateSellerCourierAffiliation: (
    tokoId: string,
    data: Record<string, unknown>,
  ) => apiClient.patch(`/pengguna/penjual/${tokoId}/courier-affiliation`, data),

  // Generic admin user creation
  createUser: (data: {
    nama: string;
    email: string;
    kataSandi: string;
    peran?: string;
    gudangId?: string;
  }) => apiClient.post("/pengguna", data),
};

export const warehouseApi = {
  getAll: (params?: { search?: string; status?: string }) =>
    apiClient.get("/gudang", { params }),
  findNearest: (lat: number, lng: number, count = 3) =>
    apiClient.get("/gudang/nearest", { params: { lat, lng, count } }),
};
