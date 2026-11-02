"use client";

import { useRouter } from "next/navigation";
import { Plus, Star } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { EcomProduct } from "@/types";
import { useAuthStore } from "@/store/auth-store";

interface ProductCardProps {
  product: EcomProduct;
  hideCartOnMobile?: boolean;
  showCart?: boolean;
  hideRating?: boolean;
  hideSold?: boolean;
  onAddToCart?: (product: EcomProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  hideCartOnMobile = false,
  showCart = true,
  hideRating = false,
  hideSold = false,
  onAddToCart,
}) => {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const handleCardClick = () => {
    router.push(`/produk/${product.id}`);
  };

  // Show the lowest available grade price, or product.harga as fallback
  const displayPrice =
    product.grade && product.grade.length > 0
      ? Math.min(
          ...product.grade.filter((g) => g.stok > 0).map((g) => g.harga),
          ...product.grade.map((g) => g.harga),
        )
      : product.harga;

  const hasMultipleGrades = product.grade && product.grade.length > 1;

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left group w-full h-full flex flex-col shadow-sm cursor-pointer transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative bg-gray-50 h-36 lg:h-44 flex items-center justify-center flex-shrink-0 overflow-hidden border-b border-gray-50">
        {product.gambarUrl ? (
          <Image
            src={product.gambarUrl}
            alt={product.nama?.replace(" - ", " ")}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <span className="text-5xl lg:text-6xl group-hover:scale-110 transition-transform duration-300">
            📦
          </span>
        )}
        {product.diskonPersen && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
            -{product.diskonPersen}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-primary-700 transition-colors truncate">
          {product.nama?.replace(" - ", " ")}
        </h3>

        {/* Price */}
        <div className="mt-2.5">
          <p className="font-display font-bold text-primary-700 text-base">
            {formatRupiah(displayPrice)}
            <span className="text-[10px] text-gray-400 font-medium ml-1">
              /{product.satuan}
            </span>
          </p>
        </div>

        {/* Grade Tags Hidden */}

        {/* Meta */}
        {(!hideRating || !hideSold) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            {!hideRating && (
              <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-bold">
                <Star size={10} fill="currentColor" />{" "}
                {product.rating?.toFixed(1) || "4.8"}
              </span>
            )}
            {!hideSold && (
              <span className="text-[10px] text-gray-400 font-medium">
                {product.terjual || 0}+ terjual
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button — opens modal via parent */}
        {showCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!_hasHydrated) return;
              if (!isAuthenticated) {
                useAuthStore.getState().openLoginModal();
                return;
              }
              if (onAddToCart) onAddToCart(product);
            }}
            className={`w-full mt-4 py-2 bg-white border border-primary-300 hover:border-primary-500 hover:bg-primary-50 text-primary-600 rounded-xl text-xs font-bold items-center justify-center gap-1.5 transition-all active:scale-95 ${hideCartOnMobile ? "hidden lg:flex" : "flex"}`}
            aria-label={`Tambah ${product.nama?.replace(" - ", " ")} ke keranjang`}
          >
            <Plus size={14} /> Keranjang
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
