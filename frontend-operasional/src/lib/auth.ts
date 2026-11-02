import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

import { authApi } from "./api/auth";

/**
 * Helper to map backend's Indonesian field names (pengguna, peran)
 * to frontend's English field names (user, role)
 */
function mapAuthResponse(data: any): AuthResponse {
  const p = data?.pengguna || data?.user;
  return {
    accessToken: data.accessToken,
    user: {
      id: p.id,
      email: p.email,
      name: p.nama?.replace(" - ", " ") || p.name,
      role: p.peran || p.role,
      isVerifiedB2B: p.terverifikasiB2B ?? p.isVerifiedB2B,
    },
  };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await authApi.login({
    email: data.email,
    kataSandi: data.password,
    allowedRoles: ["KONSUMEN", "PENJUAL", "SUPER_ADMIN", "ADMIN_CS"],
  });
  const resData = response.data?.data || response.data;
  return mapAuthResponse(resData);
}

export async function loginAdmin(data: LoginRequest): Promise<AuthResponse> {
  const response = await authApi.login({
    email: data.email,
    kataSandi: data.password,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_CS"],
  });
  const resData = response.data?.data || response.data;
  return mapAuthResponse(resData);
}

export async function loginOperasional(
  data: LoginRequest,
): Promise<AuthResponse> {
  const response = await authApi.login({
    email: data.email,
    kataSandi: data.password,
    allowedRoles: ["KURIR", "ADMIN_CS", "PENJUAL"],
  });
  const resData = response.data?.data || response.data;
  return mapAuthResponse(resData);
}

export async function loginStaff(data: LoginRequest): Promise<AuthResponse> {
  const response = await authApi.login({
    email: data.email,
    kataSandi: data.password,
    allowedRoles: ["SUPER_ADMIN", "KURIR", "ADMIN_CS", "PENJUAL"],
  });
  const resData = response.data?.data || response.data;
  return mapAuthResponse(resData);
}

export async function register(
  data: RegisterRequest,
): Promise<{ message: string; email: string }> {
  const response = await authApi.register(data);
  return response.data?.data || response.data;
}

export async function getProfile() {
  const response = await authApi.getProfile();
  return response.data?.data || response.data;
}

export async function logout() {
  try {
    await authApi.logout();
  } catch (error) {
    console.error("Logout error:", error);
  }
}
