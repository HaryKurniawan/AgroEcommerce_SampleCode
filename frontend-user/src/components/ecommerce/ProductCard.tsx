"use client";

import { useRouter } from "next/navigation";
import { Plus, Star, MapPin } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { EcomProduct } from "@/types";
import { useAuthStore } from "@/src/store/auth-store";

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
    router.push(`/produk/${product.id_produk}`);
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

  // Lokasi seller (kota) — tampil untuk semua pengunjung termasuk guest
  const storeCity = product.storeCity || product.toko?.kabupaten;

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
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-left group w-full h-full flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative bg-gray-50 h-36 lg:h-40 flex items-center justify-center flex-shrink-0 overflow-hidden border-b border-gray-50">
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
      <div className="p-3 flex flex-col flex-1">
        {/* Price — PALING ATAS */}
        <div className="mb-1.5">
          <p className="font-display font-bold text-primary-700 text-base leading-tight">
            {formatRupiah(displayPrice)}
            <span className="text-[10px] text-gray-400 font-medium ml-1">
              /{product.satuan}
            </span>
          </p>
          {hasMultipleGrades && (
            <p className="text-[9px] text-gray-400 font-medium">mulai dari</p>
          )}
        </div>

        {/* Nama Produk — LEBIH BESAR */}
        <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2 mb-1">
          {product.nama?.replace(" - ", " ")}
        </h3>

        {/* Label komoditas / kategori */}
        {product.kategoriNama && (
          <span className="inline-flex w-fit items-center mt-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
            {product.kategoriNama}
          </span>
        )}

        {/* Bottom Section (Pushed to bottom) */}
        <div className="mt-auto">
          {/* Meta */}
          {(!hideRating || !hideSold) && (
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                {!hideRating && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
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
              {product.stok !== undefined && (
                <span className="text-[9px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-md border border-green-100 whitespace-nowrap">
                  Stok: {product.stok}
                </span>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
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
              className={`w-full mt-3 py-2 bg-white border border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-primary-600 rounded-xl text-xs font-medium items-center justify-center gap-1.5 transition-all active:scale-95 ${hideCartOnMobile ? "hidden" : "flex lg:hidden"}`}
              aria-label={`Tambah ${product.nama?.replace(" - ", " ")} ke keranjang`}
            >
              <Plus size={14} /> Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
