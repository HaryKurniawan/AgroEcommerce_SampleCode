import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";

export const useProfileActions = () => {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();

  const logout = async () => {
    setActionLoading(true);
    try {
      await authApi.logout();
      useAuthStore.getState().clearAuth();

      // Delay slightly to ensure cookie is cleared before routing
      setTimeout(() => {
        router.push("/login");
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback redirect anyway
      router.push("/login");
    } finally {
      setActionLoading(false);
    }
  };

  const updateProfile = async (data: {
    phoneNumber?: string;
    name?: string;
  }) => {
    setActionLoading(true);
    try {
      await authApi.updateProfile(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() });
      setToast("Profil berhasil disimpan ✓");
      setTimeout(() => setToast(""), 3000);
      return { success: true };
    } catch (error) {
      setToast("Gagal menyimpan profil.");
      setTimeout(() => setToast(""), 3000);
      return { success: false, error };
    } finally {
      setActionLoading(false);
    }
  };

  return { logout, updateProfile, actionLoading, toast, setToast };
};
