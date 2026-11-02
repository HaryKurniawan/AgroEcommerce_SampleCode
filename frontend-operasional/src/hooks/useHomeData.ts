"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";
import {
  storesApi,
  productsApi,
  categoriesApi,
  addressesApi,
} from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { queryKeys } from "@/hooks/query-keys";
import type {
  EcomProduct,
  Store as EcomStore,
  Category,
  ApiAddressData as Address,
} from "@/types";

export const useHomeData = () => {
  const { isAuthenticated, user } = useAuthStore();

  const storesQuery = useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: () => storesApi.getAll().catch(() => ({ data: { data: [] } })),
    select: (res): EcomStore[] => extractArray<EcomStore>(res),
    staleTime: 10 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 40 }),
    queryFn: () =>
      productsApi.getAll({ limit: 40 }).catch(() => ({ data: { data: [] } })),
    select: (res): EcomProduct[] => extractArray<EcomProduct>(res),
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.getAll().catch(() => ({ data: [] })),
    select: (res): Category[] => extractArray<Category>(res),
    staleTime: 30 * 60 * 1000,
  });

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.getAll().catch(() => ({ data: [] })),
    select: (res): Address[] => extractArray<Address>(res),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const loading =
    storesQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    (isAuthenticated && addressesQuery.isLoading);

  return {
    stores: storesQuery.data ?? [],
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    addresses: addressesQuery.data ?? [],
    loading,
    isAuthenticated,
    isVerifiedB2B: user?.isVerifiedB2B === true,
  };
};
