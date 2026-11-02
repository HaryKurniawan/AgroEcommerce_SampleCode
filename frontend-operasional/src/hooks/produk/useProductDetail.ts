import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { productsApi, storesApi, addressesApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { EcomProduct, Store as EcomStore, ApiAddressData } from "@/types";

export const useProductDetail = (id: string, isAuthenticated: boolean) => {
  const [selectedGrade, setSelectedGrade] = useState<"A" | "B" | "C">("C");

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    select: (res): EcomProduct => res.data?.data || res.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const product = productQuery.data ?? null;

  const storeQuery = useQuery({
    queryKey: queryKeys.stores.detail(product?.tokoId ?? ""),
    queryFn: () => storesApi.getById(product!.tokoId),
    select: (res): EcomStore => res.data?.data || res.data,
    enabled: !!product?.tokoId,
    staleTime: 10 * 60 * 1000,
  });

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.getAll().catch(() => ({ data: [] })),
    select: (res): ApiAddressData[] => {
      const addrBody = res.data;
      return Array.isArray(addrBody?.data)
        ? addrBody.data
        : Array.isArray(addrBody)
          ? addrBody
          : [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Set grade otomatis saat product berhasil di-load
  const productData = productQuery.data;
  if (
    productData &&
    productData.grade &&
    productData.grade.length > 0 &&
    selectedGrade === "C"
  ) {
    const available = productData.grade.filter(
      (g: { stok: number }) => g.stok > 0,
    );
    if (available.length > 0) {
      const cheapest = [...available].sort(
        (a: { harga: number }, b: { harga: number }) => a.harga - b.harga,
      )[0];
      if (cheapest.grade !== selectedGrade) {
        setSelectedGrade(cheapest.grade);
      }
    }
  }

  const addrList = addressesQuery.data ?? [];
  const userAddress = addrList.find((a) => a.isDefault) || addrList[0] || null;

  const store = storeQuery.data ?? null;

  // Permissive check for out of area using buyer's city and store's allowed areas, matching backend logic
  const isOutOfArea = useMemo(() => {
    if (!store) return false;
    if (!userAddress) return false; // If no address, don't block yet (user will be prompted to set one)

    const buyerCity = (userAddress.kota || userAddress.provinsi || "")
      .toLowerCase()
      .trim();
    if (!buyerCity) return false;

    // Use store's areaCakupanKota if defined, fallback to store's kabupaten
    const allowedAreas =
      store.areaCakupanKota && store.areaCakupanKota.length > 0
        ? store.areaCakupanKota.map((a: string) => a.toLowerCase().trim())
        : store.kabupaten
          ? [store.kabupaten.toLowerCase().trim()]
          : [];

    if (allowedAreas.length === 0) return false; // Permissive fallback: if no areas restricted, allow

    const isAllowedArea = allowedAreas.some((area: string) => {
      return (
        buyerCity.includes(area) ||
        area.includes(buyerCity) ||
        buyerCity === area
      );
    });

    return !isAllowedArea;
  }, [store, userAddress]);

  const userWilayah = userAddress?.alamat?.includes("Bandung")
    ? "Bandung Raya"
    : "Lainnya";

  return {
    product,
    store,
    userAddress,
    addresses: addrList,
    loading: productQuery.isLoading,
    selectedGrade,
    setSelectedGrade,
    isOutOfArea,
    userWilayah,
  };
};
