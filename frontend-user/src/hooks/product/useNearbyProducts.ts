"use client";

import { useMemo } from "react";

import type {
  EcomProduct,
  Store as EcomStore,
  ApiAddressData as Address,
} from "@/types";

interface UseNearbyProductsProps {
  products: EcomProduct[];
  stores: EcomStore[];
  addresses: Address[];
  maxDistanceKm?: number;
  maxProductsPerStore?: number;
  limit?: number;
}

export const useNearbyProducts = ({
  products,
  stores,
  addresses,
  maxProductsPerStore = 2,
  limit = 8,
}: UseNearbyProductsProps) => {
  return useMemo(() => {
    if (!Array.isArray(addresses) || addresses.length === 0) return [];
    if (!stores.length || !products.length) return [];

    // 1. Get user's active city from default address
    const primaryAddress = addresses.find((a) => a.isDefault) || addresses[0];
    const userKota = primaryAddress?.kota?.toLowerCase().trim();

    if (!userKota) return [];

    const normalizeString = (str: string) => str.toLowerCase().trim();

    // 2. Find stores whose kabupaten EXACTLY matches the user's city
    const validTokoIds = new Set(
      stores
        .filter((store) => {
          const storeKab = normalizeString(store.kabupaten || "");
          if (storeKab === userKota) return true;

          // Also check areaCakupanKota if available
          if (store.areaCakupanKota && Array.isArray(store.areaCakupanKota)) {
            return store.areaCakupanKota.some(
              (c) => normalizeString(c) === userKota,
            );
          }
          return false;
        })
        .map((store) => store.id_toko),
    );

    // Jika hanya ada 1 toko di kota tersebut (atau tidak ada), jangan tampilkan fitur produk sekitar
    if (validTokoIds.size <= 1) return [];

    // 3. Filter products from those stores
    const allNearbyProducts = products.filter((p) =>
      validTokoIds.has(p.tokoId),
    );

    // 4. Limit items per store for variety
    const productGroupsByStore = new Map<string, EcomProduct[]>();

    allNearbyProducts.forEach((product) => {
      const group = productGroupsByStore.get(product.tokoId) || [];
      group.push(product);
      productGroupsByStore.set(product.tokoId, group);
    });

    const storeCount = productGroupsByStore.size;
    // Jika toko sedikit, izinkan lebih banyak produk per toko agar bagian sekitar tidak kosong
    const dynamicMaxPerStore =
      storeCount > 0
        ? Math.max(maxProductsPerStore, Math.ceil(limit / storeCount))
        : maxProductsPerStore;

    const selectedNearbyProducts: EcomProduct[] = [];
    productGroupsByStore.forEach((groupProducts) => {
      selectedNearbyProducts.push(
        ...groupProducts
          .sort((a, b) => {
            const scoreA = (a.terjual || 0) * 0.7 + (a.rating || 0) * 0.3;
            const scoreB = (b.terjual || 0) * 0.7 + (b.rating || 0) * 0.3;
            return scoreB - scoreA;
          })
          .slice(0, dynamicMaxPerStore),
      );
    });

    return selectedNearbyProducts
      .sort((a, b) => (b.terjual || 0) - (a.terjual || 0))
      .slice(0, limit);
  }, [products, stores, addresses, maxProductsPerStore, limit]);
};
