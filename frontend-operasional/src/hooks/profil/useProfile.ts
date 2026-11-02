import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiUserProfile } from "@/types";

export const useProfile = (isAuthenticated: boolean, _hasHydrated: boolean) => {
  const query = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => authApi.getProfile(),
    select: (res): ApiUserProfile => {
      const p = res?.data?.data || res?.data;
      return {
        ...p,
        name: p.nama?.replace(" - ", " ") || p.name,
        phone:
          p.noTelepon ||
          p.profilPetani?.noTelepon ||
          p.profilPenjual?.noTelepon ||
          p.phone ||
          "",
        role: p.peran || p.role,
      };
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
