"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Loader2,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

import { productsApi, storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";

interface ProductItem {
  id: string;
  nama: string;
  gambarUrl?: string;
  category?: { nama: string };
}

export default function LaporanProdukPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const storeRes = await storesApi.getMyStore();
        const storeData =
          extractArray(storeRes)[0] || storeRes?.data?.data || storeRes?.data;

        if (!storeData?.id) {
          setLoading(false);
          return;
        }

        const prodRes = await productsApi.getAllByStore(storeData.id, {
          limit: 100,
        });
        const dataArray = extractArray<ProductItem>(prodRes);
        setProducts(dataArray);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama?.replace(" - ", " ").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-emerald-600" size={26} /> Laporan per
            Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pilih produk untuk melihat laporan keuntungan (FIFO), margin, dan
            detail finansial lainnya.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        <div className="relative group flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none shadow-sm transition-all text-gray-700 font-normal"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">
            Memuat daftar produk...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-800 font-medium text-lg">
            Tidak ada produk
          </h3>
          <p className="text-gray-400 text-sm mt-1 font-normal">
            Belum ada produk yang tersedia atau ditemukan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/seller/laporan/produk/${p.id}`)}
              className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 relative">
                  {p.gambarUrl ? (
                    <Image
                      src={p.gambarUrl}
                      alt={p.nama?.replace(" - ", " ")}
                      fill
                      sizes="56px"
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <Package className="text-gray-300" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {p.nama?.replace(" - ", " ")}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {p.category?.nama || "Tanpa Kategori"}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold">Lihat Laporan</span>
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
