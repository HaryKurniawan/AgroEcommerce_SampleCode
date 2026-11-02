"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { computeAvailableCities } from "@/lib/location";
import { useCityStore } from "@/src/store/city-store";
import { queryKeys } from "@/src/hooks/query-keys";
import type { Store as EcomStore } from "@/types";

/**
 * Hook ringan untuk komponen yang butuh state lokasi (mis. Navbar desktop):
 * - selectedCity & setCity (dari city-store global, persisted)
 * - availableCities (kota yang punya seller aktif)
 * - stores (untuk filter lanjutan bila diperlukan)
 */
export const useLocationFilter = () => {
  const { selectedCity, setCity } = useCityStore();

  const storesQuery = useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: () => storesApi.getAll().catch(() => ({ data: { data: [] } })),
    select: (res): EcomStore[] => extractArray<EcomStore>(res),
    staleTime: 10 * 60 * 1000,
  });

  const stores = storesQuery.data ?? [];
  const availableCities = useMemo(
    () => computeAvailableCities(stores),
    [stores],
  );

  return { selectedCity, setCity, availableCities, stores };
};
