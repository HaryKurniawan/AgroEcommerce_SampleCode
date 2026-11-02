"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navigation, Leaf } from "lucide-react";

import ProductCard from "@/src/components/ecommerce/ProductCard";
import SectionHeader from "@/src/components/ecommerce/SectionHeader";
import { useNearbyProducts } from "@/src/hooks/product/useNearbyProducts";
import type { EcomProduct, Store as EcomStore } from "@/types";

interface NearbyProductsSectionProps {
  products: EcomProduct[];
  stores: EcomStore[];
  addresses: any[];
  onAddToCart: (product: EcomProduct) => void;
}

const NearbyProductsSection: React.FC<NearbyProductsSectionProps> = ({
  products,
  stores,
  addresses,
  onAddToCart,
}) => {
  const router = useRouter();
  const nearbyProducts = useNearbyProducts({ products, stores, addresses });

  if (nearbyProducts.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="Produk Sekitar Anda"
        icon={Navigation}
        actionHref="/katalog?sortBy=terdekat"
      />

      <div className="overflow-x-auto scroll-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-3 lg:grid lg:grid-cols-4 items-stretch pb-2">
          {nearbyProducts.map((product) => (
            <div
              key={product.id_produk}
              className="flex-shrink-0 w-[190px] lg:w-auto flex"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                hideRating={true}
                hideSold={true}
              />
            </div>
          ))}

          {/* Fallback Empty/Explore Cards */}
          {nearbyProducts.length < 4 &&
            Array.from({ length: 4 - nearbyProducts.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-[190px] lg:w-auto flex"
              >
                <button
                  onClick={() => router.push("/katalog?sortBy=terdekat")}
                  className="w-full h-full min-h-[250px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 text-center group transition-all border border-gray-200 hover:border-primary-200 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 scale-110 transition-transform group-hover:scale-125">
                    <Leaf size={18} className="text-primary-500" />
                  </div>
                  <p className="text-xs font-medium text-primary-700 transition-colors group-hover:text-primary-600">
                    Eksplor produk daerah lain
                  </p>
                </button>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default NearbyProductsSection;
