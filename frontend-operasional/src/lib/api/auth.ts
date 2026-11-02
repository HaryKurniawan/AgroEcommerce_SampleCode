import { apiClient } from "../api-client";

export const authApi = {
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (data: { name?: string; phoneNumber?: string }) =>
    apiClient.patch("/auth/profile", {
      nama: data.name,
      noTelepon: data.phoneNumber,
    }),
  adminVerifyB2B: (userId: string, isVerifiedB2B: boolean) =>
    apiClient.patch(`/auth/admin/verify-b2b/${userId}`, {
      terverifikasiB2B: isVerifiedB2B,
    }),
  logout: () => apiClient.post("/auth/logout"),
  createGuestSession: () => apiClient.post("/auth/guest"),
  submitB2BVerification: (data: {
    namaPerusahaan: string;
    jabatan: string;
    npwp?: string;
    alamatKantor: string;
    teleponKantor: string;
    bidangUsaha?: string;
  }) => apiClient.post("/auth/b2b-verification", data),
  getB2BVerification: () => apiClient.get("/auth/b2b-verification"),
  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) =>
    apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post("/auth/reset-password", data),
  login: (data: {
    email: string;
    kataSandi: string;
    allowedRoles?: string[];
  }) => apiClient.post("/auth/login", data),
  register: (data: any) => apiClient.post("/auth/register", data),
};
