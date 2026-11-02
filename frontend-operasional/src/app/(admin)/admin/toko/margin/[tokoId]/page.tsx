"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Percent,
  TrendingUp,
  Package,
  Sliders,
  RefreshCw,
  Loader2,
  ArrowLeft,
  MapPin,
  Store,
  History,
  X,
} from "lucide-react";
import dayjs from "dayjs";

import { apiClient } from "@/lib/api-client";
import { storesApi } from "@/lib/ecommerce-api";
import "dayjs/locale/id";

dayjs.locale("id");

interface ProductSummary {
  id: string;
  nama: string;
  stok: number;
  satuan: string;
  hpp: number;
  hargaJual: number;
  marginPersen: number;
  isCustomMargin: boolean;
  profitPerKg: number;
  estimasiProfitStok: number;
}

interface StoreDetails {
  id: string;
  nama: string;
  kabupaten?: string;
  wilayah?: string;
}

interface MarginHistoryItem {
  id?: string;
  createdAt: string;
  produkId?: string;
  produk?: { nama?: string };
  keterangan?: string;
  marginLama: number | null;
  marginBaru: number;
  diubahOlehPeran: string;
}

export default function AdminStoreProductMarginOverridesPage() {
  const params = useParams();
  const router = useRouter();
  const tokoId = params.tokoId as string;

  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  );
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [defaultMargin, setDefaultMargin] = useState<number>(15);
  const [marginMaxPersen, setMarginMaxPersen] = useState<number>(30);

  // Modal Editing States
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(
    null,
  );
  const [productMarginInput, setProductMarginInput] = useState<number>(15);
  const [productPriceInput, setProductPriceInput] = useState<number>(0);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<MarginHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = useCallback(async () => {
    if (!tokoId) return;
    try {
      setLoading(true);
      setMessage(null);

      // Fetch store basic details
      try {
        const storeRes = await storesApi.getById(tokoId);
        setStore(storeRes.data.data || storeRes.data);
      } catch (err) {
        console.warn("Failed to load store basic details:", err);
      }

      // Fetch pricing summary for store
      const summaryRes = await apiClient.get(
        `/toko/harga/admin/${tokoId}/summary`,
      );
      setDefaultMargin(summaryRes.data.data.defaultMargin);
      setMarginMaxPersen(summaryRes.data.data.marginMaxPersen || 30);
      setProducts(summaryRes.data.data.products || []);
    } catch (err: unknown) {
      console.error("Error fetching store pricing summary:", err);
      setMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gagal memuat detail harga produk toko.",
      });
    } finally {
      setLoading(false);
    }
  }, [tokoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenProductEdit = (prod: ProductSummary) => {
    setEditingProduct(prod);
    setProductMarginInput(prod.marginPersen);
    setProductPriceInput(prod.hargaJual);
  };

  const handleUpdateProductPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (productMarginInput > marginMaxPersen) {
      setMessage({
        type: "error",
        text: `Margin (${productMarginInput.toFixed(1)}%) tidak boleh melampaui batas maksimum (${marginMaxPersen}%) yang ditentukan.`,
      });
      return;
    }

    setUpdatingProductId(editingProduct.id);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {};
      if (
        editingProduct.isCustomMargin &&
        productMarginInput !== editingProduct.marginPersen
      ) {
        payload.marginPersen = Number(productMarginInput);
      } else {
        payload.hargaJual = Number(productPriceInput);
      }

      await apiClient.patch(
        `/toko/harga/admin/${tokoId}/produk/${editingProduct.id}`,
        payload,
      );
      setMessage({
        type: "success",
        text: `Harga jual untuk "${editingProduct.nama?.replace(" - ", " ")}" berhasil disimpan.`,
      });
      setEditingProduct(null);

      // Reload pricing
      const summaryRes = await apiClient.get(
        `/toko/harga/admin/${tokoId}/summary`,
      );
      setProducts(summaryRes.data.data.products || []);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gagal memperbarui harga produk.",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleResetProductToDefault = async (productId: string) => {
    setUpdatingProductId(productId);
    setMessage(null);
    try {
      await apiClient.patch(`/toko/harga/admin/${tokoId}/produk/${productId}`, {
        marginPersen: null, // resets to store's default margin
      });
      setMessage({
        type: "success",
        text: "Margin produk di-reset kembali ke default toko.",
      });

      // Reload pricing
      const summaryRes = await apiClient.get(
        `/toko/harga/admin/${tokoId}/summary`,
      );
      setProducts(summaryRes.data.data.products || []);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gagal me-reset margin produk.",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get(
        `/toko/harga/admin/riwayat?tokoId=${tokoId}`,
      );
      setHistoryData(res.data.data || res.data || []);
    } catch (err: unknown) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setHistoryModalOpen(true);
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat konfigurasi harga & B2B...
        </p>
      </div>
    );
  }

  // Sum stats
  const productsList = Array.isArray(products) ? products : [];
  const totalStockKg = productsList.reduce((acc, curr) => acc + curr.stok, 0);
  const totalEstimatedProfit = productsList.reduce(
    (acc, curr) => acc + curr.estimasiProfitStok,
    0,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => router.push("/admin/toko/margin")}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2 rounded-xl transition-all w-fit"
          >
            <ArrowLeft size={14} /> Kembali ke Monitoring Margin
          </button>
          <div className="pt-1">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
              Kelola Produk & Margin
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <Store size={22} className="text-emerald-600" />{" "}
              {store?.nama || "Pengaturan Toko"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin size={14} className="text-emerald-500" />
              {store?.kabupaten || "Daerah belum diset"}{" "}
              {store?.wilayah ? ` • ${store?.wilayah}` : ""}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Default Margin */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Percent size={20} />
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              Toko Default
            </span>
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Margin Default Toko
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {defaultMargin}%
              </span>
              <span className="text-xs text-gray-400 font-medium">
                profit standard
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px]">
            <span className="text-gray-400">Batas Maksimum Margin:</span>
            <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {marginMaxPersen}%
            </span>
          </div>
        </div>

        {/* Total Stock */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Package size={20} />
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              Stok Aktif
            </span>
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Stok Tersedia
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {totalStockKg.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Kg komoditas
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Stok etalase yang dimiliki toko saat ini.
          </p>
        </div>

        {/* Proyeksi profit */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              Estimasi
            </span>
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Estimasi Laba Toko
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                Rp {totalEstimatedProfit.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Potensi keuntungan kotor jika seluruh stok laku.
          </p>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[32px] border border-gray-200/80 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Konfigurasi Margin & Harga Produk Toko
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleOpenHistory}
              className="px-3 py-1.5 flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-[11px] font-bold transition-all"
            >
              <History className="w-3.5 h-3.5" /> Riwayat
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Produk</th>
                <th className="pb-3 text-center">Stok</th>
                <th className="pb-3">HPP Seller (Beli dari Gudang)</th>
                <th className="pb-3 text-center">Margin %</th>
                <th className="pb-3">Harga Jual</th>
                <th className="pb-3">Profit / Unit</th>
                <th className="pb-3 text-right pr-2">Aksi Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 text-xs">
              {productsList.map((p) => {
                const profitColor =
                  p.profitPerKg > 0
                    ? "text-emerald-600 font-bold"
                    : "text-gray-400";
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 pl-2 font-semibold text-gray-900">
                      {p.nama?.replace(" - ", " ")}
                    </td>
                    <td className="py-4 text-center font-bold text-gray-500">
                      {p.stok} {p.satuan}
                    </td>
                    <td className="py-4 font-semibold text-gray-700">
                      {p.hpp > 0 ? `Rp ${p.hpp.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isCustomMargin
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.marginPersen}%{" "}
                        {p.isCustomMargin ? "Custom" : "Default"}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-gray-950">
                      Rp {p.hargaJual.toLocaleString("id-ID")}
                    </td>
                    <td className={`py-4 ${profitColor}`}>
                      Rp {p.profitPerKg.toLocaleString("id-ID")} / {p.satuan}
                    </td>
                    <td className="py-4 text-right pr-2 space-x-2">
                      <button
                        onClick={() => handleOpenProductEdit(p)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-[11px]"
                      >
                        Override Harga
                      </button>
                      {p.isCustomMargin && (
                        <button
                          onClick={() => handleResetProductToDefault(p.id)}
                          disabled={updatingProductId === p.id}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl font-bold transition-all text-[11px] disabled:opacity-50"
                        >
                          Reset ke Default
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {productsList.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-400 font-medium"
                  >
                    Toko ini belum memiliki katalog produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Override Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 relative space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              Close
            </button>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Override Harga & Margin
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Produk:{" "}
                <span className="font-semibold text-gray-700">
                  {editingProduct.nama?.replace(" - ", " ")}
                </span>
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200/50 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Harga Beli (HPP Gudang):</span>
                <span className="font-bold text-gray-700">
                  Rp {editingProduct.hpp.toLocaleString("id-ID")} /{" "}
                  {editingProduct.satuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kuantitas Stok:</span>
                <span className="font-bold text-gray-700">
                  {editingProduct.stok} {editingProduct.satuan}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProductPricing} className="space-y-4">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct({
                      ...editingProduct,
                      isCustomMargin: true,
                    })
                  }
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    editingProduct.isCustomMargin
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Override Margin (%)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct({
                      ...editingProduct,
                      isCustomMargin: false,
                    })
                  }
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    !editingProduct.isCustomMargin
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  Custom Harga Jual (Rp)
                </button>
              </div>{" "}
              {editingProduct.isCustomMargin ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex justify-between">
                    <span>Override Margin (%)</span>
                    <span className="text-[9px] text-slate-500 font-bold">
                      Max: {marginMaxPersen}%
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={productMarginInput}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProductMarginInput(val);
                        // Calculated price preview
                        setProductPriceInput(
                          editingProduct.hpp * (1 + val / 100),
                        );
                      }}
                      className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold focus:outline-none ${
                        productMarginInput > marginMaxPersen
                          ? "border-rose-300 focus:border-rose-500 text-rose-600"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-gray-400">
                      %
                    </span>
                  </div>
                  {productMarginInput > marginMaxPersen ? (
                    <p className="text-[10px] text-rose-600 mt-1 leading-relaxed font-bold">
                      ⚠️ Margin melebihi batas maksimum {marginMaxPersen}%!
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed font-semibold">
                      Preview Harga Jual Baru: Rp{" "}
                      {productPriceInput.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex justify-between">
                    <span>Harga Jual Baru (Rp)</span>
                    <span className="text-[9px] text-slate-500 font-bold">
                      Max Margin: {marginMaxPersen}%
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={editingProduct.hpp}
                      value={productPriceInput}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProductPriceInput(val);
                        // Calculated margin preview
                        if (editingProduct.hpp > 0) {
                          setProductMarginInput(
                            ((val - editingProduct.hpp) / editingProduct.hpp) *
                              100,
                          );
                        }
                      }}
                      className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold focus:outline-none ${
                        productMarginInput > marginMaxPersen
                          ? "border-rose-300 focus:border-rose-500 text-rose-600"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {productMarginInput > marginMaxPersen ? (
                    <p className="text-[10px] text-rose-600 mt-1 leading-relaxed font-bold">
                      ⚠️ Margin ({productMarginInput.toFixed(1)}%) melebihi
                      batas maksimum {marginMaxPersen}%!
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-600 mt-1 leading-relaxed font-semibold">
                      Preview Margin Baru: {productMarginInput.toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    updatingProductId === editingProduct.id ||
                    productMarginInput > marginMaxPersen
                  }
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {updatingProductId === editingProduct.id
                    ? "Menyimpan..."
                    : productMarginInput > marginMaxPersen
                      ? "Margin Melampaui Batas Maksimum"
                      : "Simpan Override Harga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <History className="text-emerald-600" size={20} />
                Riwayat Pengaturan Harga & Margin
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-white">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-gray-400 font-medium text-sm animate-pulse">
                    Memuat riwayat perubahan...
                  </p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <History size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    Belum ada riwayat perubahan margin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Produk / Target</th>
                        <th className="px-4 py-3 text-center">Margin Lama</th>
                        <th className="px-4 py-3 text-center">Margin Baru</th>
                        <th className="px-4 py-3 text-center">Diubah Oleh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          className="border-b last:border-0 hover:bg-emerald-50/30 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-[12px] font-medium text-gray-900">
                            {dayjs(item.createdAt).format("DD MMM YYYY, HH:mm")}
                          </td>
                          <td className="px-4 py-3">
                            {item.produkId ? (
                              <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md text-[11px] truncate max-w-[150px] inline-block">
                                {item.produk?.nama?.replace(" - ", " ") ||
                                  "Produk"}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px]">
                                Margin Default Toko
                              </span>
                            )}
                            {item.keterangan && (
                              <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[200px]">
                                {item.keterangan}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.marginLama !== null ? (
                              <span className="text-gray-500 font-mono text-xs">
                                {item.marginLama}%
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-emerald-600 font-mono font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                              {item.marginBaru}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.diubahOlehPeran === "ADMIN"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.diubahOlehPeran}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
