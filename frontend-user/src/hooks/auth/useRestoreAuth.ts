import { useEffect } from "react";

import { useAuthStore } from "@/src/store/auth-store";
import { authApi } from "@/lib/ecommerce-api";

/**
 * Hook to restore and validate auth on app load
 * This ensures that stored auth state is still valid after page refresh
 */
export const useRestoreAuth = () => {
  const { isAuthenticated, _hasHydrated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // Only run after hydration and if user is authenticated
    if (!_hasHydrated || !isAuthenticated) return;

    const validateAndRestoreAuth = async () => {
      try {
        console.warn("🔄 Validating auth token...");
        // Validate token by fetching profile
        const response = await authApi.getProfile();
        const profile = response?.data?.data || response?.data;

        if (profile) {
          console.warn("✅ Auth token is valid");
          // Token is valid, update auth store with fresh data
          setAuth({
            id: profile.id,
            email: profile.email || profile.surel,
            name: profile.nama || profile.name,
            role: profile.peran || profile.role,
            isVerifiedB2B: profile.isVerifiedB2B,
            b2bVerification: profile.b2bVerification,
          });
        } else {
          console.warn("⚠️ No profile data returned");
          // No profile data, clear auth
          clearAuth();
        }
      } catch (error: any) {
        // Token is invalid or expired, clear auth
        console.warn("❌ Auth validation failed:", error?.message);
        clearAuth();
      }
    };

    validateAndRestoreAuth();
  }, [_hasHydrated, isAuthenticated, setAuth, clearAuth]);
};
