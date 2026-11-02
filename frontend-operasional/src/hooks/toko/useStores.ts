import { useQuery } from "@tanstack/react-query";

import { storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { queryKeys } from "@/hooks/query-keys";
import type { Store } from "@/types";

export const useStores = () => {
  const query = useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: () => storesApi.getAll(),
    select: (res): Store[] => extractArray<Store>(res),
    staleTime: 10 * 60 * 1000, // 10 menit
  });

  return {
    stores: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
