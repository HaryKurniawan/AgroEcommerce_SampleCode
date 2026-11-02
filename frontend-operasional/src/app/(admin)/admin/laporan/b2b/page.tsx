"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Calendar,
  Loader2,
  TrendingUp,
  RefreshCw,
  Weight,
  Banknote,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { formatRupiah } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";

type PeriodKey = "today" | "week" | "month" | "last_month" | "3months" | "all";

interface PeriodOption {
  key: PeriodKey;
  label: string;
}

const PERIODS: PeriodOption[] = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "last_month", label: "Bulan Lalu" },
  { key: "3months", label: "3 Bulan" },
  { key: "all", label: "Semua Waktu" },
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

interface B2BSummary {
  totalTonaseKg: number;
  pendapatanPokokSbu: number;
  totalPesananB2b: number;
  totalKeuntunganSeller: number;
}

export default function LaporanGlobalB2BPage() {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated, user } = useAuthStore();

  const [activePeriod, setActivePeriod] = useState<PeriodKey>("all");
  const [summary, setSummary] = useState<B2BSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async (period: PeriodKey) => {
    setLoading(true);
    try {
      const range = getDateRange(period);
      const params = new URLSearchParams();
      if (range.startDate) params.append("startDate", range.startDate);
      if (range.endDate) params.append("endDate", range.endDate);

      const res = await apiClient.get(
        `/ecommerce/profit-report/admin/b2b-summary?${params.toString()}`,
      );
      setSummary(res.data?.data || res.data);
    } catch {
      toast.error("Gagal memuat ringkasan B2B");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN_CS") {
      toast.error("Akses ditolak.");
      router.push("/");
      return;
    }
    loadSummary(activePeriod);
  }, [_hasHydrated, isAuthenticated, user, router, activePeriod, loadSummary]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-600" size={26} />
          <p className="text-xs text-slate-400 font-normal">Memuat data...</p>
        </div>
      </div>
    );
  }

  const periodLabel =
    PERIODS.find((p) => p.key === activePeriod)?.label ?? "Periode";

  const cards = [
    {
      icon: Weight,
      label: "Total Tonase B2B",
      value: summary
        ? `${summary.totalTonaseKg.toLocaleString("id-ID")} Kg`
        : "–",
      sub: `Periode: ${periodLabel}`,
    },
    {
      icon: Banknote,
      label: "Pendapatan Kas SBU",
      value: summary ? formatRupiah(summary.pendapatanPokokSbu) : "–",
      sub: "Nilai Harga Gudang yang ditagihkan",
    },
    {
      icon: TrendingUp,
      label: "Keuntungan Seller B2B",
      value: summary ? formatRupiah(summary.totalKeuntunganSeller) : "–",
      sub: "Estimasi Margin Seller dari B2B",
    },
    {
      icon: ShoppingCart,
      label: "Total Pesanan B2B",
      value: summary ? `${summary.totalPesananB2b} Pesanan` : "–",
      sub: "Bypass logistik SBU",
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans pb-10">
      {/* ── Page Header ─────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
            <Package size={18} className="text-primary-600" />
            Laporan Global B2B (Grosir)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Pantau total tonase dan pendapatan pokok dari seluruh pesanan grosir
            (B2B).
          </p>
        </div>
        {!loading && (
          <button
            onClick={() => loadSummary(activePeriod)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
          >
            <RefreshCw size={13} />
            Segarkan
          </button>
        )}
      </div>

      {/* ── Period Filter ─────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
            Filter Periode Laporan
          </span>
          {loading && (
            <Loader2 size={12} className="animate-spin text-primary-500 ml-1" />
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-normal transition-all ${
                activePeriod === p.key
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                <card.icon size={15} />
              </div>
              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider leading-tight">
                {card.label}
              </p>
            </div>
            {loading ? (
              <div className="h-7 w-24 rounded-lg animate-pulse bg-slate-100" />
            ) : (
              <p className="text-xl font-normal text-slate-900 tracking-tight break-all">
                {card.value}
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-normal">
              {card.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
