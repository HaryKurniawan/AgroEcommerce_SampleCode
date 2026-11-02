import { useQuery } from "@tanstack/react-query";

import { categoriesApi, storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { queryKeys } from "@/hooks/query-keys";
import type { Category, Store as EcomStore } from "@/types";

export const useKatalogInit = () => {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.getAll(),
    select: (res): Category[] => extractArray<Category>(res),
    staleTime: 30 * 60 * 1000, // 30 menit
  });

  const storesQuery = useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: () => storesApi.getAll(),
    select: (res): EcomStore[] => extractArray<EcomStore>(res),
    staleTime: 10 * 60 * 1000,
  });

  return {
    categories: categoriesQuery.data ?? [],
    stores: storesQuery.data ?? [],
    loading: categoriesQuery.isLoading || storesQuery.isLoading,
    error: categoriesQuery.error ?? storesQuery.error,
  };
};
