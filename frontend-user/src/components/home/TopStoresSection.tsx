"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Store, Star, ShoppingBag } from "lucide-react";

import StoreCard from "@/src/components/ecommerce/StoreCard";
import SectionHeader from "@/src/components/ecommerce/SectionHeader";
import type { Store as EcomStore } from "@/types";

interface TopStoresSectionProps {
  stores: EcomStore[];
}

const TopStoresSection: React.FC<TopStoresSectionProps> = ({ stores }) => {
  const router = useRouter();

  const topStores = useMemo(() => {
    return Array.isArray(stores)
      ? [...stores]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8)
      : [];
  }, [stores]);

  return (
    <section>
      <SectionHeader
        title="Toko Agro Daerah"
        subtitle={`${stores.length} toko tersebar di seluruh Jawa Barat`}
        icon={MapPin}
        actionHref="/toko"
      />

      {/* Mobile Horizontal Scroll */}
      <div className="lg:hidden overflow-x-auto scroll-hide -mx-4 px-4">
        <div className="flex gap-3">
          {topStores.map((store) => (
            <StoreCard key={store.id_toko} store={store} variant="compact" />
          ))}
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {topStores.map((store) => (
          <button
            key={store.id_toko}
            onClick={() => router.push(`/toko/${store.id_toko}`)}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Store size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm text-gray-800 group-hover:text-primary-700 transition-colors truncate">
                  {store.nama}
                </h3>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {store.kabupaten}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                <Star size={12} fill="currentColor" /> {store.rating}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <ShoppingBag size={11} /> {store.totalProduk} produk
              </span>
              <span className="text-[11px] text-gray-400">
                {store.totalPenjualan?.toLocaleString() || 0} terjual
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {store.komoditasUnggulan?.slice(0, 3).map((k, i) => (
                <span
                  key={i}
                  className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-[10px] font-medium border border-primary-100"
                >
                  {k}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TopStoresSection;
