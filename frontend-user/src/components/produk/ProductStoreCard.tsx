"use client";

import React from "react";
import Image from "next/image";
import { MapPin, ArrowRight, Store, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductStoreCardProps {
  store: {
    id_toko: string;
    nama?: string;
    foto?: string;
    kabupaten?: string;
    rating?: number;
  } | null;
}

const ProductStoreCard: React.FC<ProductStoreCardProps> = ({ store }) => {
  const router = useRouter();

  return (
    <div className="px-4 lg:px-0">
      <button
        onClick={() => store?.id_toko && router.push(`/toko/${store.id_toko}`)}
        className="w-full group text-left"
      >
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-3xl hover:border-primary-200 transition-all duration-200">
          {/* Store Avatar */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-100 flex-shrink-0 flex items-center justify-center shadow-sm">
            {store?.foto ? (
              <Image
                src={store.foto}
                alt={store.nama || "Toko"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Store className="text-primary-600" size={22} />
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                {store?.nama || "Toko Agro"}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {store?.kabupaten && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} className="flex-shrink-0" />
                  {store.kabupaten}
                </span>
              )}
              {store?.rating && (
                <>
                  <span className="text-gray-200 text-xs">·</span>
                  <span className="text-[11px] text-amber-500 flex items-center gap-0.5 font-medium">
                    <Star size={10} fill="currentColor" />
                    {store.rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-primary-600 group-hover:bg-primary-50 transition-colors">
            Kunjungi
          </div>
        </div>
      </button>
    </div>
  );
};

export default ProductStoreCard;
