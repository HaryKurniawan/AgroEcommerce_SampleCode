import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "/api/proxy";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ─── Request interceptor to attach auth token ────────────────────────────────
import { useAuthStore } from "@/src/store/auth-store";

apiClient.interceptors.request.use((config) => {
  // Token sudah di-attach oleh proxy handler (server-side)
  // Jadi kita tidak perlu attach di sini
  // Hanya fallback untuk guest token jika ada
  if (typeof window !== "undefined") {
    const guestToken = localStorage.getItem("guest_token");
    if (guestToken) {
      config.headers.Authorization = `Bearer ${guestToken}`;
    }
  }
  return config;
});

// ─── Response interceptor for error handling ─────────────────────────────────

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes("calculate")) {
      console.log("CALCULATE SUCCESS:", response.data);
    }
    return response;
  },
  (error) => {
    if (error.config?.url?.includes("calculate")) {
      console.error(
        "CALCULATE ERROR:",
        error.response?.status,
        error.response?.data,
      );
    }
    // Only redirect if the 401 is NOT from the login or register endpoints
    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    const isUserNotFound =
      error.response?.status === 404 &&
      error.response?.data?.message?.includes("User not found");

    if ((error.response?.status === 401 || isUserNotFound) && !isAuthRoute) {
      if (typeof window !== "undefined") {
        const publicRoutes = ["/", "/katalog", "/produk", "/toko"];
        const isPublicPath = publicRoutes.some(
          (p) =>
            window.location.pathname === p ||
            (p !== "/" && window.location.pathname.startsWith(p)),
        );
        const isGuestChat =
          window.location.pathname.startsWith("/chat/guest") ||
          (window.location.pathname.startsWith("/chat/") &&
            !!localStorage.getItem("guest_token"));

        const isOperationalPath =
          window.location.pathname.startsWith("/operasional");

        // Clear auth and all storage
        useAuthStore.getState().clearAuth();
        localStorage.clear();
        sessionStorage.clear();

        if (!isPublicPath && !isGuestChat) {
          if (isOperationalPath) {
            window.location.href = "/operasional/login";
          } else {
            window.location.href = "/login?error=session_expired";
          }
        }
      }
    }

    // Check for forbidden access (role mismatch)
    if (error.response?.status === 403 && !isAuthRoute) {
      if (typeof window !== "undefined") {
        useAuthStore.getState().clearAuth();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login?error=unauthorized_role";
      }
    }

    if (error.response?.data?.message) {
      error.message = Array.isArray(error.response.data.message)
        ? error.response.data.message.join(", ")
        : error.response.data.message;
    }

    return Promise.reject(error);
  },
);
