"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Truck,
  Store,
} from "lucide-react";

import { formatRupiah, chatApi } from "@/lib/ecommerce-api";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";
import {
  compute7DayChart,
  computeTrend,
} from "@/components/ecommerce/analytics/AnalyticsWidgets";

// ─── Helper Hari Ini ─────────────────────────────────────────────────────────
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#10b981",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data, 1);
  const h = 32;
  const w = data.length * 10;
  const pts = data
    .map((v, i) => `${i * 10},${h - (v / max) * (h - 4)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Gradient area under line */}
      <polyline
        points={`0,${h} ${pts} ${(data.length - 1) * 10},${h}`}
        fill={`${color}18`}
        stroke="none"
      />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  chartData,
  chartColor,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
  chartData?: number[];
  chartColor?: string;
  onClick?: () => void;
}) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border border-slate-100 rounded-2xl p-5 text-left hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-200 active:scale-[0.98] overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-emerald-300/20 rounded-t-2xl" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
          <Icon
            size={16}
            className="text-slate-500 group-hover:text-emerald-600 transition-colors"
          />
        </div>
        <ArrowUpRight
          size={13}
          className="text-slate-300 group-hover:text-emerald-400 transition-colors mt-0.5"
        />
      </div>

      <p className="text-[22px] font-medium text-slate-800 leading-none tracking-tight mb-1">
        {value}
      </p>
      <p className="text-[11px] text-slate-400 font-normal">{label}</p>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
              isUp
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-500"
            }`}
          >
            {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {isUp ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
        </div>
      )}

      {chartData && chartData.length > 0 && (
        <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={chartData} color={chartColor ?? "#10b981"} />
        </div>
      )}
    </button>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  label,
  count,
  dot,
  onClick,
}: {
  label: string;
  count: number;
  dot: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <span className="text-[11px] font-medium text-slate-800 ml-auto">
        {count}
      </span>
    </button>
  );
}

