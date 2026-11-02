"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Package,
  Calendar,
  Loader2,
  Download,
  TrendingUp,
  ArrowDownUp,
  FileSpreadsheet,
  Percent,
  ShoppingCart,
  RefreshCw,
  ChevronDown,
  Search,
  Filter,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  ordersApi,
  storesApi,
  formatRupiah,
  formatTanggal,
} from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { fetchProfitSummary } from "@/lib/api/profit-report";

// ─── Tipe periode ────────────────────────────────────────────────────────────

type PeriodKey = "today" | "week" | "month" | "last_month" | "3months" | "all";

interface PeriodOption {
  key: PeriodKey;
  label: string;
}

const PERIODS: PeriodOption[] = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "7 Hari" },
  { key: "month", label: "Bulan Ini" },
  { key: "last_month", label: "Bln Lalu" },
  { key: "3months", label: "3 Bulan" },
  { key: "all", label: "Semua" },
];

function getDateRange(period: PeriodKey): {
  startDate?: string;
  endDate?: string;
} {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().split("T")[0];

  if (period === "today") return { startDate: iso(now), endDate: iso(now) };
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { startDate: iso(start), endDate: iso(now) };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: iso(start), endDate: iso(now) };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: iso(start), endDate: iso(end) };
  }
  if (period === "3months") {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    return { startDate: iso(start), endDate: iso(now) };
  }
  return {};
}

interface ProfitSummary {
  totalKeuntungan: number;
  totalPenjualan: number;
  totalHargaBeli: number;
  rataRataMargin: number;
  produkTerlaris?: { produk: { nama: string }; jumlahTerjual: number }[];
}

interface FinanceOrder {
  id?: string;
  totalHarga?: number | string;
  totalAmount?: number | string;
  status?: string;
  tanggalDibuat?: string;
  createdAt?: string;
  items?: unknown[];
  item?: any[];
  customer?: { name?: string };
  konsumen?: { nama?: string; email?: string };
  pembeli?: string;
  metodeBayar?: string;
}

type OrderFilterType = "ALL" | "RETAIL" | "B2B";

// ─── Status badge helper ──────────────────────────────────────────────────────

