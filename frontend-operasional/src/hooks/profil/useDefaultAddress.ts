import { useQuery } from "@tanstack/react-query";

import { addressesApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiAddressData } from "@/types";

export const useDefaultAddress = (
  isAuthenticated: boolean,
  _hasHydrated: boolean,
) => {
  const query = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.getAll(),
    select: (res): ApiAddressData | null => {
      const addrData = res?.data?.data || res?.data || [];
      if (!Array.isArray(addrData)) return null;
      return (
        addrData.find((a: ApiAddressData) => a.isDefault) || addrData[0] || null
      );
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    defaultAddress: query.data ?? null,
    loading: query.isLoading,
    refetch: query.refetch,
  };
};