// ─── Horizontal Distribution Bar ─────────────────────────────────────────────
function DistBar({
  items,
}: {
  items: { label: string; count: number; cls: string }[];
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return <div className="h-2 bg-slate-100 rounded-full" />;
  return (
    <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          className={`${item.cls} transition-all duration-500`}
          style={{ width: `${(item.count / total) * 100}%` }}
          title={`${item.label}: ${item.count}`}
        />
      ))}
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  MENUNGGU_BAYAR: {
    label: "Menunggu",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  DIPROSES: {
    label: "Diproses",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  DIKIRIM: {
    label: "Dikirim",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  SELESAI: {
    label: "Selesai",
    cls: "bg-slate-50 text-slate-400 border-slate-100",
  },
  DIBATALKAN: {
    label: "Batal",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

function OrderRow({ order }: { order: any }) {
  const s = STATUS_MAP[order.status] ?? {
    label: order.status,
    cls: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <ShoppingBag size={13} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-700 truncate">
          {order.customer?.name || order.customerId || "—"}
        </p>
        <p className="text-[11px] text-slate-400">
          {order.items?.length ?? 0} item
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] font-medium text-slate-800">
          {formatRupiah(Number(order.totalHarga) || 0)}
        </p>
        <span
          className={`inline-block text-[9px] uppercase font-medium px-2 py-0.5 rounded-md border mt-0.5 ${s.cls}`}
        >
          {s.label}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const DashboardSellerPage: React.FC = () => {
  const router = useRouter();
  const {
    store,
    orders: safeOrders,
    dashboardStats,
    bookings,
    loading,
    stats,
    refetch,
  } = useSellerDashboard();
  const [creatingChat, setCreatingChat] = useState(false);

  const handleTanyaAdmin = async () => {
    setCreatingChat(true);
    try {
      const res = await chatApi.createConversation({ type: "ADMIN_CS" });
      const conversationId = res?.data?.data?.id || res?.data?.id;
      if (conversationId) {
        router.push(`/seller/chat/${conversationId}`);
      } else {
        router.push("/seller/chat");
      }
    } catch {
      router.push("/seller/chat");
    } finally {
      setCreatingChat(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Memuat pesanan…</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (!store || (store as any).error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl flex items-center gap-3">
        <AlertCircle size={20} />
        <div>
          <h3 className="font-medium text-sm">Toko Tidak Ditemukan</h3>
          <p className="text-xs mt-0.5 text-red-500">
            Anda belum memiliki toko. Silakan buat toko terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  // ── Data derivations ─────────────────────────────────────────────────
  const chart7Day = compute7DayChart(dashboardStats?.recentOrders || []);
  const trendPesanan = computeTrend(dashboardStats?.recentOrders || []);

  const pendingCount =
    (dashboardStats?.statusCounts["MENUNGGU_BAYAR"] || 0) +
    (dashboardStats?.statusCounts["DIPROSES"] || 0);
  const selesaiCount = dashboardStats?.statusCounts["SELESAI"] || 0;
  const dikirimCount = dashboardStats?.statusCounts["DIKIRIM"] || 0;
  const batalCount = dashboardStats?.statusCounts["DIBATALKAN"] || 0;

  const revenue = dashboardStats?.revenue || 0;

  const totalOrdersCount = dashboardStats?.totalOrders || 0;

  const avgOrderVal = totalOrdersCount > 0 ? revenue / totalOrdersCount : 0;

  const conversionRate =
    totalOrdersCount > 0 ? (selesaiCount / totalOrdersCount) * 100 : 0;

  // ── Filter Khusus HARI INI & AKTIF ────────────────────────────────────
  const allOrdersList: any[] =
    (dashboardStats?.recentOrders?.length
      ? dashboardStats.recentOrders
      : safeOrders) || [];

  const todayActiveOrders = allOrdersList.filter((o: any) => {
    const dateStr = o.createdAt || o.tanggalDibuat || o.tanggal;
    const matchDate = isToday(dateStr);
    const statusUpper = (o.status || "").toUpperCase();
    const isActive =
      statusUpper !== "DIBATALKAN" && statusUpper !== "CANCELLED";
    return matchDate && isActive;
  });

  const todayPendingCount = todayActiveOrders.filter((o: any) =>
    ["MENUNGGU_BAYAR", "DIPROSES", "MENUNGGU", "DIPROSES"].includes(
      (o.status || "").toUpperCase(),
    ),
  ).length;

  const todayDikirimCount = todayActiveOrders.filter((o: any) =>
    ["DIKIRIM", "SHIPPED"].includes((o.status || "").toUpperCase()),
  ).length;

  const todaySelesaiCount = todayActiveOrders.filter((o: any) =>
    ["SELESAI", "DELIVERED"].includes((o.status || "").toUpperCase()),
  ).length;

  const todayDistItems = [
    { label: "Pending", count: todayPendingCount, cls: "bg-amber-400" },
    { label: "Dikirim", count: todayDikirimCount, cls: "bg-sky-400" },
    { label: "Selesai", count: todaySelesaiCount, cls: "bg-emerald-500" },
  ].filter((item) => item.count > 0);

  const MAX_SHOW_ORDERS = 5;
  const displayedTodayOrders = todayActiveOrders.slice(0, MAX_SHOW_ORDERS);
  const remainingOrdersCount = Math.max(
    0,
    todayActiveOrders.length - MAX_SHOW_ORDERS,
  );

  return (
    <div className="space-y-8 w-full pb-10">
      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl px-6 py-5 text-white shadow-md">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Store identity */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center text-2xl backdrop-blur-md overflow-hidden flex-shrink-0 shadow-inner">
              {(store as any).fotoUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={(store as any).fotoUrl}
                    alt={(store as any).nama || "Toko"}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Store size={26} className="text-white/90" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-medium text-xl tracking-tight text-white">
                  {(store as any).nama}
                </h1>
                <span className="text-[10px] font-medium bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Aktif
                </span>
              </div>
              <p className="text-emerald-100 text-xs font-medium">
                {(store as any).kabupaten}
                {(store as any).wilayah ? ` · ${(store as any).wilayah}` : ""}
              </p>
            </div>
          </div>

          {/* Warehouse status chip - REMOVED for open marketplace */}
        </div>
      </div>

      {/* ── QUICK STAT PILLS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => router.push("/seller/pesanan")}
          className="group relative bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600 border border-emerald-100/50">
            <ShoppingBag size={15} />
          </div>
          <p className="text-lg font-medium text-slate-800 leading-none">
            {totalOrdersCount}
          </p>
          <p className="text-[10px] text-slate-400 font-normal mt-1">
            Total Pesanan
          </p>
          <ChevronRight
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-slate-400 transition-colors"
          />
        </button>

        <button
          onClick={() => router.push("/seller/pesanan")}
          className="group relative bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-amber-50 text-amber-600 border border-amber-100/50">
            <Clock size={15} />
          </div>
          <p className="text-lg font-medium text-slate-800 leading-none">
            {pendingCount}
          </p>
          <p className="text-[10px] text-slate-400 font-normal mt-1">
            Menunggu
          </p>
          <ChevronRight
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-slate-400 transition-colors"
          />
        </button>

        <button
          onClick={() => router.push("/seller/pesanan")}
          className="group relative bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-sky-50 text-sky-600 border border-sky-100/50">
            <Truck size={15} />
          </div>
          <p className="text-lg font-medium text-slate-800 leading-none">
            {dikirimCount}
          </p>
          <p className="text-[10px] text-slate-400 font-normal mt-1">Dikirim</p>
          <ChevronRight
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-slate-400 transition-colors"
          />
        </button>

        <button
          onClick={() => router.push("/seller/pesanan")}
          className="group relative bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600 border border-emerald-100/50">
            <CheckCircle2 size={15} />
          </div>
          <p className="text-lg font-medium text-slate-800 leading-none">
            {selesaiCount}
          </p>
          <p className="text-[10px] text-slate-400 font-normal mt-1">Selesai</p>
          <ChevronRight
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-slate-400 transition-colors"
          />
        </button>
      </div>

      {/* ── ANALYTICS KPI STRIP ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-slate-400" />
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">
            Analitik Pesanan
          </span>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          <KpiCard
            label="Pesanan 7 Hari"
            value={chart7Day.reduce((a, b) => a + b, 0)}
            sub="vs. kemarin"
            icon={ShoppingBag}
            trend={trendPesanan}
            chartData={chart7Day}
            chartColor="#10b981"
            onClick={() => router.push("/seller/pesanan")}
          />
          <KpiCard
            label="Pendapatan"
            value={formatRupiah(revenue)}
            sub="selesai + dikirim"
            icon={DollarSign}
            trend={conversionRate - 50}
            chartData={chart7Day.map((c) => c * Math.round(avgOrderVal / 1000))}
            chartColor="#6366f1"
            onClick={() => router.push("/seller/laporan")}
          />
          <KpiCard
            label="Rata-Rata Order"
            value={formatRupiah(avgOrderVal)}
            sub={`dari ${totalOrdersCount} pesanan`}
            icon={TrendingUp}
            chartData={chart7Day}
            chartColor="#f59e0b"
            onClick={() => router.push("/seller/pesanan")}
          />
        </div>
      </div>

      {/* ── ORDER STATUS + RECENT ORDERS ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <BarChart2 size={12} className="text-slate-400" />
              </div>
              <span className="text-[13px] font-medium text-slate-700">
                Distribusi Status (Hari Ini)
              </span>
            </div>
            <button
              onClick={() => router.push("/seller/pesanan")}
              className="text-[11px] text-emerald-600 font-medium hover:underline flex items-center gap-0.5"
            >
              Detail <ArrowUpRight size={11} />
            </button>
          </div>

          <DistBar items={todayDistItems} />

          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              {
                label: "Pending",
                count: todayPendingCount,
                dot: "bg-amber-400",
                onClick: () => router.push("/seller/pesanan"),
              },
              {
                label: "Dikirim",
                count: todayDikirimCount,
                dot: "bg-sky-400",
                onClick: () => router.push("/seller/pesanan"),
              },
              {
                label: "Selesai",
                count: todaySelesaiCount,
                dot: "bg-emerald-500",
                onClick: () => router.push("/seller/pesanan"),
              },
            ]
              .filter((item) => item.count > 0)
              .map((item) => (
                <StatPill key={item.label} {...item} />
              ))}
          </div>

          {/* Total badge */}
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-normal">
              Total Pesanan Hari Ini
            </span>
            <span className="text-[15px] font-medium text-slate-800">
              {todayActiveOrders.length}
            </span>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                  <ClipboardList size={12} className="text-slate-400" />
                </div>
                <span className="text-[13px] font-medium text-slate-700">
                  Pesanan Terbaru (Hari Ini)
                </span>
              </div>
              <button
                onClick={() => router.push("/seller/pesanan")}
                className="text-[11px] text-emerald-600 font-medium hover:underline flex items-center gap-0.5"
              >
                Lihat semua <ArrowUpRight size={11} />
              </button>
            </div>

            {displayedTodayOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingBag size={16} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada pesanan aktif hari ini
                </p>
              </div>
            ) : (
              <div>
                {displayedTodayOrders.map((p: any, idx: number) => (
                  <OrderRow key={p?.id || idx} order={p} />
                ))}
              </div>
            )}
          </div>

          {remainingOrdersCount > 0 && (
            <button
              onClick={() => router.push("/seller/pesanan")}
              className="mt-3 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-center text-xs font-semibold text-emerald-600 transition-colors flex items-center justify-center gap-1 group"
            >
              +{remainingOrdersCount} pesanan lagi
              <ChevronRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSellerPage;
