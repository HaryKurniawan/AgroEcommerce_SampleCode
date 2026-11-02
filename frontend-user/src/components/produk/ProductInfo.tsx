"use client";

import React from "react";
import { Star, Tag, CheckCircle2 } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { ApiAddressData } from "@/types";

interface ProductInfoProps {
  product: {
    id_produk: string;
    nama?: string;
    namaEtalase?: string;
    masterProdukId?: string;
    harga: number;
    satuan?: string;
    terjual?: number;
    rating?: number;
    varian?: {
      id_varianKemasan: string;
      ukuranKg: number;
      stokKemasan: number;
    }[];
    kemasan?: {
      id_varianKemasan: string;
      ukuranKg: number;
      stokKemasan: number;
    }[];
  };
  displayHarga: number;
  totalStok: number;
  onBulkOrder: () => void;
  onOpenCartModal: () => void;
  isAuthenticated: boolean;
  userAddress: ApiAddressData | null;
  isOutOfArea: boolean;
  onSetAddress: () => void;
  selectedVarianId?: string;
  onSelectVarian?: (id: string) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  displayHarga,
  totalStok,
  onBulkOrder,
  selectedVarianId,
  onSelectVarian,
}) => {
  return (
    <div className="px-4 lg:px-0 mt-4 lg:mt-0 space-y-5">
      {/* Variant Preview */}
      {(product.varian || product.kemasan)?.length ? (
        <div className="mb-4 pb-4 border-b border-gray-200/80 -mx-4 lg:mx-0 px-4 lg:px-0">
          <label
            htmlFor="kemasan-select"
            className="text-xs font-medium text-gray-600 block mb-2"
          >
            Pilih Kemasan:
          </label>
          <div
            id="kemasan-select"
            className="flex flex-wrap gap-2"
            role="group"
          >
            {(product.varian || product.kemasan)?.map((k) => {
              const isSelected = selectedVarianId === k.id_varianKemasan;
              return (
                <button
                  key={k.id_varianKemasan}
                  onClick={() => onSelectVarian?.(k.id_varianKemasan)}
                  className={`px-4 py-1 border rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-white border-primary-600 text-primary-600 shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  {k.ukuranKg} kg
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Product name, Price, Rating, Sold */}
      <div>
        <div className="flex items-start justify-between gap-4">
          {/* Left Column: Title & Price */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div>
              <h1 className="font-semibold text-xl lg:text-2xl text-gray-900 leading-snug">
                {product.namaEtalase || product.nama?.replace(" - ", " ")}
              </h1>
              {product.masterProdukId && product.namaEtalase && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Produk Terstandarisasi
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-semibold text-2xl text-primary-700 tracking-tight">
                {formatRupiah(displayHarga)}
              </span>
              <span className="text-sm text-gray-400">/ {product.satuan}</span>
            </div>
          </div>

          {/* Right Column: Rating & Stock */}
          <div className="flex flex-col items-end gap-3 shrink-0 mt-1">
            {/* Stock */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-500 font-medium">Stok:</span>
              <span className="text-xs font-bold text-gray-900 px-2.5 py-1 rounded-xl border border-gray-200">
                {totalStok} {product.satuan}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-gray-200">
              <Star size={12} fill="currentColor" className="text-amber-500" />
              <span className="text-xs font-bold text-gray-700">
                {product.rating?.toFixed(1) || "4.8"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium ml-0.5 border-l border-gray-200 pl-1.5">
                {(product.terjual || 0).toLocaleString()} terjual
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Order CTA */}
      <div className="lg:hidden mt-4 mb-6 pb-6 border-b border-gray-200/80">
        <button
          onClick={onBulkOrder}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 border border-primary-600 hover:border-primary-700 rounded-2xl transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200">
              <Tag size={16} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                Butuh lebih dari 100 {product.satuan}?
              </p>
              <p className="text-xs text-gray-500">
                Dapatkan harga grosir spesial
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors shadow-xs">
            Lihat
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
