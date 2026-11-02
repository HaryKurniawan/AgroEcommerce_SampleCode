"use client";

import React from "react";
import { Search, SlidersHorizontal, MessageCircle, Leaf } from "lucide-react";

import CartCountButton from "@/src/components/ecommerce/CartCountButton";

interface StickySearchBarProps {
  show: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenFilter: () => void;
  isVerifiedB2B: boolean;
  onChatClick: () => void;
}

const StickySearchBar: React.FC<StickySearchBarProps> = ({
  show,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenFilter,
  isVerifiedB2B,
  onChatClick,
}) => {
  return (
    <div
      className={`lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-4 shadow-sm transition-all duration-300 ${
        show
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-2">
        {/* Leaf Icon */}
        <div className="flex-shrink-0 mr-2">
          <Leaf size={24} className="text-emerald-600" />
        </div>

        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari sayur, produk, toko..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
            className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
          />
          <button
            onClick={onOpenFilter}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <SlidersHorizontal size={16} className="text-gray-500" />
          </button>
        </div>
        {isVerifiedB2B && (
          <button
            onClick={onChatClick}
            className="relative p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0"
            aria-label="Chat"
          >
            <MessageCircle size={20} className="text-gray-600" />
          </button>
        )}
        <CartCountButton
          variant="light"
          size="sm"
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0 lg:hidden"
        />
      </div>
    </div>
  );
};

export default StickySearchBar;
