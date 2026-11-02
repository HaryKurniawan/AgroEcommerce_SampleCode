"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { productsApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { queryKeys } from "@/src/hooks/query-keys";
import type { EcomProduct } from "@/types";

interface UseFetchProductsParams {
  search?: string;
  kategoriId?: string;
  tokoId?: string;
  sortBy?: string;
  limit?: number;
}

export function useFetchProducts(params: UseFetchProductsParams = {}) {
  const { search, kategoriId, tokoId, sortBy = "populer", limit = 50 } = params;

  const query = useInfiniteQuery({
    queryKey: queryKeys.products.list({
      search,
      kategoriId,
      tokoId,
      sortBy,
      limit,
    }),
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getAll({
        search,
        kategoriId: kategoriId,
        tokoId: tokoId,
        sortBy,
        limit,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const data = extractArray<EcomProduct>(lastPage);
      if (data.length === limit) return allPages.length + 1;
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products =
    query.data?.pages.flatMap((page) =>
      extractArray<EcomProduct>(page).map((p: any) => ({
        ...p,
        id: p.id_produk || p.id_produk,
      })),
    ) ?? [];
  const rawFirstPage = query.data?.pages[0]?.data;
  const total =
    rawFirstPage?.data?.total || rawFirstPage?.total || products.length;

  return {
    products,
    total,
    loading: query.isLoading || query.isFetching,
    error: query.error ? "Gagal memuat produk. Silakan coba lagi." : null,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
