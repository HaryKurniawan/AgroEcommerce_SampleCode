import { useQuery } from "@tanstack/react-query";

import { ordersApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiOrderData } from "@/types";

export const useOrdersSummary = (
  isAuthenticated: boolean,
  _hasHydrated: boolean,
) => {
  const query = useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: () => ordersApi.getMyOrders(),
    select: (res): ApiOrderData[] => {
      const data = res?.data?.data?.data || res?.data?.data || res?.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  return {
    orders: query.data ?? [],
    loading: query.isLoading,
    refetch: query.refetch,
  };
};
