import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

import { authApi } from "./api/auth";

interface BackendAuthPayload {
  accessToken: string;
  pengguna?: {
    id: string;
    email: string;
    nama?: string;
    name?: string;
    peran?: string;
    role?: string;
    terverifikasiB2B?: boolean;
    isVerifiedB2B?: boolean;
  };
  user?: {
    id: string;
    email: string;
    nama?: string;
    name?: string;
    peran?: string;
    role?: string;
    terverifikasiB2B?: boolean;
    isVerifiedB2B?: boolean;
  };
}

/**
 * Helper to map backend's Indonesian field names (pengguna, peran)
 * to frontend's English field names (user, role)
 */
function mapAuthResponse(data: BackendAuthPayload): AuthResponse {
  const p = data?.pengguna || data?.user;
  if (!p) {
    throw new Error(
      "Respons autentikasi tidak valid: data pengguna tidak ditemukan.",
    );
  }
  return {
    accessToken: data.accessToken,
    user: {
      id: p.id,
      email: p.email,
      name: p.nama?.replace(" - ", " ") ?? p.name,
      role: p.peran ?? p.role ?? "",
      isVerifiedB2B: p.terverifikasiB2B ?? p.isVerifiedB2B,
    },
  };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await authApi.login({
    email: data.email,
    kataSandi: data.password,
    // ONLY allow KONSUMEN role for frontend_user
    allowedRoles: ["KONSUMEN"],
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

export async function register(
  data: RegisterRequest,
): Promise<{ message: string; email: string }> {
  // Transform frontend field names to backend Indonesian field names
  const payload: any = {
    email: data.email,
    kataSandi: data.password, // password → kataSandi
    nama: data.name, // name → nama
    peran: data.role, // role → peran (if needed)
  };

  if (data.phone && data.phone.trim() !== "") {
    payload.noTelepon = data.phone;
  }

  const response = await authApi.register(payload);
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
