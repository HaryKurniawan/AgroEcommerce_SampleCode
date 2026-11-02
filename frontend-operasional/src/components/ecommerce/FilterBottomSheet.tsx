"use client";

import React from "react";

import BottomSheet from "@/components/ui/BottomSheet";
import type { Category, Store } from "@/types";

/**
 * Reusable filter bottom sheet for categories, stores, and price range.
 */
interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  stores?: Store[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedStore?: string;
  onStoreChange?: (id: string) => void;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
  onReset: () => void;
  onApply?: () => void;
  showSortOptions?: boolean;
  sortBy?: string;
  onSortChange?: (sort: any) => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  categories,
  stores,
  selectedCategory,
  onCategoryChange,
  selectedStore,
  onStoreChange,
  selectedPrice,
  onPriceChange,
  onReset,
  onApply,
  showSortOptions = false,
  sortBy,
  onSortChange,
}) => {
  const SORT_OPTIONS = [
    { value: "populer", label: "Populer" },
    { value: "price_asc", label: "Termurah" },
    { value: "price_desc", label: "Termahal" },
    { value: "rating", label: "Rating ⭐" },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Produk"
      footer={
        <button
          onClick={() => {
            if (onApply) onApply();
            onClose();
          }}
          className="w-full py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-[0.98]"
        >
          Terapkan Filter
        </button>
      }
    >
      <div className="space-y-6 pb-4">
        {/* Reset Button (placed at top right of content) */}
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-red-500 hover:underline"
          >
            Reset Semua
          </button>
        </div>

        {/* Sort Options (Optional, for Katalog) */}
        {showSortOptions && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Urutkan Produk
            </p>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSortChange && onSortChange(s.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    sortBy === s.value
                      ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Kategori Produk
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange("")}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedCategory === ""
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                }`}
              >
                {cat.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Stores (Optional) */}
        {stores && stores.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Toko</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStoreChange && onStoreChange("")}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedStore === ""
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                }`}
              >
                Semua Toko
              </button>
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onStoreChange && onStoreChange(store.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                    selectedStore === store.id
                      ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {store.nama}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Rentang Harga
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Semua Harga",
              "Di bawah Rp 25rb",
              "Rp 25rb - Rp 50rb",
              "Di atas Rp 50rb",
            ].map((price, idx) => (
              <button
                key={idx}
                onClick={() => onPriceChange(price)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedPrice === price
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                }`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default FilterBottomSheet;
