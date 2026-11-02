"use client";

import React from "react";
import { Leaf, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import CartCountButton from "@/src/components/ecommerce/CartCountButton";
import SearchBar from "@/src/components/ecommerce/SearchBar";
import LocationSelector from "@/src/components/ecommerce/LocationSelector";
import type { AvailableCity } from "@/lib/location";

interface HomeMobileHeaderProps {
  isVerifiedB2B: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  onOpenFilter: () => void;
  selectedCity?: string | null;
  availableCities: AvailableCity[];
  onSelectCity: (city: string | null) => void;
}

const HomeMobileHeader: React.FC<HomeMobileHeaderProps> = ({
  isVerifiedB2B,
  search,
  onSearchChange,
  onSearchSubmit,
  onOpenFilter,
  selectedCity,
  availableCities,
  onSelectCity,
}) => {
  const router = useRouter();

  return (
    <div className="lg:hidden bg-gradient-to-br from-primary-700 via-primary-700 to-primary-900 text-white px-4 py-5 rounded-b-3xl shadow-md">
      {/* Row 1: Agro Market + Cart Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20">
            <Leaf size={20} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-xl leading-tight tracking-tight">
            Agro Market
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <CartCountButton variant="dark" size="sm" />
        </div>
      </div>

      {/* Row 2: Search Bar + Chat (if B2B) */}
      <div className="flex gap-2 items-stretch mb-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSearch={onSearchSubmit}
            onFilterClick={onOpenFilter}
            placeholder="Cari sayur, produk, toko..."
            variant="glass"
          />
        </div>
        {isVerifiedB2B && (
          <button
            onClick={() => router.push("/chat")}
            className="w-11 bg-white/10 hover:bg-white/20 rounded-xl active:scale-95 transition-all flex items-center justify-center border border-white/20 flex-shrink-0"
          >
            <MessageCircle size={20} className="text-white" />
          </button>
        )}
      </div>

      {/* Row 3: Location Selector (below search bar) */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-1">
          <LocationSelector
            selectedCity={selectedCity ?? null}
            availableCities={availableCities}
            onSelectCity={onSelectCity}
            variant="dark"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeMobileHeader;
