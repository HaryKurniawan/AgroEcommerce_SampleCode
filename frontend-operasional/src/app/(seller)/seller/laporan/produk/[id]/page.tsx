"use client";

import React, { use } from "react";
import { ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProfitReportTab } from "@/components/profit-report";
import { productsApi } from "@/lib/ecommerce-api";

interface PageParams {
  id: string;
}

export default function LaporanKeuntunganProdukDetail({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id),
  });

  const product = productRes?.data?.data || productRes?.data;

  const isVariant = product?.nama?.replace(" - ", " ")?.includes(" - ");
  const baseName = isVariant
    ? product.nama?.replace(" - ", " ").split(" - ")[0]
    : product?.nama?.replace(" - ", " ");
  const variantName = isVariant
    ? product.nama?.replace(" - ", " ").split(" - ")[1]
    : null;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Back + Header ── */}
      <div className="pb-4 border-b border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={22} className="text-emerald-600" />
              Laporan Keuntungan Produk
            </h1>
          </div>
        </div>
      </div>

      {/* ── Product Info ── */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-emerald-600 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Memuat data produk...</span>
        </div>
      ) : product ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          {product.fotoUrls && product.fotoUrls[0] ? (
            <img
              src={product.fotoUrls[0]}
              alt={product.nama?.replace(" - ", " ")}
              className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
              {product.nama?.replace(" - ", " ").charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{baseName}</h2>
              {variantName && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                  {variantName}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Kategori: {product.kategori?.nama || "-"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="animate-fade-in">
        <ProfitReportTab produkId={id} />
      </div>
    </div>
  );
}
