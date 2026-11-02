"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

import ProductCard from "@/src/components/ecommerce/ProductCard";
import SectionHeader from "@/src/components/ecommerce/SectionHeader";
import type { EcomProduct } from "@/types";

interface PopularProductsSectionProps {
  products: EcomProduct[];
  selectedCity?: string | null;
  onAddToCart: (product: EcomProduct) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const PopularProductsSection: React.FC<PopularProductsSectionProps> = ({
  products,
  selectedCity,
  onAddToCart,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const router = useRouter();

  const popularProducts = useMemo(() => {
    return Array.isArray(products)
      ? [...products].sort((a, b) => (b.terjual || 0) - (a.terjual || 0))
      : [];
  }, [products]);

  const title = selectedCity ? `Produk di ${selectedCity}` : "Semua Produk";

  if (popularProducts.length === 0) {
    return (
      <section>
        <SectionHeader title={title} actionHref="/katalog" />
        <div className="py-10 text-center bg-white rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500">
            Belum ada produk
            {selectedCity ? ` di ${selectedCity}` : ""}.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Coba pilih lokasi lain di bagian atas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={title} actionHref="/katalog" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        {popularProducts.map((product, index) => (
          <ProductCard
            key={product.id_produk ? `${product.id_produk}-${index}` : index}
            product={product}
            onAddToCart={onAddToCart}
            hideCartOnMobile={true}
          />
        ))}
      </div>
      <div className="mt-6 px-4 lg:px-0 flex flex-col gap-3">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage && fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3.5 rounded-xl border border-primary-200 text-primary-600 font-medium text-sm hover:bg-primary-50 active:bg-primary-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        )}
        <button
          onClick={() => router.push("/katalog")}
          className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          Lihat Semua Produk di Katalog
        </button>
      </div>
    </section>
  );
};

export default PopularProductsSection;
