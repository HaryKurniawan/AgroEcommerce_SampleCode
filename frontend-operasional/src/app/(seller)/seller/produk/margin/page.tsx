"use client";

import React, { useEffect, useState } from "react";
import {
  Percent,
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  Sliders,
  RefreshCw,
  Loader2,
  History,
  X,
} from "lucide-react";
import dayjs from "dayjs";

import { apiClient } from "@/lib/api-client";
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

export default function MarginPage() {
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  );

  // States for Pricing configurations
  const [defaultMargin, setDefaultMargin] = useState<number>(15);
  const [newDefaultMargin, setNewDefaultMargin] = useState<number>(15);
  const [marginMaxPersen, setMarginMaxPersen] = useState<number>(30);
  const [b2bDiscount, setB2bDiscount] = useState<number>(0);
  const [newB2bDiscount, setNewB2bDiscount] = useState<number>(0);
  const [products, setProducts] = useState<ProductSummary[]>([]);
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
  const [historyData, setHistoryData] = useState<
    {
      id?: string;
      createdAt?: string;
      produkId?: string | null;
      produk?: { nama?: string } | null;
      keterangan?: string | null;
      marginLama?: number | null;
      marginBaru?: number | null;
      diubahOleh?: string | null;
      diubahOlehPeran?: string | null;
      [key: string]: unknown;
    }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch current config
      const configRes = await apiClient.get("/toko/harga/config");
      const curMargin = configRes.data.data.marginDefaultPersen;
      const maxMargin = configRes.data.data.marginMaxPersen || 30;
      const b2bDisc = configRes.data.data.diskonB2BPersen || 0;
      setDefaultMargin(curMargin);
      setNewDefaultMargin(curMargin);
      setMarginMaxPersen(maxMargin);
      setB2bDiscount(b2bDisc);
      setNewB2bDiscount(b2bDisc);

      // Fetch products summary
      const summaryRes = await apiClient.get("/toko/harga/summary");
      setProducts(summaryRes.data.data.products || []);
      if (summaryRes.data.data.marginMaxPersen) {
        setMarginMaxPersen(summaryRes.data.data.marginMaxPersen);
      }
    } catch (err: unknown) {
      console.error("Error fetching pricing data:", err);
      setMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gagal memuat data pengaturan harga.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDefaultMargin = async () => {
    if (newDefaultMargin > marginMaxPersen) {
      setMessage({
        type: "error",
        text: `Margin default (${newDefaultMargin}%) tidak boleh melampaui batas maksimum (${marginMaxPersen}%) yang ditentukan Admin.`,
      });
      return;
    }
    setSavingConfig(true);
    setMessage(null);
    try {
      const res = await apiClient.patch("/toko/harga/config", {
        marginDefaultPersen: Number(newDefaultMargin),
      });
      setDefaultMargin(Number(newDefaultMargin));
      setMessage({
        type: "success",
        text: "Margin default toko berhasil diperbarui!",
      });
      // Reload products to see updated prices
      const summaryRes = await apiClient.get("/toko/harga/summary");
      setProducts(summaryRes.data.data.products || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Gagal memperbarui margin default.",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveB2bDiscount = async () => {
    if (newB2bDiscount < 0 || newB2bDiscount > 100) {
      setMessage({
        type: "error",
        text: "Diskon B2B harus antara 0% dan 100%.",
      });
      return;
    }
    setSavingConfig(true);
    setMessage(null);
    try {
      await apiClient.patch("/toko/harga/config", {
        diskonB2BPersen: Number(newB2bDiscount),
      });
      setB2bDiscount(Number(newB2bDiscount));
      setMessage({
        type: "success",
        text: "Diskon khusus B2B berhasil diperbarui!",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui diskon B2B.",
      });
    } finally {
      setSavingConfig(false);
    }
  };

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
        text: `Margin (${productMarginInput.toFixed(1)}%) tidak boleh melampaui batas maksimum (${marginMaxPersen}%) yang ditentukan Admin.`,
      });
      return;
    }

    setUpdatingProductId(editingProduct.id);
    setMessage(null);

    try {
      // If we change custom margin, price is auto-calculated. If custom price is changed, margin is calculated.
      // We send the parameters to the backend
      const payload: any = {};
      if (
        editingProduct.isCustomMargin &&
        productMarginInput !== editingProduct.marginPersen
      ) {
        payload.marginPersen = Number(productMarginInput);
      } else {
        payload.hargaJual = Number(productPriceInput);
      }

      await apiClient.patch(`/toko/harga/produk/${editingProduct.id}`, payload);
      setMessage({
        type: "success",
        text: `Harga jual untuk "${editingProduct.nama?.replace(" - ", " ")}" berhasil disimpan.`,
      });
      setEditingProduct(null);
      // Reload details
      const summaryRes = await apiClient.get("/toko/harga/summary");
      setProducts(summaryRes.data.data.products || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui harga produk.",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleResetProductToDefault = async (productId: string) => {
    setUpdatingProductId(productId);
    setMessage(null);
    try {
      await apiClient.patch(`/toko/harga/produk/${productId}`, {
        marginPersen: null, // resets to default store margin
      });
      setMessage({
        type: "success",
        text: "Margin produk di-reset kembali ke default toko.",
      });
      // Reload details
      const summaryRes = await apiClient.get("/toko/harga/summary");
      setProducts(summaryRes.data.data.products || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal me-reset margin produk.",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get("/toko/harga/riwayat");
      setHistoryData(res.data.data || res.data || []);
    } catch (err: any) {
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
          Memuat pengaturan harga & B2B...
        </p>
      </div>
    );
  }

  // Sum total values
  const productsList = Array.isArray(products) ? products : [];
  const totalStockKg = productsList.reduce((acc, curr) => acc + curr.stok, 0);
  const totalEstimatedProfit = productsList.reduce(
    (acc, curr) => acc + curr.estimasiProfitStok,
    0,
  );

  return (
    <div className="space-y-8 w-full">
      {/* Title */}
      <div className="pb-6 border-b border-slate-100">
        <h2 className="text-2xl md:text-3xl font-medium text-slate-800 mt-1.5 tracking-tight">
          Pengaturan Margin & Harga Jual
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Atur default margin toko atau override harga per produk untuk
          memaksimalkan keuntungan dari stok yang masuk dari Gudang.
        </p>
      </div>

      {/* Batas Margin Admin Banner */}
      <div className="bg-emerald-50/40 backdrop-blur-sm border border-emerald-100/80 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-emerald-600/10 text-emerald-700 rounded-2xl flex-shrink-0">
          <Percent size={20} className="text-emerald-605" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-slate-850">
            Batas Maksimum Margin Aktif
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Admin telah menetapkan batas maksimum margin keuntungan sebesar{" "}
            <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md font-mono font-medium">
              {marginMaxPersen}%
            </span>{" "}
            untuk toko Anda. Seluruh penyesuaian margin default maupun harga
            jual produk individual tidak diperbolehkan melebihi batas ini.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-105 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card default margin */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Percent size={20} />
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
              Global Default
            </span>
          </div>
          <div>
            <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Margin Default Toko
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-medium text-slate-850">
                {defaultMargin}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                keuntungan per item
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-[11px] text-slate-400 pb-1 font-medium">
              <span>Batas Max Admin:</span>
              <span className="font-medium text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                {marginMaxPersen}%
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={marginMaxPersen}
                value={newDefaultMargin}
                onChange={(e) =>
                  setNewDefaultMargin(parseFloat(e.target.value) || 0)
                }
                className={`w-20 px-2 py-1.5 bg-slate-50 border rounded-xl text-center text-xs font-medium focus:ring-1 focus:outline-none ${
                  newDefaultMargin > marginMaxPersen
                    ? "border-rose-300 focus:ring-rose-500 text-rose-600"
                    : "border-slate-100 focus:ring-emerald-500 focus:bg-white"
                }`}
              />
              <button
                onClick={handleSaveDefaultMargin}
                disabled={savingConfig || newDefaultMargin > marginMaxPersen}
                className="flex-1 py-1.5 bg-emerald-605 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-all"
              >
                {savingConfig
                  ? "Menyimpan..."
                  : newDefaultMargin > marginMaxPersen
                    ? "Kelebihan"
                    : "Simpan Default"}
              </button>
            </div>
            {newDefaultMargin > marginMaxPersen && (
              <p className="text-[10px] text-rose-600 font-medium leading-tight mt-1 text-center">
                ⚠️ Melebihi batas maksimum {marginMaxPersen}%!
              </p>
            )}
          </div>
        </div>

        {/* Card B2B Discount */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Percent size={20} />
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-700 font-medium px-2 py-0.5 rounded-full">
              Khusus B2B
            </span>
          </div>
          <div>
            <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Diskon B2B
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-medium text-slate-850">
                {b2bDiscount}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                potongan harga
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-[11px] text-slate-400 pb-1 font-medium">
              <span>Atur Diskon:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={newB2bDiscount}
                onChange={(e) =>
                  setNewB2bDiscount(parseFloat(e.target.value) || 0)
                }
                className={`w-20 px-2 py-1.5 bg-slate-50 border rounded-xl text-center text-xs font-medium focus:ring-1 focus:outline-none ${
                  newB2bDiscount < 0 || newB2bDiscount > 100
                    ? "border-rose-300 focus:ring-rose-500 text-rose-600"
                    : "border-slate-100 focus:ring-blue-500 focus:bg-white"
                }`}
              />
              <button
                onClick={handleSaveB2bDiscount}
                disabled={
                  savingConfig || newB2bDiscount < 0 || newB2bDiscount > 100
                }
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-all"
              >
                {savingConfig ? "Menyimpan..." : "Simpan Diskon"}
              </button>
            </div>
          </div>
        </div>

        {/* Card total stock */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 text-indigo-650 rounded-2xl">
              <Package size={20} className="text-indigo-650" />
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
              Inventaris
            </span>
          </div>
          <div>
            <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Stok Tersedia
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-medium text-slate-850">
                {totalStockKg.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Kg komoditas
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
            Kuantitas gabungan di etalase Anda saat ini.
          </p>
        </div>

        {/* Card Profit Estimate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-700 font-medium px-2 py-0.5 rounded-full">
              Estimasi
            </span>
          </div>
          <div>
            <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Estimasi Profit Stok Aktif
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-medium text-emerald-600">
                Rp {totalEstimatedProfit.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
            Potensi laba bersih jika seluruh stok etalase terjual.
          </p>
        </div>
      </div>

      {/* Product Pricing Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-605" />
            Daftar Produk & Konfigurasi Profit per Batch
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleOpenHistory}
              className="px-3 py-1.5 flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-600 border border-emerald-100 rounded-xl text-[11px] font-medium transition-all"
            >
              <History className="w-3.5 h-3.5" /> Riwayat
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <th className="pb-3 pl-2">Produk</th>
                <th className="pb-3 text-center">Stok</th>
                <th className="pb-3">HPP Seller (Beli dari Gudang)</th>
                <th className="pb-3 text-center">Margin %</th>
                <th className="pb-3">Harga Jual</th>
                <th className="pb-3">Profit / Unit</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-600 font-medium">
              {productsList.map((p) => {
                const profitColor =
                  p.profitPerKg > 0 ? "text-emerald-600" : "text-slate-400";
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="py-4 pl-2 font-medium text-slate-850">
                      {p.nama?.replace(" - ", " ")}
                    </td>
                    <td className="py-4 text-center font-medium text-slate-500">
                      {p.stok} {p.satuan}
                    </td>
                    <td className="py-4 font-medium text-slate-700">
                      {p.hpp > 0 ? `Rp ${p.hpp.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          p.isCustomMargin
                            ? "bg-amber-50 text-amber-600 border-amber-100/50"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                        }`}
                      >
                        {p.marginPersen}%{" "}
                        {p.isCustomMargin ? "Custom" : "Default"}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-slate-900">
                      Rp {p.hargaJual.toLocaleString("id-ID")}
                    </td>
                    <td className={`py-4 ${profitColor}`}>
                      Rp {p.profitPerKg.toLocaleString("id-ID")} / {p.satuan}
                    </td>
                    <td className="py-4 text-right pr-2 space-x-2">
                      <button
                        onClick={() => handleOpenProductEdit(p)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
                      >
                        Ubah
                      </button>
                      {p.isCustomMargin && (
                        <button
                          onClick={() => handleResetProductToDefault(p.id)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg font-medium border border-slate-100 transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Pricing Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 relative space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-medium text-slate-800">
                Ubah Konfigurasi Harga
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Produk:{" "}
                <span className="font-medium text-slate-600">
                  {editingProduct.nama?.replace(" - ", " ")}
                </span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl text-xs space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Harga Pokok Penjualan (HPP):
                </span>
                <span className="font-medium text-slate-700">
                  Rp {editingProduct.hpp.toLocaleString("id-ID")} /{" "}
                  {editingProduct.satuan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kuantitas Stok:</span>
                <span className="font-medium text-slate-700">
                  {editingProduct.stok} {editingProduct.satuan}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProductPricing} className="space-y-4">
              <div className="flex gap-4 p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct({
                      ...editingProduct,
                      isCustomMargin: true,
                    })
                  }
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                    editingProduct.isCustomMargin
                      ? "bg-white text-emerald-705 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
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
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                    !editingProduct.isCustomMargin
                      ? "bg-white text-emerald-750 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Custom Harga Jual (Rp)
                </button>
              </div>

              {editingProduct.isCustomMargin ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex justify-between">
                    <span>Margin Profit (%)</span>
                    <span className="text-[9px] text-slate-500 font-medium">
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
                        // Instant price calculation preview
                        setProductPriceInput(
                          editingProduct.hpp * (1 + val / 100),
                        );
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none ${
                        productMarginInput > marginMaxPersen
                          ? "border-rose-350 focus:border-rose-500 text-rose-600"
                          : "border-slate-100 focus:border-emerald-500 focus:bg-white"
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-400">
                      %
                    </span>
                  </div>
                  {productMarginInput > marginMaxPersen ? (
                    <p className="text-[10px] text-rose-650 mt-1 leading-relaxed font-medium">
                      ⚠️ Margin melebihi batas maksimum {marginMaxPersen}%!
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed font-medium">
                      Preview Harga Jual: Rp{" "}
                      {productPriceInput.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex justify-between">
                    <span>Harga Jual Baru (Rp)</span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      Max Margin: {marginMaxPersen}%
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={editingProduct.hpp}
                      value={productPriceInput}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProductPriceInput(val);
                        // Instant margin calculation preview
                        if (editingProduct.hpp > 0) {
                          setProductMarginInput(
                            ((val - editingProduct.hpp) / editingProduct.hpp) *
                              100,
                          );
                        }
                      }}
                      className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none ${
                        productMarginInput > marginMaxPersen
                          ? "border-rose-350 focus:border-rose-500 text-rose-600"
                          : "border-slate-100 focus:border-emerald-500 focus:bg-white"
                      }`}
                    />
                  </div>
                  {productMarginInput > marginMaxPersen ? (
                    <p className="text-[10px] text-rose-655 mt-1 leading-relaxed font-medium">
                      ⚠️ Margin ({productMarginInput.toFixed(1)}%) melebihi
                      batas maksimum {marginMaxPersen}%!
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-600 mt-1 leading-relaxed font-medium">
                      Preview Margin Profit: {productMarginInput.toFixed(1)}%
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {updatingProductId === editingProduct.id
                    ? "Menyimpan..."
                    : productMarginInput > marginMaxPersen
                      ? "Margin Melampaui Batas Maksimum"
                      : "Simpan Harga Jual"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-medium text-slate-805 text-lg flex items-center gap-2">
                <History className="text-emerald-600" size={20} />
                Riwayat Pengaturan Harga & Margin
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-white">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-605 animate-spin" />
                  <p className="text-slate-400 font-medium text-sm animate-pulse">
                    Memuat riwayat perubahan...
                  </p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <History
                    size={40}
                    className="mx-auto mb-3 opacity-30 text-slate-300"
                  />
                  <p className="font-medium">
                    Belum ada riwayat perubahan margin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-slate-500">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Waktu</th>
                        <th className="px-4 py-3 font-medium">
                          Produk / Target
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Margin Lama
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Margin Baru
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Diubah Oleh
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          className="border-b border-slate-50 last:border-0 hover:bg-emerald-50/20 transition-colors text-slate-600 font-medium"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-[12px] font-medium text-slate-900">
                            {dayjs(item.createdAt).format("DD MMM YYYY, HH:mm")}
                          </td>
                          <td className="px-4 py-3">
                            {item.produkId ? (
                              <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[150px] inline-block">
                                {item.produk?.nama?.replace(" - ", " ") ||
                                  "Produk"}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                                Margin Default Toko
                              </span>
                            )}
                            {item.keterangan && (
                              <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px] font-medium">
                                {item.keterangan}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.marginLama !== null ? (
                              <span className="text-slate-500 font-mono text-xs">
                                {item.marginLama}%
                              </span>
                            ) : (
                              <span className="text-slate-300 font-medium">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-emerald-600 font-mono font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {item.marginBaru}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                                item.diubahOlehPeran === "ADMIN"
                                  ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                                  : "bg-blue-50 text-blue-600 border border-blue-100/50"
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