function getStatusStyle(status: string): {
  bg: string;
  text: string;
  label: string;
} {
  const s = (status || "").toLowerCase();
  if (["selesai", "delivered"].includes(s))
    return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Selesai" };
  if (["dibatalkan", "cancelled"].includes(s))
    return { bg: "bg-red-50", text: "text-red-600", label: "Dibatalkan" };
  if (["dikirim", "shipped"].includes(s))
    return { bg: "bg-blue-50", text: "text-blue-600", label: "Dikirim" };
  if (["diproses", "processing"].includes(s))
    return { bg: "bg-violet-50", text: "text-violet-600", label: "Diproses" };
  return {
    bg: "bg-amber-50",
    text: "text-amber-600",
    label: status || "Menunggu",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaporanKeuanganPage() {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();

  const [tokoId, setTokoId] = useState<string | null>(null);
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [baseLoading, setBaseLoading] = useState(true);

  const [activePeriod, setActivePeriod] = useState<PeriodKey>("all");
  const [orderType, setOrderType] = useState<OrderFilterType>("ALL");
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [showDownload, setShowDownload] = useState(false);

  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [stockStartDate, setStockStartDate] = useState("");
  const [stockEndDate, setStockEndDate] = useState("");
  const [downloadingOrders, setDownloadingOrders] = useState(false);
  const [downloadingStock, setDownloadingStock] = useState(false);

  const fetchOrders = useCallback(async (id: string, type: OrderFilterType) => {
    try {
      const isGrosir =
        type === "B2B" ? true : type === "RETAIL" ? false : undefined;
      const ordersRes = await ordersApi.sellerGetOrders(id, {
        isGrosir,
        limit: 1000,
      });
      const rawList =
        ordersRes?.data?.data?.data ||
        ordersRes?.data?.data ||
        ordersRes?.data ||
        [];
      const list: FinanceOrder[] = Array.isArray(rawList) ? rawList : [];
      setOrders(
        [...list].sort(
          (a, b) =>
            new Date(b.tanggalDibuat || b.createdAt || "").getTime() -
            new Date(a.tanggalDibuat || a.createdAt || "").getTime(),
        ),
      );
    } catch {
      toast.error("Gagal memuat daftar pesanan");
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        const storeRes = await storesApi.getMyStore();
        const storeData =
          extractArray(storeRes)[0] || storeRes?.data?.data || storeRes?.data;
        const id = storeData?.id;
        if (!id) {
          setBaseLoading(false);
          return;
        }
        setTokoId(id);
      } catch {
        toast.error("Gagal memuat profil toko");
      } finally {
        setBaseLoading(false);
      }
    };
    init();
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (tokoId) fetchOrders(tokoId, orderType);
  }, [tokoId, orderType, fetchOrders]);

  const loadSummary = useCallback(
    async (period: PeriodKey, id: string, type: OrderFilterType) => {
      setSummaryLoading(true);
      try {
        const range: any = getDateRange(period);
        if (type === "B2B") range.isB2B = true;
        else if (type === "RETAIL") range.isB2B = false;
        const res = await fetchProfitSummary(id, range);
        const data = (res as any)?.data ?? res;
        setSummary(data as ProfitSummary);
      } catch {
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (tokoId) loadSummary(activePeriod, tokoId, orderType);
  }, [tokoId, activePeriod, orderType, loadSummary]);

  const applyOrderPreset = (days: number) => {
    if (days === 0) {
      setOrderStartDate("");
      setOrderEndDate("");
      return;
    }
    const end = new Date(),
      start = new Date();
    start.setDate(end.getDate() - days);
    setOrderStartDate(start.toISOString().split("T")[0]);
    setOrderEndDate(end.toISOString().split("T")[0]);
  };

  const applyStockPreset = (days: number) => {
    if (days === 0) {
      setStockStartDate("");
      setStockEndDate("");
      return;
    }
    const end = new Date(),
      start = new Date();
    start.setDate(end.getDate() - days);
    setStockStartDate(start.toISOString().split("T")[0]);
    setStockEndDate(end.toISOString().split("T")[0]);
  };

  const handleDownloadOrders = async () => {
    if (!tokoId) {
      toast.error("ID Toko tidak ditemukan.");
      return;
    }
    if (!orderStartDate || !orderEndDate) {
      toast.error("Silahkan pilih tanggal untuk cetak laporan");
      return;
    }
    setDownloadingOrders(true);
    const tid = toast.loading("Menyiapkan Laporan Transaksi...");
    try {
      const res = await apiClient.get(
        `/ecom-pesanan/penjual/${tokoId}/laporan/excel`,
        {
          params: {
            startDate: orderStartDate || undefined,
            endDate: orderEndDate || undefined,
          },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Transaksi_${orderStartDate || "semua"}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan Transaksi diunduh!", { id: tid });
    } catch {
      toast.error("Gagal mengunduh laporan.", { id: tid });
    } finally {
      setDownloadingOrders(false);
    }
  };

  const handleDownloadStock = async () => {
    if (!tokoId) {
      toast.error("ID Toko tidak ditemukan.");
      return;
    }
    if (!stockStartDate || !stockEndDate) {
      toast.error("Silahkan pilih tanggal untuk cetak laporan");
      return;
    }
    setDownloadingStock(true);
    const tid = toast.loading("Menyiapkan Laporan Mutasi Stok...");
    try {
      const res = await apiClient.get(
        `/ecom-produk/penjual/${tokoId}/laporan-stok/excel`,
        {
          params: {
            startDate: stockStartDate || undefined,
            endDate: stockEndDate || undefined,
          },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Stok_${stockStartDate || "semua"}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan Mutasi Stok diunduh!", { id: tid });
    } catch {
      toast.error("Gagal mengunduh laporan stok.", { id: tid });
    } finally {
      setDownloadingStock(false);
    }
  };

  if (!_hasHydrated || baseLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
          <p className="text-sm text-slate-400">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const periodLabel = PERIODS.find((p) => p.key === activePeriod)?.label ?? "";

  // Filter orders untuk tabel
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      !searchQuery ||
      (order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.konsumen?.nama || order.customer?.name || order.pembeli || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "semua" ||
      (order.status || "").toLowerCase() === statusFilter;

    let matchPeriod = true;
    if (activePeriod !== "all") {
      const { startDate, endDate } = getDateRange(activePeriod);
      if (startDate || endDate) {
        const rawDate =
          order.tanggalDibuat || order.createdAt || (order as any).tanggal;
        if (rawDate) {
          try {
            const orderDateStr = new Date(rawDate).toISOString().split("T")[0];
            if (startDate && orderDateStr < startDate) matchPeriod = false;
            if (endDate && orderDateStr > endDate) matchPeriod = false;
          } catch {
            // fallback jika format tanggal bukan ISO baku
          }
        }
      }
    }

    return matchSearch && matchStatus && matchPeriod;
  });

  const totalSelesai = filteredOrders.filter((o) =>
    ["selesai", "delivered"].includes((o.status || "").toLowerCase()),
  ).length;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2.5">
            <ClipboardList size={20} className="text-emerald-600" />
            Riwayat Pesanan
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau semua pesanan masuk ke toko Anda
          </p>
        </div>

        {/* Aksi Download */}
        <button
          onClick={() => setShowDownload((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:text-emerald-700 transition-all"
        >
          <Download size={14} />
          Unduh Laporan
          <ChevronDown
            size={13}
            className={`transition-transform ${showDownload ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Download Panel (collapsible) ── */}
      {showDownload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
          {/* Transaksi */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileSpreadsheet size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Laporan Transaksi
                </p>
                <p className="text-[11px] text-slate-400">
                  Data pembeli, produk, total
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ["Mulai", orderStartDate, setOrderStartDate],
                ["Selesai", orderEndDate, setOrderEndDate],
              ].map(([lbl, val, setter]) => (
                <div key={lbl as string}>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">
                    {lbl as string}
                  </label>
                  <input
                    type="date"
                    value={val as string}
                    onChange={(e) => (setter as any)(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-400 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mb-4">
              {[
                [7, "7H"],
                [30, "30H"],
                [0, "Semua"],
              ].map(([d, l]) => (
                <button
                  key={l}
                  onClick={() => applyOrderPreset(d as number)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 text-[10px] font-medium rounded-lg border border-slate-200 transition-all"
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownloadOrders}
              disabled={downloadingOrders}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {downloadingOrders ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Mengekspor...
                </>
              ) : (
                <>
                  <Download size={12} /> Unduh .xlsx
                </>
              )}
            </button>
          </div>

          {/* Mutasi Stok */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <ArrowDownUp size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Mutasi Stok
                </p>
                <p className="text-[11px] text-slate-400">
                  Riwayat keluar masuk barang
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ["Mulai", stockStartDate, setStockStartDate],
                ["Selesai", stockEndDate, setStockEndDate],
              ].map(([lbl, val, setter]) => (
                <div key={lbl as string}>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">
                    {lbl as string}
                  </label>
                  <input
                    type="date"
                    value={val as string}
                    onChange={(e) => (setter as any)(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-teal-400 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mb-4">
              {[
                [7, "7H"],
                [30, "30H"],
                [0, "Semua"],
              ].map(([d, l]) => (
                <button
                  key={l}
                  onClick={() => applyStockPreset(d as number)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-600 text-slate-500 text-[10px] font-medium rounded-lg border border-slate-200 transition-all"
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownloadStock}
              disabled={downloadingStock}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {downloadingStock ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Mengekspor...
                </>
              ) : (
                <>
                  <Download size={12} /> Unduh .xlsx
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Pilih Periode di summary */}
        <div className="col-span-2 md:col-span-4 flex items-center gap-4 mb-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
            Ringkasan
          </span>

          <div className="flex-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            <SegmentedControl
              value={activePeriod}
              onChange={(val) => setActivePeriod(val as PeriodKey)}
              options={PERIODS.map((p) => ({
                value: p.key,
                label: p.label,
              }))}
            />
          </div>

          {summaryLoading ? (
            <Loader2
              size={14}
              className="animate-spin text-emerald-500 ml-1 shrink-0"
            />
          ) : tokoId ? (
            <button
              onClick={() => loadSummary(activePeriod, tokoId, orderType)}
              className="text-slate-400 hover:text-emerald-600 transition-colors bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0"
              title="Refresh Ringkasan"
            >
              <RefreshCw size={14} />
            </button>
          ) : null}
        </div>

        {[
          {
            label: "Keuntungan",
            value: formatRupiah(summary?.totalKeuntungan ?? 0),
            icon: <TrendingUp size={14} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Omset",
            value: formatRupiah(summary?.totalPenjualan ?? 0),
            icon: <DollarSign size={14} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "HPP",
            value: formatRupiah(summary?.totalHargaBeli ?? 0),
            icon: <ShoppingCart size={14} />,
            color: "text-slate-600",
            bg: "bg-slate-100",
          },
          {
            label: "Margin",
            value: `${(summary?.rataRataMargin ?? 0).toFixed(1)}%`,
            icon: <Percent size={14} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`p-2 rounded-lg ${card.bg} ${card.color} flex-shrink-0`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium">
                {card.label} · {periodLabel}
              </p>
              {summaryLoading ? (
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mt-1" />
              ) : (
                <p className={`text-sm font-semibold ${card.color} truncate`}>
                  {card.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabel Riwayat Pesanan ── */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar Tabel */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Daftar Pesanan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredOrders.length} dari {orders.length} pesanan ·{" "}
              <span className="text-emerald-600">{totalSelesai} selesai</span>
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari ID atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-all"
              />
            </div>

            {/* Tipe Pesanan */}
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderFilterType)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 text-slate-600 transition-all"
            >
              <option value="ALL">Semua</option>
              <option value="RETAIL">Eceran</option>
              <option value="B2B">Grosir</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 text-slate-600 transition-all"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="dikirim">Dikirim</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5 text-left">Pesanan</th>
                <th className="py-3 px-5 text-left">Tanggal</th>
                <th className="py-3 px-5 text-left">Pembeli</th>
                <th className="py-3 px-5 text-right">Keuntungan</th>
                <th className="py-3 px-5 text-right">Margin</th>
                <th className="py-3 px-5 text-right">Total</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const badge = getStatusStyle(order.status || "");

                // Hitung margin per order dari item.transaksiKeuntungan
                const items = order.item || order.items || [];
                let orderHpp = 0;
                let orderOmset = 0;
                let hasProfitTx = false;

                items.forEach((it: any) => {
                  const tx = it.transaksiKeuntungan;
                  if (tx) {
                    hasProfitTx = true;
                    orderHpp += tx.totalHargaBeli || 0;
                    orderOmset += tx.jumlahTerjual * tx.hargaJual || 0;
                  }
                });

                const orderKeuntungan = orderOmset - orderHpp;
                const orderMargin =
                  orderHpp > 0 ? (orderKeuntungan / orderHpp) * 100 : 0;

                const orderId =
                  order.id ||
                  (order as any).id_pesanan ||
                  (order as any).id_pesananEcom ||
                  (order as any).pesananId ||
                  (order as any)._id;
                const isGrosir = Boolean(
                  (order as any).isGrosir ||
                  (order as any).isPesananGrosir ||
                  (order as any).tipe === "B2B" ||
                  (order as any).tipePesanan === "GROSIR",
                );
                const detailUrl = isGrosir
                  ? `/seller/pesanan-grosir/${orderId}`
                  : `/seller/pesanan/${orderId}`;

                return (
                  <tr
                    key={orderId || idx}
                    onClick={() => {
                      if (orderId) {
                        window.location.href = detailUrl;
                      }
                    }}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                        #{(orderId || "").substring(0, 8).toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {items.length} item
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                      {formatTanggal(
                        order.tanggalDibuat || order.createdAt || "",
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="text-slate-800 font-medium max-w-[160px] truncate">
                        {order.konsumen?.nama ||
                          order.customer?.name ||
                          order.pembeli ||
                          "—"}
                      </p>
                      {order.metodeBayar && (
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                          {order.metodeBayar.replace(/_/g, " ")}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold whitespace-nowrap">
                      {hasProfitTx ? (
                        <span
                          className={
                            orderKeuntungan >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }
                        >
                          {formatRupiah(orderKeuntungan)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold whitespace-nowrap">
                      {hasProfitTx ? (
                        <span
                          className={
                            orderMargin >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }
                        >
                          {orderMargin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-slate-800 whitespace-nowrap">
                      {formatRupiah(order.totalHarga || order.totalAmount || 0)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">
                      {searchQuery || statusFilter !== "semua"
                        ? "Tidak ada pesanan yang cocok"
                        : "Belum ada riwayat pesanan"}
                    </p>
                    {(searchQuery || statusFilter !== "semua") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("semua");
                        }}
                        className="mt-2 text-[11px] text-emerald-600 hover:underline"
                      >
                        Reset filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
