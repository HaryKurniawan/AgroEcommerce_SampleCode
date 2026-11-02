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
        // Robustly extract the user array from potential wrapped structures
        let userArray: any[] | null = null;

        if (res.data) {
          if (Array.isArray(res.data)) {
            userArray = res.data;
          } else if (res.data.data) {
            if (Array.isArray(res.data.data)) {
              userArray = res.data.data;
            } else if (
              res.data.data.data &&
              Array.isArray(res.data.data.data)
            ) {
              userArray = res.data.data.data;
            }
          }
        }

        if (userArray) {
          const mappedArray = userArray.map((u: any) => ({
            ...u,
            name: u.nama,
            aktif: u.aktif ?? true,
            role:
              u.peran === "KONSUMEN"
                ? "USER"
                : u.peran === "PENJUAL"
                  ? "SELLER"
                  : u.peran === "KURIR"
                    ? "COURIER"
                    : u.peran === "ADMIN_CS"
                      ? "CS"
                      : u.peran,
            emailVerifiedAt: u.emailTerverifikasiPada,
            phoneNumber: u.noTelepon,
            isVerifiedB2B:
              u.terverifikasiB2B ||
              u.statusVerifikasiPerusahaan === "DISETUJUI" ||
              u.statusVerifikasiPerusahaan === true,
            b2bVerification: u.pengajuanB2B || {
              status: u.statusVerifikasiPerusahaan,
            },
            sellerProfile: u.profilPenjual
              ? {
                  storeName: u.profilPenjual.namaToko,
                  status: u.profilPenjual.status,
                }
              : null,
            courierSellerProfile: u.profilPenjualKurir
              ? {
                  storeName: u.profilPenjualKurir.namaToko,
                }
              : null,
            farmerProfile: u.profilPetani
              ? {
                  fullName: u.profilPetani.namaKebun,
                  status: u.profilPetani.status,
                }
              : null,
          }));

          // Re-assign the mapped array back to the matching nested structure
          if (Array.isArray(res.data)) {
            res.data = mappedArray;
          } else if (res.data.data) {
            if (Array.isArray(res.data.data)) {
              res.data.data = mappedArray;
            } else if (Array.isArray(res.data.data.data)) {
              res.data.data.data = mappedArray;
            }
          }
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
    noTelepon?: string;
  }) => apiClient.post("/pengguna", data),

  // Activity Logs
  getActivityLogs: (params?: {
    page?: number;
    limit?: number;
    kategori?: string;
    search?: string;
  }) => apiClient.get("/pengguna/log-aktivitas", { params }),

  // Toggle Seller Status (Aktif/Nonaktif)
  toggleSellerStatus: (id: string, aktif: boolean) =>
    apiClient.patch(`/pengguna/${id}/toggle-status`, { aktif }),
};

export const warehouseApi = {
  getAll: (params?: { search?: string; status?: string }) =>
    apiClient.get("/gudang", { params }),
  findNearest: (lat: number, lng: number, count = 3) =>
    apiClient.get("/gudang/nearest", { params: { lat, lng, count } }),
};
