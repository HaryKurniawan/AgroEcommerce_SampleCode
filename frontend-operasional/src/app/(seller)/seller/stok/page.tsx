"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Package,
  Search,
  Plus,
  RefreshCw,
  Clock,
  Loader2,
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

import { productsApi, storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";

interface ProductItem {
  id: string;
  nama: string;
  status: string;
  gambarUrl?: string;
  category?: { nama: string };
  harga: number | string;
  stok: number | string;
  satuan?: string;
  terjual?: number | string;
  rating?: number | string;
  varian?: {
    id: string;
    ukuranKg: number;
    stokKemasan: number;
    isActive: boolean;
  }[];
}

interface StockLog {
  id: string;
  produkId: string;
  produkNama: string;
  gambarUrl?: string;
  change: number; // positive for incoming, negative for outgoing
  tipe: "MASUK" | "KELUAR" | "PERUBAHAN";
  keterangan: string; // e.g. "Titip Stok", "Penjualan"
  timestamp: string;
}

export default function SellerStockManagementPage() {
  const router = useRouter();

  // Core Data State
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // UI Filters
  const [search, setSearch] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState<
    "semua" | "normal" | "rendah" | "habis"
  >("semua");

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setErrorText("");

      const storeRes = await storesApi.getMyStore();
      const storeData =
        extractArray<any>(storeRes)[0] ||
        storeRes?.data?.data ||
        storeRes?.data;
      setStore(storeData);

      if (storeData?.id) {
        const prodRes = await productsApi.getAllByStore(storeData.id);
        const dataArray = extractArray<ProductItem>(prodRes);
        const mappedArray = dataArray.map((p) => ({
          ...p,
          id: p.id || (p as any).id_produk,
        }));
        setProducts(mappedArray);
      }
    } catch (err: any) {
      console.error("Failed to fetch store inventory details", err);
      setErrorText(err.message || "Gagal memuat data inventaris.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derivations ────────────────────────────────────────────────────────────
  const catalogCount = products.length;

  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.stok) || 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const q = Number(p.stok) || 0;
      return q > 0 && q <= 90;
    }).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => (Number(p.stok) || 0) === 0).length;
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nama
          ?.replace(" - ", " ")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (p.category?.nama || "").toLowerCase().includes(search.toLowerCase());

      const q = Number(p.stok) || 0;
      let matchStatus = true;
      if (filterStockStatus === "normal") matchStatus = q > 90;
      else if (filterStockStatus === "rendah") matchStatus = q > 0 && q <= 90;
      else if (filterStockStatus === "habis") matchStatus = q === 0;

      return matchSearch && matchStatus;
    });
  }, [products, search, filterStockStatus]);

  // Loading indicator for full page fetch
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Menghubungkan data inventaris...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-800">
              Pengelolaan Stok Produk
            </h1>
          </div>
        </div>
      </div>

      {errorText && (
        <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="space-y-0.5">
            <h3 className="font-medium text-sm text-rose-800">
              Kesalahan Koneksi
            </h3>
            <p className="text-xs text-rose-600 leading-relaxed">{errorText}</p>
          </div>
        </div>
      )}

      {/* ── KPI METRICS CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-emerald-300/20" />
          <p className="text-[24px] font-medium text-slate-800 leading-none tracking-tight mb-1">
            {catalogCount}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Produk Terdata
          </p>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 absolute right-4 bottom-4">
            <Package size={14} />
          </div>
        </div>

        {/* Cumulative Stock */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-emerald-300/20" />
          <p className="text-[24px] font-medium text-slate-800 leading-none tracking-tight mb-1">
            {totalStockCount}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Total Stok Kumulatif
          </p>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 absolute right-4 bottom-4">
            <Boxes size={14} />
          </div>
        </div>

        {/* Low Stock Warning */}
        <button
          onClick={() => setFilterStockStatus("rendah")}
          className={`bg-white border rounded-2xl p-5 text-left relative overflow-hidden transition-all active:scale-[0.98] ${
            lowStockCount > 0
              ? "border-amber-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50/20"
              : "border-slate-100"
          }`}
        >
          {lowStockCount > 0 && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-amber-500" />
          )}
          <p
            className={`text-[24px] font-medium leading-none tracking-tight mb-1 ${lowStockCount > 0 ? "text-amber-600" : "text-slate-800"}`}
          >
            {lowStockCount}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Batas Pengajuan (≤90)
          </p>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center absolute right-4 bottom-4 ${lowStockCount > 0 ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400"}`}
          >
            <AlertCircle size={14} />
          </div>
        </button>

        {/* Out of Stock */}
        <button
          onClick={() => setFilterStockStatus("habis")}
          className={`bg-white border rounded-2xl p-5 text-left relative overflow-hidden transition-all active:scale-[0.98] ${
            outOfStockCount > 0
              ? "border-rose-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50/20"
              : "border-slate-100"
          }`}
        >
          {outOfStockCount > 0 && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-rose-500" />
          )}
          <p
            className={`text-[24px] font-medium leading-none tracking-tight mb-1 ${outOfStockCount > 0 ? "text-rose-600" : "text-slate-800"}`}
          >
            {outOfStockCount}
          </p>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Stok Habis (0)
          </p>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center absolute right-4 bottom-4 ${outOfStockCount > 0 ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"}`}
          >
            <AlertCircle size={14} />
          </div>
        </button>
      </div>

      {/* ── MAIN WORKSPACE CONTAINER ────────────────────────────────────────── */}
      <div className="items-start">
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Search & Stock Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk / kategori..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-slate-100 rounded-2xl text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-normal text-slate-700"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl shrink-0 self-start md:self-auto border border-slate-100/50">
                {[
                  { label: "Semua", val: "semua" },
                  { label: "Cukup", val: "normal" },
                  { label: "Batas Pengajuan", val: "rendah" },
                  { label: "Habis", val: "habis" },
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => setFilterStockStatus(t.val as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                      filterStockStatus === t.val
                        ? "bg-white text-emerald-700 shadow-sm border border-slate-100/30"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-100 rounded-3xl space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Package size={20} />
                </div>
                <p className="text-xs font-medium text-slate-400">
                  Tidak ada produk yang cocok dengan kriteria filter
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredProducts.map((p) => {
                  const s = Number(p.stok) || 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/seller/stok/${p.id}`)}
                      className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 hover:bg-slate-50/60 rounded-2xl cursor-pointer group active:scale-[0.99] transition-all first:mt-0 mt-1"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                          {p.gambarUrl ? (
                            <img
                              src={p.gambarUrl}
                              alt={p.nama?.replace(" - ", " ")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-slate-800 truncate group-hover:text-emerald-600 transition-colors leading-snug">
                            {p.nama?.replace(" - ", " ")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-medium">
                              {p.category?.nama || "Lainnya"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Rp {Number(p.harga).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stock Count Display only */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-4">
                          {/* Status Pills */}
                          <div>
                            {s === 0 ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-rose-50 text-rose-500 border border-rose-100">
                                Habis
                              </span>
                            ) : s <= 90 ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-amber-50 text-amber-500 border border-amber-100 flex items-center gap-1">
                                <AlertCircle size={10} />
                                Perlu Pengajuan
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Normal
                              </span>
                            )}
                          </div>

                          {/* Solid Stock display */}
                          <div className="w-20 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                            <span
                              className={`text-[12px] font-medium ${s === 0 ? "text-rose-500" : s <= 90 ? "text-amber-500" : "text-slate-800"}`}
                            >
                              {s} {p.satuan || "unit"}
                            </span>
                          </div>
                        </div>

                        {/* Varian Kemasan Sub-Stock */}
                        {p.varian && p.varian.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-2 mt-2">
                            {p.varian.map((v) => (
                              <div
                                key={v.id || (v as any).id_varianKemasan}
                                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm"
                              >
                                <span className="font-bold text-[10px] bg-emerald-200/50 px-1.5 py-0.5 rounded text-emerald-800">
                                  {v.ukuranKg} kg
                                </span>
                                <span className="font-bold text-sm">
                                  {v.stokKemasan}
                                </span>
                                <span className="text-[10px] text-emerald-600/80 font-medium -ml-0.5">
                                  pack
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
