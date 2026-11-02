"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

import type { SortOption } from "@/hooks/product/useFilterState";

interface KatalogToolbarProps {
  total: number;
  search: string;
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "populer", label: "Populer" },
  { value: "terdekat", label: "Terdekat" },
  { value: "price_asc", label: "Termurah" },
  { value: "price_desc", label: "Termahal" },
  { value: "rating", label: "Rating ⭐" },
];

const KatalogToolbar: React.FC<KatalogToolbarProps> = ({
  total,
  search,
  sortBy,
  onSortChange,
}) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden lg:flex flex-wrap gap-4 items-center justify-between mb-5 px-1">
      <div>
        <h1 className="font-display font-semibold text-xl text-gray-900 tracking-tight">
          {search
            ? `Menampilkan hasil untuk "${search}"`
            : "Katalog Produk Agro"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Sebanyak {total} produk ditemukan
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Urutkan:</span>
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 rounded-full px-4 py-2 min-w-[160px] transition-all outline-none"
          >
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
              "Urutkan"}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`absolute right-0 top-full mt-2 w-[180px] bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden py-1 transform transition-all duration-300 origin-top-right ${
              isSortDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setIsSortDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between hover:bg-gray-50 group"
              >
                <span
                  className={`${sortBy === opt.value ? "font-bold text-primary-600" : "text-gray-700 font-medium group-hover:text-primary-600"}`}
                >
                  {opt.label}
                </span>
                {sortBy === opt.value && (
                  <Check size={16} className="text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KatalogToolbar;
