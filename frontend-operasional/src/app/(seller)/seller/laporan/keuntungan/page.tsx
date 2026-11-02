"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Loader2,
  TrendingUp,
  ChevronRight,
  DollarSign,
  ShoppingBag,
  Percent,
  BarChart3,
  TrendingDown,
  Minus,
  Calendar,
  Printer,
} from "lucide-react";
import Image from "next/image";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { productsApi, storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import { useProfitSummary } from "@/hooks/useProfitReport";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface ProductItem {
  id: string;
  nama: string;
  gambarUrl?: string;
  category?: { nama: string };
}

function fmtRpFull(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

function fmtCompact(n: number) {
  const abs = Math.abs(n ?? 0);
  if (abs >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (abs >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  if (abs >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`;
  return fmtRpFull(n);
}

// ── Custom Tooltip Chart ──────────────────────────────────────────────────
const ProfitTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-3 text-xs min-w-[170px]">
      <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            {p.name === "keuntungan" ? "Keuntungan" : "Penjualan"}
          </span>
          <span className="font-semibold text-gray-800">
            {fmtRpFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Summary Card ──────────────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
}

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  valueColor = "text-gray-900",
  loading,
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon size={15} className={iconColor} strokeWidth={2.5} />
        </div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      {loading ? (
        <div className="h-6 w-24 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <p className={`text-lg font-bold tracking-tight ${valueColor}`}>
          {value}
        </p>
      )}
      {sub && !loading && (
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      )}
    </div>
  );
}

// ── Top Product Row ───────────────────────────────────────────────────────
function TopProductRow({
  rank,
  nama,
  keuntungan,
  terjual,
  onClick,
}: {
  rank: number;
  nama: string;
  keuntungan: number;
  terjual: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 px-2 -mx-2 rounded-xl transition-colors group"
    >
      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
          {nama?.replace(" - ", " ")}
        </p>
        <p className="text-[10px] text-gray-400">
          {terjual.toFixed(1)} kg terjual
        </p>
      </div>
      <p className="text-xs font-bold text-emerald-600 flex-shrink-0">
        {fmtCompact(keuntungan)}
      </p>
      <ChevronRight
        size={14}
        className="text-gray-300 group-hover:text-emerald-500 transition-colors"
      />
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product,
  onClick,
}: {
  product: ProductItem;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md group flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 relative">
          {product.gambarUrl ? (
            <Image
              src={product.gambarUrl}
              alt={product.nama?.replace(" - ", " ")}
              fill
              sizes="44px"
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <Package className="text-gray-300" size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-xs line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.nama?.replace(" - ", " ")}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {product.category?.nama || "Tanpa kategori"}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs font-medium text-emerald-600">
          Lihat laporan FIFO
        </span>
        <ChevronRight
          size={14}
          className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </div>
  );
}

type ChartType = "area" | "bar";
type ChartMetric = "keuntungan" | "both";

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LaporanKeuntunganPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string>("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("keuntungan");

  const [dateFilterType, setDateFilterType] = useState<
    "all" | "week" | "month" | "year" | "month-picker" | "custom"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const getFilterDates = () => {
    const today = new Date();
    switch (dateFilterType) {
      case "week":
        return {
          startDate: format(
            startOfWeek(today, { weekStartsOn: 1 }),
            "yyyy-MM-dd",
          ),
          endDate: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        };
      case "month":
        return {
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      case "year":
        return {
          startDate: format(startOfYear(today), "yyyy-MM-dd"),
          endDate: format(endOfYear(today), "yyyy-MM-dd"),
        };
      case "month-picker": {
        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(selectedYear, selectedMonth + 1, 0);
        return {
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
        };
      }
      case "custom":
        return {
          startDate: customStartDate || undefined,
          endDate: customEndDate || undefined,
        };
      case "all":
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  const currentFilters = getFilterDates();

  const { data: summary, isLoading: summaryLoading } = useProfitSummary(
    storeId,
    currentFilters,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storeRes = await storesApi.getMyStore();
        const storeData =
          extractArray(storeRes)[0] || storeRes?.data?.data || storeRes?.data;

        if (!storeData?.id) {
          setLoading(false);
          return;
        }

        setStoreId(storeData.id);

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

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama?.replace(" - ", " ").toLowerCase().includes(search.toLowerCase()),
  );

  const topProducts = summary?.produkTerlaris ?? [];
  const margin = summary?.rataRataMargin ?? 0;
  const trendData = summary?.trendKeuntungan ?? [];

  // If there's only 1 data point, add a dummy starting point so the line/area draws from 0
  const displayTrendData =
    trendData.length === 1
      ? [{ periode: "", keuntungan: 0, penjualan: 0 }, trendData[0]]
      : trendData;

  const summaryCards: SummaryCardProps[] = [
    {
      label: "Total keuntungan",
      value: fmtCompact(summary?.totalKeuntungan ?? 0),
      sub: "Keuntungan bersih (FIFO)",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      label: "Total penjualan",
      value: fmtCompact(summary?.totalPenjualan ?? 0),
      sub: "Gross revenue toko",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total modal",
      value: fmtCompact(summary?.totalHargaBeli ?? 0),
      sub: "Harga beli (FIFO)",
      icon: ShoppingBag,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      label: "Rata-rata margin",
      value: `${margin.toFixed(1)}%`,
      sub: margin >= 20 ? "Margin sehat" : "Perlu dioptimalkan",
      icon: Percent,
      iconBg: margin >= 20 ? "bg-emerald-50" : "bg-orange-50",
      iconColor: margin >= 20 ? "text-emerald-600" : "text-orange-500",
      valueColor: margin >= 20 ? "text-emerald-700" : "text-orange-600",
    },
  ];

  // Map all products to include profit data, then filter by search and sort by profit
  const filteredTopProducts = products
    .map((p) => {
      const profitData = topProducts.find((tp) => tp.produkId === p.id);
      return {
        produkId: p.id,
        namaProduk: p.nama,
        totalKeuntungan: profitData?.totalKeuntungan || 0,
        totalTerjual: profitData?.totalTerjual || 0,
      };
    })
    .filter((p) => p.namaProduk.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.totalKeuntungan - a.totalKeuntungan);

  const handlePrint = () => {
    window.print();
  };

  const getPeriodText = () => {
    switch (dateFilterType) {
      case "all":
        return "Semua Waktu";
      case "week":
        return "Minggu Ini";
      case "month":
        return "Bulan Ini";
      case "year":
        return "Tahun Ini";
      case "month-picker":
        return `${["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][selectedMonth]} ${selectedYear}`;
      case "custom":
        return `${customStartDate || "-"} s/d ${customEndDate || "-"}`;
      default:
        return "-";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 print:p-0 print:m-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { margin: 1cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          div[id*="react-query"], div[class*="react-query"], iframe { display: none !important; }
        }
      `,
        }}
      />

      {/* ── DASHBOARD UI (Hidden on Print) ── */}
      <div className="space-y-4 print:hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <TrendingUp className="text-emerald-600" size={20} />
              Laporan keuntungan
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Ringkasan finansial toko dan keuntungan per produk (metode FIFO)
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors active:scale-95 border border-emerald-100"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Download Laporan</span>
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">
              Filter Waktu:
            </span>
          </div>
          <SegmentedControl
            value={dateFilterType}
            onChange={(val) => setDateFilterType(val as any)}
            options={[
              { label: "Semua", value: "all" },
              { label: "Minggu Ini", value: "week" },
              { label: "Bulan Ini", value: "month" },
              { label: "Tahun Ini", value: "year" },
              { label: "Pilih Bulan", value: "month-picker" },
              { label: "Custom", value: "custom" },
            ]}
          />
          <div className="ml-auto">
            {dateFilterType === "month-picker" && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                >
                  {[
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ].map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {dateFilterType === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">
            Ringkasan keseluruhan toko
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                {...card}
                loading={summaryLoading}
              />
            ))}
          </div>
        </div>

        {/* ── Visualisasi Tren Keuntungan & Top Produk ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grafik Tren Keuntungan (2 Kolom) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 size={16} className="text-emerald-600" />
                    Tren keuntungan
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Grafik pergerakan keuntungan & penjualan
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <SegmentedControl
                    value={chartMetric}
                    onChange={(val) => setChartMetric(val as ChartMetric)}
                    options={[
                      { label: "Keuntungan", value: "keuntungan" },
                      { label: "Semua", value: "both" },
                    ]}
                  />
                  <SegmentedControl
                    value={chartType}
                    onChange={(val) => setChartType(val as ChartType)}
                    options={[
                      { label: "Area", value: "area" },
                      { label: "Bar", value: "bar" },
                    ]}
                  />
                </div>
              </div>

              {/* Area Chart Container */}
              {summaryLoading ? (
                <div className="flex items-center justify-center h-60">
                  <Loader2
                    size={24}
                    className="animate-spin text-emerald-500"
                  />
                </div>
              ) : trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400 text-xs">
                  <BarChart3 className="w-8 h-8 text-gray-200 mb-2" />
                  Belum ada data tren keuntungan.
                </div>
              ) : (
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                      <AreaChart
                        data={displayTrendData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gradProfit"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradSales"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="periode"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => fmtCompact(v)}
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          width={65}
                        />
                        <Tooltip content={<ProfitTooltip />} />
                        {chartMetric === "both" && (
                          <Area
                            type="monotone"
                            dataKey="penjualan"
                            name="penjualan"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#gradSales)"
                            dot={
                              trendData.length === 1
                                ? {
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "#fff",
                                    stroke: "#3b82f6",
                                  }
                                : { r: 2.5, fill: "#3b82f6" }
                            }
                            activeDot={{ r: 4.5 }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="keuntungan"
                          name="keuntungan"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#gradProfit)"
                          dot={
                            trendData.length === 1
                              ? {
                                  r: 4,
                                  strokeWidth: 2,
                                  fill: "#fff",
                                  stroke: "#10b981",
                                }
                              : { r: 3, fill: "#10b981" }
                          }
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={displayTrendData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={4}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="periode"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => fmtCompact(v)}
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          width={65}
                        />
                        <Tooltip content={<ProfitTooltip />} />
                        {chartMetric === "both" && (
                          <Bar
                            dataKey="penjualan"
                            name="penjualan"
                            fill="#93c5fd"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={36}
                          />
                        )}
                        <Bar
                          dataKey="keuntungan"
                          name="keuntungan"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{" "}
                Keuntungan
              </span>
              {chartMetric === "both" && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />{" "}
                  Penjualan
                </span>
              )}
              <span className="ml-auto text-[11px] text-gray-400">
                Hover grafik untuk rincian
              </span>
            </div>
          </div>

          {/* Rincian Produk (Merged) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between max-h-[400px]">
            <div className="flex flex-col h-full">
              <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Rincian per produk
                </h2>
                <span className="text-[11px] text-gray-400">
                  klik untuk laporan FIFO
                </span>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                <div className="relative group w-full">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 outline-none transition-all text-gray-700"
                  />
                </div>
              </div>

              <div className="px-4 py-1 overflow-y-auto flex-1 custom-scrollbar">
                {summaryLoading ? (
                  <div className="space-y-3 py-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                          <div className="h-2 bg-gray-50 rounded animate-pulse w-1/2" />
                        </div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
                      </div>
                    ))}
                  </div>
                ) : filteredTopProducts.length > 0 ? (
                  filteredTopProducts.map((p, i) => (
                    <TopProductRow
                      key={p.produkId}
                      rank={i + 1}
                      nama={p.namaProduk}
                      keuntungan={p.totalKeuntungan}
                      terjual={p.totalTerjual}
                      onClick={() =>
                        router.push(`/seller/laporan/produk/${p.produkId}`)
                      }
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Package className="w-10 h-10 text-gray-200 mb-2" />
                    <p className="text-gray-500 font-medium text-xs">
                      Tidak ada data
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {search
                        ? `Pencarian "${search}" tidak ditemukan.`
                        : "Belum ada produk terjual pada periode ini."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── END DASHBOARD UI ── */}
      </div>

      {/* ── PRINT LAYOUT (Hidden on Screen, Visible on Print) ── */}
      <div className="hidden print:block bg-white text-black font-sans p-8">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Laporan Laba Rugi
          </h1>
          <h2 className="text-lg font-semibold mt-1">
            Toko Koperasi Agro Jabar
          </h2>
          <p className="text-sm mt-1">Periode: {getPeriodText()}</p>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
          <tbody>
            <tr>
              <td className="py-2 font-bold" colSpan={2}>
                PENDAPATAN
              </td>
            </tr>
            <tr>
              <td className="py-2 pl-4">Total Penjualan Kotor</td>
              <td className="py-2 text-right">
                {fmtRpFull(summary?.totalPenjualan ?? 0)}
              </td>
            </tr>
            <tr>
              <td className="py-2 font-bold" colSpan={2}>
                HARGA POKOK PENJUALAN (HPP)
              </td>
            </tr>
            <tr>
              <td className="py-2 pl-4">
                Total Modal / Harga Beli (Metode FIFO)
              </td>
              <td className="py-2 text-right border-b border-black">
                ({fmtRpFull(summary?.totalHargaBeli ?? 0)})
              </td>
            </tr>
            <tr className="font-bold text-base">
              <td className="py-3">LABA BERSIH</td>
              <td className="py-3 text-right">
                {fmtRpFull(summary?.totalKeuntungan ?? 0)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8">
          <h3 className="font-bold mb-3 border-b border-gray-300 pb-1">
            Rincian Keuntungan per Produk
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-left font-bold w-12">No</th>
                <th className="py-2 text-left font-bold">Nama Produk</th>
                <th className="py-2 text-right font-bold">Terjual (kg)</th>
                <th className="py-2 text-right font-bold">Keuntungan</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopProducts
                .filter((p) => p.totalTerjual > 0)
                .map((p, i) => (
                  <tr key={p.produkId} className="border-b border-gray-200">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">{p.namaProduk}</td>
                    <td className="py-2 text-right">
                      {p.totalTerjual.toFixed(1)}
                    </td>
                    <td className="py-2 text-right">
                      {fmtRpFull(p.totalKeuntungan)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h3 className="font-bold mb-3 border-b border-gray-300 pb-1">
            Detail Keuntungan per Tanggal
          </h3>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-left font-bold w-12">No</th>
                <th className="py-2 text-left font-bold">Tanggal</th>
                <th className="py-2 text-left font-bold">Produk</th>
                <th className="py-2 text-right font-bold">Terjual</th>
                <th className="py-2 text-right font-bold">Keuntungan</th>
              </tr>
            </thead>
            <tbody>
              {summary?.transaksiDetail?.length ? (
                summary.transaksiDetail.map((t, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">
                      {format(new Date(t.tanggal), "dd MMM yyyy")}
                    </td>
                    <td className="py-2">{t.namaProduk}</td>
                    <td className="py-2 text-right">
                      {t.jumlahTerjual.toFixed(1)} kg
                    </td>
                    <td className="py-2 text-right">
                      {fmtRpFull(t.keuntungan)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-16 flex justify-end break-inside-avoid">
          <div className="text-center">
            <p className="mb-16">Pencetak / Admin,</p>
            <p className="font-bold border-b border-black w-48">
              ( ........................................ )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
