"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Percent,
  TrendingUp,
  Package,
  Store,
  Sliders,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  X,
  MapPin,
  BarChart2,
  Settings,
  FileText,
  CheckCircle,
  History,
} from "lucide-react";
import dayjs from "dayjs";

import { apiClient } from "@/lib/api-client";
import "dayjs/locale/id";

dayjs.locale("id");

interface StoreMarginSummary {
  id: string;
  nama: string;
  kabupaten: string;
  wilayah: string;
  defaultMargin: number;
  marginMaxPersen: number;
  totalProduk: number;
  totalStock: number;
  totalEstimatedProfit: number;
}

interface MarginHistoryItem {
  id?: string;
  createdAt: string;
  toko?: { nama?: string };
  produkId?: string;
  produk?: { nama?: string };
  keterangan?: string;
  marginLama: number | null;
  marginBaru: number;
  diubahOlehPeran: string;
}

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function AdminStoresMarginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreMarginSummary[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [editingStore, setEditingStore] = useState<StoreMarginSummary | null>(
    null,
  );
  const [newMarginInput, setNewMarginInput] = useState<number>(15);
  const [newMaxMarginInput, setNewMaxMarginInput] = useState<number>(30);
  const [savingConfig, setSavingConfig] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Global Margin State
  const [globalMarginModalOpen, setGlobalMarginModalOpen] = useState(false);
  const [globalMarginInput, setGlobalMarginInput] = useState<number>(15);
  const [globalMaxMarginInput, setGlobalMaxMarginInput] = useState<number>(30);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<MarginHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchStoresMargin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get("/toko/harga/admin/stores-margin");
      setStores(res.data.data || []);
    } catch (err: unknown) {
      console.error("Error fetching admin stores margin:", err);
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal memuat data monitoring margin toko.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresMargin();
  }, []);

  const handleOpenEditDefault = (store: StoreMarginSummary) => {
    setEditingStore(store);
    setNewMarginInput(store.defaultMargin);
    setNewMaxMarginInput(store.marginMaxPersen || 30);
    setMessage(null);
  };

  const handleSaveDefaultMargin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setSavingConfig(true);
    setMessage(null);

    try {
      await apiClient.patch(`/toko/harga/admin/${editingStore.id}/config`, {
        marginDefaultPersen: Number(newMarginInput),
        marginMaxPersen: Number(newMaxMarginInput),
      });
      setMessage({ type: "success", text: `Margin berhasil diperbarui!` });
      setStores((prev) =>
        prev.map((s) =>
          s.id === editingStore.id
            ? {
                ...s,
                defaultMargin: Number(newMarginInput),
                marginMaxPersen: Number(newMaxMarginInput),
              }
            : s,
        ),
      );
      setTimeout(() => setEditingStore(null), 1200);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gagal memperbarui margin default toko.",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const storesList = Array.isArray(stores) ? stores : [];

  const filteredStores = storesList.filter(
    (s) =>
      s.nama?.toLowerCase().includes(search.toLowerCase()) ||
      s.kabupaten?.toLowerCase().includes(search.toLowerCase()) ||
      s.wilayah?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSaveGlobalMargin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGlobal(true);
    setGlobalMessage(null);

    try {
      const updatePromises = storesList.map((store) =>
        apiClient.patch(`/toko/harga/admin/${store.id}/config`, {
          marginDefaultPersen: Number(globalMarginInput),
          marginMaxPersen: Number(globalMaxMarginInput),
        }),
      );
      await Promise.all(updatePromises);

      setGlobalMessage({
        type: "success",
        text: `Berhasil mengatur standar margin ${globalMarginInput}% dan batas max ${globalMaxMarginInput}% ke semua toko!`,
      });

      setStores((prev) =>
        prev.map((s) => ({
          ...s,
          defaultMargin: Number(globalMarginInput),
          marginMaxPersen: Number(globalMaxMarginInput),
        })),
      );

      setTimeout(() => {
        setGlobalMarginModalOpen(false);
        setGlobalMessage(null);
      }, 1500);
    } catch (err: unknown) {
      setGlobalMessage({
        type: "error",
        text:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Terjadi kesalahan saat menyimpan pengaturan global.",
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get("/toko/harga/admin/riwayat");
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

  const totalStores = storesList.length;
  const totalStockKg = storesList.reduce(
    (acc, curr) => acc + (curr.totalStock || 0),
    0,
  );
  const totalProjectedProfit = storesList.reduce(
    (acc, curr) => acc + (curr.totalEstimatedProfit || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat dashboard monitoring margin...
        </p>
      </div>
    );
  }

  // Margin color helper
  const marginColor = (m: number) => {
    if (m >= 25) return "text-primary-600 bg-primary-50 border-primary-200";
    if (m >= 15) return "text-gray-600 bg-gray-50 border-gray-200";
    if (m >= 8) return "text-gray-600 bg-gray-50 border-gray-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Global Margin Settings Banner */}
      <div className="bg-primary-600 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute -right-10 -top-10 text-primary-500/20 rotate-12 pointer-events-none">
          <Percent size={140} />
        </div>
        <div className="relative z-10 flex-1">
          <span className="bg-primary-800/40 text-primary-100 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block border border-primary-200">
            Regulasi Nasional
          </span>
          <h3 className="text-xl font-medium">Standar Keuntungan B2B</h3>
          <p className="text-primary-100 text-[13px] mt-1 max-w-xl">
            Sesuai dengan Surat Keputusan (SK) Direksi terbaru, Anda dapat
            menetapkan standar margin (persentase) secara global untuk seluruh
            toko.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={() =>
              alert("Download SK PDF masih dalam tahap pengembangan (Dummy).")
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all w-full sm:w-auto backdrop-blur-sm"
          >
            <FileText size={16} />
            Lihat SK
          </button>
          <button
            onClick={handleOpenHistory}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all w-full sm:w-auto backdrop-blur-sm"
          >
            <History size={16} />
            Riwayat
          </button>
          <button
            onClick={() => setGlobalMarginModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl text-sm font-medium transition-all w-full sm:w-auto "
          >
            <Settings size={16} />
            Atur Standar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 ">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
              <Store size={18} />
            </div>
            <span className="text-[10px] bg-primary-500/10 text-primary-700 font-medium px-2 py-0.5 rounded-full">
              Kemitraan
            </span>
          </div>
          <p className="text-2xl font-medium text-gray-900">{totalStores}</p>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
            Total Toko Aktif
          </p>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-3">
            Jumlah toko terafiliasi yang dipantau.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 ">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl">
              <Package size={18} />
            </div>
            <span className="text-[10px] bg-gray-500/10 text-gray-700 font-medium px-2 py-0.5 rounded-full">
              Logistik
            </span>
          </div>
          <p className="text-2xl font-medium text-gray-900">
            {totalStockKg.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
            Total Stok (Kg)
          </p>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-3">
            Gabungan stok di seluruh etalase toko.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 ">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] bg-gray-500/10 text-gray-700 font-medium px-2 py-0.5 rounded-full">
              Proyeksi
            </span>
          </div>
          <p className="text-2xl font-medium text-primary-600">
            {formatRp(totalProjectedProfit)}
          </p>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
            Projected Laba Bersih
          </p>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-3">
            Estimasi laba kumulatif dari seluruh persediaan.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari toko berdasarkan nama atau kota..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <button
          onClick={fetchStoresMargin}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Segarkan
        </button>
      </div>

      {/* Cards Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-primary-50 rounded-lg flex items-center justify-center">
            <Sliders size={12} className="text-primary-600" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-700">
            Daftar Toko ({filteredStores.length})
          </h3>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Store size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada toko yang ditemukan</p>
            {search && (
              <p className="text-sm mt-1">Coba hapus filter pencarian</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-200 hover: transition-all group overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/admin/toko/margin/${s.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <Store size={16} className="text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight group-hover:text-primary-700 transition-colors truncate">
                          {s.nama}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin
                            size={9}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <p className="text-[10px] text-gray-400 truncate">
                            {s.kabupaten || "Kota belum diset"}
                            {s.wilayah ? ` • ${s.wilayah}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1"
                    />
                  </div>

                  {/* Margin badge + stats */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${marginColor(s.defaultMargin)}`}
                    >
                      {s.defaultMargin}% margin
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-medium">
                      Max: {s.marginMaxPersen || 30}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {s.defaultMargin >= 25
                        ? "🔥 Tinggi"
                        : s.defaultMargin >= 15
                          ? "✅ Normal"
                          : s.defaultMargin >= 8
                            ? "⚠️ Rendah"
                            : "🔴 Kritis"}
                    </span>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-[13px] font-medium text-gray-800">
                        {s.totalProduk}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                        Produk
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-[13px] font-medium text-gray-800">
                        {s.totalStock >= 1000
                          ? `${(s.totalStock / 1000).toFixed(1)}t`
                          : s.totalStock}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                        Stok Kg
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-[13px] font-medium text-primary-600">
                        {formatRp(s.totalEstimatedProfit)}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                        Est. Profit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 pb-4 pt-0 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDefault(s);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[11px] font-medium transition-all"
                  >
                    <Settings size={12} /> Ubah Default
                  </button>
                  <button
                    onClick={() => router.push(`/admin/toko/margin/${s.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-medium transition-all"
                  >
                    <BarChart2 size={12} /> Kelola Produk
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Default Margin Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 relative space-y-4 ">
            <button
              onClick={() => setEditingStore(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-medium text-gray-900">
                Ubah Margin Default Toko
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Toko:{" "}
                <span className="font-semibold text-gray-700">
                  {editingStore.nama}
                </span>
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-2xl text-[11px] font-semibold border ${
                  message.type === "success"
                    ? "bg-primary-50 border-primary-100 text-primary-700"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveDefaultMargin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Margin Default (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={newMaxMarginInput}
                    value={newMarginInput}
                    onChange={(e) =>
                      setNewMarginInput(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-400">%</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                  * Berlaku untuk semua produk yang tidak punya margin override
                  individual.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Batas Maksimum Margin (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMaxMarginInput}
                    onChange={(e) =>
                      setNewMaxMarginInput(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-400">%</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed mt-1">
                  * Batas maksimum margin yang diperbolehkan bagi Seller untuk
                  dikonfigurasi.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-all active:scale-98"
                >
                  {savingConfig ? "Menyimpan..." : "Simpan Konfigurasi Margin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Margin Modal */}
      {globalMarginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-medium text-gray-900 text-lg flex items-center gap-2">
                <Settings className="text-primary-600" size={20} />
                Standar Margin Global
              </h3>
              <button
                onClick={() => setGlobalMarginModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGlobalMargin} className="p-6">
              {globalMessage && (
                <div
                  className={`p-3 rounded-xl mb-4 text-[13px] font-medium flex items-center gap-2 ${
                    globalMessage.type === "success"
                      ? "bg-primary-50 text-primary-700 border border-primary-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {globalMessage.type === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {globalMessage.text}
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">
                Pengaturan ini akan mengubah margin B2B secara otomatis untuk{" "}
                <strong className="text-primary-600">
                  {storesList.length} toko
                </strong>{" "}
                yang terdaftar. Apakah Anda yakin?
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Persentase Keuntungan Nasional
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={globalMarginInput}
                    onChange={(e) =>
                      setGlobalMarginInput(Number(e.target.value))
                    }
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                  <Percent
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Direkomendasikan: 15% - 25% sesuai SK
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Batas Maksimum Margin Nasional
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={globalMaxMarginInput}
                    onChange={(e) =>
                      setGlobalMaxMarginInput(Number(e.target.value))
                    }
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                  <Percent
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Default: 30% sesuai arahan terbaru
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setGlobalMarginModalOpen(false)}
                  disabled={savingGlobal}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingGlobal}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {savingGlobal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Terapkan ke Semua"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-medium text-gray-900 text-lg flex items-center gap-2">
                <History className="text-primary-600" size={20} />
                Riwayat Penggantian Margin
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
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Toko</th>
                        <th className="px-4 py-3">Tipe / Produk</th>
                        <th className="px-4 py-3 text-center">Margin Lama</th>
                        <th className="px-4 py-3 text-center">Margin Baru</th>
                        <th className="px-4 py-3 text-center">Aktor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          className="border-b last:border-0 hover:bg-primary-50/30 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-[12px] font-medium text-gray-900">
                            {dayjs(item.createdAt).format("DD MMM YYYY, HH:mm")}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium truncate max-w-[150px]">
                            {item.toko?.nama || "Toko"}
                          </td>
                          <td className="px-4 py-3">
                            {item.produkId ? (
                              <span className="text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-md text-[11px] truncate max-w-[150px] inline-block">
                                {item.produk?.nama?.replace(" - ", " ") ||
                                  "Produk"}
                              </span>
                            ) : (
                              <span className="text-primary-600 font-medium bg-primary-50 border border-primary-200 px-2 py-1 rounded-md text-[11px]">
                                Default Toko
                              </span>
                            )}
                            {item.keterangan && (
                              <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[150px]">
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
                            <span className="text-primary-600 font-mono font-medium text-xs bg-primary-50 px-2 py-1 rounded-md border border-primary-100">
                              {item.marginBaru}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                                item.diubahOlehPeran === "ADMIN"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-gray-100 text-gray-700"
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
