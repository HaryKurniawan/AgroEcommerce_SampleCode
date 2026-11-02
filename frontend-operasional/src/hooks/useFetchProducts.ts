"use client";

import { useQuery } from "@tanstack/react-query";

import { productsApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { queryKeys } from "@/hooks/query-keys";
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

  const query = useQuery({
    queryKey: queryKeys.products.list({
      search,
      kategoriId,
      tokoId,
      sortBy,
      limit,
    }),
    queryFn: () =>
      productsApi.getAll({
        search,
        kategoriId: kategoriId,
        tokoId: tokoId,
        sortBy,
        limit,
      }),
    select: (res) => {
      const data = extractArray<EcomProduct>(res);
      const rawRes = res.data;
      const total = rawRes?.data?.total || rawRes?.total || data.length;
      return { products: data, total };
    },
    staleTime: 5 * 60 * 1000, // 5 menit data dianggap segar
    gcTime: 15 * 60 * 1000, // 15 menit data disimpan di memori saat tidak tampil
    refetchOnWindowFocus: false, // jangan fetch ulang hanya karena user pindah tab
    placeholderData: (prev) => prev, // smooth transitions saat filter berubah
  });

  return {
    products: query.data?.products ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading || query.isFetching,
    error: query.error ? "Gagal memuat produk. Silakan coba lagi." : null,
    refetch: query.refetch,
  };
}
