"use client";

// =====================================================
// STORE CARD — KARTU TOKO AGRO DAERAH
// =====================================================

import { useRouter } from "next/navigation";
import { Star, MapPin, ShoppingBag, Store as StoreIcon } from "lucide-react";

import type { Store } from "@/types";

interface StoreCardProps {
  store: Store;
  variant?: "compact" | "full";
}

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  variant = "compact",
}) => {
  const router = useRouter();

  if (variant === "compact") {
    return (
      <button
        onClick={() => router.push(`/toko/${store.id}`)}
        className="flex-shrink-0 w-44 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left group"
      >
        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-2">
          <StoreIcon size={20} />
        </div>
        <h3 className="font-display font-semibold text-sm text-gray-800 group-hover:text-primary-700 transition-colors">
          {store.nama}
        </h3>
        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
          <MapPin size={10} /> {store.kabupaten}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
            <Star size={10} fill="currentColor" /> {store.rating}
          </span>
          <span className="text-[10px] text-gray-400">
            {store.totalProduk} produk
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/toko/${store.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left group w-full"
    >
      <div className="flex items-start gap-4">
        <div className="text-primary-600 flex-shrink-0 w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
          <StoreIcon size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base text-gray-800 group-hover:text-primary-700 transition-colors">
            {store.nama}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {store.kabupaten} • {store.wilayah}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Star size={12} fill="currentColor" /> {store.rating}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ShoppingBag size={12} /> {store.totalProduk} produk
            </span>
            <span className="text-xs text-gray-400">
              {store.totalPenjualan.toLocaleString()} terjual
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {store.komoditasUnggulan?.slice(0, 3).map((k, i) => (
              <span key={i} className="badge-store">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default StoreCard;
