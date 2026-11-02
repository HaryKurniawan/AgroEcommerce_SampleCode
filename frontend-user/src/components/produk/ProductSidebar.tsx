"use client";

import React from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";

import ProductStoreCard from "./ProductStoreCard";

interface ProductSidebarProps {
  product: {
    satuan?: string;
    nama?: string;
    namaEtalase?: string;
    masterProdukId?: string;
    terjual?: number;
  };
  quantity: number;
  setQuantity: (qty: number) => void;
  displayHarga: number;
  displayStok: number;
  totalStok: number;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onChatSeller: () => void;
  onBulkOrder: () => void;
  chatLoading: boolean;
  actionLoading: boolean;
  isOutOfArea?: boolean;
  isAuthenticated?: boolean;
  store: {
    id_toko: string;
    nama?: string;
    foto?: string;
    kabupaten?: string;
    rating?: number;
  } | null;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  product,
  quantity,
  setQuantity,
  displayHarga,
  displayStok,
  totalStok,
  onBuyNow,
  onAddToCart,
  onChatSeller,
  onBulkOrder,
  chatLoading,
  actionLoading,
  isOutOfArea = false,
  isAuthenticated = false,
  store,
}) => {
  const isShoppingDisabled = isAuthenticated && isOutOfArea;

  return (
    <aside className="hidden lg:block w-[330px] xl:w-[360px] flex-shrink-0 font-normal">
      <div
        className="fixed top-40 z-30 w-[330px] xl:w-[360px] space-y-4"
        style={{ right: "max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))" }}
      >
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-normal text-gray-700">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Atur Pembelian
            </h2>
          </div>

          {/* Bulk Order CTA */}
          <div className="mb-5 border-b border-gray-200/80 pb-5">
            <button
              onClick={onBulkOrder}
              disabled={isShoppingDisabled}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50/80 border border-primary-600 hover:border-primary-700 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                <Tag size={15} className="text-primary-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    Butuh lebih dari 100 {product.satuan}?
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Ajukan order grosir
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-white bg-primary-600 px-2.5 py-1 rounded-lg group-hover:bg-primary-700 transition-colors whitespace-nowrap shadow-xs">
                Lihat
              </span>
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-lg font-bold text-gray-900">
              {formatRupiah(displayHarga)}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 font-normal">
            <button
              onClick={onBuyNow}
              disabled={actionLoading || isShoppingDisabled}
              className="w-full h-12 bg-primary-600 text-white rounded-2xl font-normal hover:bg-primary-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {actionLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  Beli Sekarang
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={onChatSeller}
                disabled={chatLoading || actionLoading}
                className="w-11 h-11 bg-white border border-gray-200 text-gray-700 rounded-2xl font-normal hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50 shrink-0"
                title="Tanya Penjual"
              >
                {chatLoading ? (
                  <Loader2 size={15} className="animate-spin text-gray-500" />
                ) : (
                  <MessageCircle
                    size={15}
                    strokeWidth={2}
                    className="text-gray-500"
                  />
                )}
              </button>

              <button
                onClick={onAddToCart}
                disabled={actionLoading || isShoppingDisabled}
                className="flex-1 h-11 bg-white border border-gray-200 text-gray-700 rounded-2xl font-normal hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                <ShoppingCart
                  size={15}
                  strokeWidth={2}
                  className="text-gray-500"
                />
                Tambah ke Keranjang
              </button>
            </div>

            {isShoppingDisabled && (
              <div className="text-center text-xs text-red-500 mt-3 p-2 bg-red-50/50 rounded-2xl border border-red-100 font-normal">
                Toko di luar jangkauan pengiriman Anda
              </div>
            )}
          </div>
        </div>

        {/* Store Card section below */}
        {store && <ProductStoreCard store={store} />}
      </div>
    </aside>
  );
};

export default ProductSidebar;
