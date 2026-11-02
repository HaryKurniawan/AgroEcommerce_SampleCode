"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Loader2,
  Info,
  BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { useProductDetail } from "@/src/hooks/produk/useProductDetail";
import { useAuthStore } from "@/src/store/auth-store";
import { apiClient } from "@/src/lib/api-client";

export default function GrosirLandingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const { product, loading: productLoading } = useProductDetail(
    id,
    isAuthenticated,
  );

  // Fetch diskon grosir dari config toko
  const { data: diskonGrosirPersen = 0, isLoading: diskonLoading } =
    useQuery<number>({
      queryKey: [
        "toko",
        "harga",
        "config",
        "diskon-grosir-public",
        product?.tokoId,
      ],
      queryFn: async () => {
        try {
          const res = await apiClient.get(`/toko/harga/config`);
          return res.data?.data?.diskonGrosirPersen ?? 0;
        } catch {
          return 0;
        }
      },
      enabled: _hasHydrated && !!product?.tokoId,
      staleTime: 5 * 60 * 1000,
    });

  if (productLoading || !_hasHydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  const handleOrder = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/produk/${id}/beli-grosir`);
      return;
    }
    router.push(`/produk/${id}/beli-grosir`);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push(`/produk/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-semibold text-sm text-gray-900 text-center flex-1">
          Pembelian Grosir
        </h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-5 pt-6 pb-36 max-w-md mx-auto w-full">
        {/* Illustration */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] mb-5">
          <Image
            src="/images/grosir-hero.svg"
            alt="Pembelian Grosiran"
            width={380}
            height={280}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Title Section */}
        <div className="text-center mb-5">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug tracking-tight">
            Beli Banyak, Lebih Hemat
          </h2>

          {diskonLoading ? (
            <div className="mt-2.5 h-7 w-40 mx-auto bg-gray-200/70 rounded-full animate-pulse" />
          ) : (
            diskonGrosirPersen > 0 && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-100/80 px-3.5 py-1.5 rounded-full text-xs font-medium">
                <Sparkles size={14} className="text-primary-600" />
                <span>Diskon {diskonGrosirPersen}% untuk Pesanan Grosir</span>
              </div>
            )
          )}
        </div>

        {/* Dynamic Condition Card */}
        {product &&
          (() => {
            const stok = product.stok || 0;
            const minGrosir = Math.max(100, stok + 1);
            const isOverStock = stok < 100 || minGrosir > 100;

            return (
              <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 text-left space-y-2 shadow-xs mb-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-semibold text-gray-800 truncate max-w-[170px]">
                    {product.nama}
                  </span>
                  <span className="text-[11px] font-medium text-primary-700 bg-primary-50 border border-primary-100/60 px-2.5 py-1 rounded-lg">
                    Min: {minGrosir.toLocaleString("id-ID")}{" "}
                    {product.satuan || "kg"}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <Info
                    size={14}
                    className="text-primary-600 shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {isOverStock ? (
                      <>
                        Stok tersedia saat ini:{" "}
                        <strong>
                          {stok.toLocaleString("id-ID")}{" "}
                          {product.satuan || "kg"}
                        </strong>
                        . Pesanan di atas stok otomatis diproses secara{" "}
                        <strong>Pre-Order / Booking</strong>.
                      </>
                    ) : (
                      <>
                        Pemesanan grosir diproses langsung dari toko petani
                        dengan jaminan kesegaran.
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })()}

        {/* Guide Card Link */}
        <button
          onClick={() => router.push(`/produk/${id}/grosir/keuntungan`)}
          className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200/80 hover:border-primary-400 hover:bg-gray-50/50 rounded-2xl transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/60">
              <BookOpen size={15} />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
              Lihat Keuntungan &amp; Tata Cara
            </span>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"
          />
        </button>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/80 px-4 py-3.5 pb-safe">
        <div className="max-w-md mx-auto space-y-2">
          {diskonGrosirPersen > 0 && (
            <p className="text-center text-[11px] text-gray-500 font-normal">
              Hemat{" "}
              <span className="font-semibold text-primary-600">
                {diskonGrosirPersen}% dari harga normal
              </span>{" "}
              untuk pesanan grosir Anda
            </p>
          )}
          <button
            onClick={handleOrder}
            className="w-full py-3.5 sm:py-4 px-4 bg-primary-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-primary-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
