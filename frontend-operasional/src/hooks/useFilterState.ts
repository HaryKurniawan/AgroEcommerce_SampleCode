"use client";

import { useState, useCallback, useMemo } from "react";

export type SortOption = "populer" | "price_asc" | "price_desc" | "rating";

interface UseFilterStateParams {
  initialCategory?: string;
  initialStore?: string;
  initialPrice?: string;
  initialSort?: SortOption;
  initialSearch?: string;
}

/**
 * Hook to manage filtering and sorting state for products.
 */
export function useFilterState(params: UseFilterStateParams = {}) {
  const [selectedCategory, setSelectedCategory] = useState(
    params.initialCategory || "",
  );
  const [selectedStore, setSelectedStore] = useState(params.initialStore || "");
  const [selectedPrice, setSelectedPrice] = useState(
    params.initialPrice || "Semua Harga",
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    params.initialSort || "populer",
  );
  const [search, setSearch] = useState(params.initialSearch || "");

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedStore) count++;
    if (selectedPrice !== "Semua Harga") count++;
    if (sortBy !== "populer") count++;
    return count;
  }, [selectedCategory, selectedStore, selectedPrice, sortBy]);

  const resetFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedStore("");
    setSelectedPrice("Semua Harga");
    setSortBy("populer");
    setSearch("");
  }, []);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedStore,
    setSelectedStore,
    selectedPrice,
    setSelectedPrice,
    sortBy,
    setSortBy,
    search,
    setSearch,
    activeFiltersCount,
    resetFilters,
  };
}
