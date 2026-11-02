"use client";

import React from "react";
import { X } from "lucide-react";

import type { Store } from "@/types";
import type { SortOption } from "@/hooks/product/useFilterState";

interface ActiveFilterChipsProps {
  selectedStore: string;
  setSelectedStore: (v: string) => void;
  selectedPrice: string;
  setSelectedPrice: (v: string) => void;
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
  stores: Store[];
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "populer", label: "Populer" },
  { value: "terdekat", label: "📍 Terdekat" },
  { value: "price_asc", label: "Termurah" },
  { value: "price_desc", label: "Termahal" },
  { value: "rating", label: "Rating ⭐" },
];

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  selectedStore,
  setSelectedStore,
  selectedPrice,
  setSelectedPrice,
  sortBy,
  setSortBy,
  stores,
  onReset,
}) => {
  const hasFilters =
    selectedStore || selectedPrice !== "Semua Harga" || sortBy !== "populer";

  if (!hasFilters) return null;

  return (
    <div className="lg:hidden mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedStore && (
          <span className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold border border-primary-100">
            {stores.find((s) => s.id_toko === selectedStore)?.nama || "Toko"}
            <button onClick={() => setSelectedStore("")} className="ml-0.5">
              <X size={11} />
            </button>
          </span>
        )}
        {selectedPrice !== "Semua Harga" && (
          <span className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold border border-primary-100">
            {selectedPrice}
            <button
              onClick={() => setSelectedPrice("Semua Harga")}
              className="ml-0.5"
            >
              <X size={11} />
            </button>
          </span>
        )}
        {sortBy !== "populer" && (
          <span className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold border border-primary-100">
            {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
            <button onClick={() => setSortBy("populer")} className="ml-0.5">
              <X size={11} />
            </button>
          </span>
        )}
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-red-500 underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ActiveFilterChips;
