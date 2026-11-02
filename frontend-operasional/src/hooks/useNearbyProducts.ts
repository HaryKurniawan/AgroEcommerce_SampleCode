"use client";

import { useMemo } from "react";

import { calculateDistance } from "@/lib/geo";
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
  maxDistanceKm = 25,
  maxProductsPerStore = 2,
  limit = 8,
}: UseNearbyProductsProps) => {
  return useMemo(() => {
    // 1. Get user coordinates from default address
    let userLat: number | null = null;
    let userLng: number | null = null;

    if (Array.isArray(addresses) && addresses.length > 0) {
      const primaryAddress = addresses.find((a) => a.isDefault) || addresses[0];
      if (primaryAddress.lat && primaryAddress.lng) {
        userLat = Number(primaryAddress.lat);
        userLng = Number(primaryAddress.lng);
      }
    }

    if (
      userLat === null ||
      userLng === null ||
      !stores.length ||
      !products.length
    )
      return [];

    // 2. Find nearby stores
    const validtokoIds = new Set(
      stores
        .map((store) => {
          if (!store.lat || !store.lng) return null;
          const distance = calculateDistance(
            userLat!,
            userLng!,
            Number(store.lat),
            Number(store.lng),
          );
          return distance <= maxDistanceKm ? store.id : null;
        })
        .filter((id): id is string => id !== null),
    );

    // 3. Filter products from those stores
    const allNearbyProducts = products.filter((p) =>
      validtokoIds.has(p.tokoId),
    );

    // 4. Limit items per store for variety
    const productGroupsByStore = new Map<string, EcomProduct[]>();

    allNearbyProducts.forEach((product) => {
      const group = productGroupsByStore.get(product.tokoId) || [];
      group.push(product);
      productGroupsByStore.set(product.tokoId, group);
    });

    const selectedNearbyProducts: EcomProduct[] = [];
    productGroupsByStore.forEach((groupProducts) => {
      selectedNearbyProducts.push(
        ...groupProducts
          .sort((a, b) => {
            const scoreA = (a.terjual || 0) * 0.7 + (a.rating || 0) * 0.3;
            const scoreB = (b.terjual || 0) * 0.7 + (b.rating || 0) * 0.3;
            return scoreB - scoreA;
          })
          .slice(0, maxProductsPerStore),
      );
    });

    return selectedNearbyProducts
      .sort((a, b) => (b.terjual || 0) - (a.terjual || 0))
      .slice(0, limit);
  }, [products, stores, addresses, maxDistanceKm, maxProductsPerStore, limit]);
};
