"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
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

import { useTrenBulanan } from "@/hooks/seller/useSellerTren";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

function fmtRpFull(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-4 text-xs min-w-[160px]">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.name}
          className="flex items-center justify-between gap-4 mt-1"
        >
          <span className="flex items-center gap-1.5 text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            {p.name === "totalRevenue" ? "Revenue" : "Qty (kg)"}
          </span>
          <span className="font-semibold text-gray-800">
            {p.name === "totalRevenue" ? fmtRpFull(p.value) : `${p.value} kg`}
          </span>
        </div>
      ))}
      {payload[0]?.payload?.growthRevenuePersen !== null &&
        payload[0]?.payload?.growthRevenuePersen !== undefined && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span
              className={`text-[11px] font-medium ${
                payload[0].payload.growthRevenuePersen > 0
                  ? "text-emerald-600"
                  : payload[0].payload.growthRevenuePersen < 0
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
            >
              {payload[0].payload.growthRevenuePersen > 0 ? "+" : ""}
              {payload[0].payload.growthRevenuePersen}% vs bln lalu
            </span>
          </div>
        )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Mode = "revenue" | "qty" | "both";
type ChartType = "area" | "bar";

export default function SellerTrenPage() {
  const { store, loading: storeLoading } = useSellerDashboard();
  const [chartType, setChartType] = useState<ChartType>("area");
  const [mode, setMode] = useState<Mode>("revenue");
  const [bulanKe, setBulanKe] = useState<number>(6);

  const { data, isLoading } = useTrenBulanan(store?.id ?? "", bulanKe);

  const isLoading_ = storeLoading || (!!store?.id && isLoading);

  const chartData = (data?.data ?? []).map((d) => {
    const parts = (d.labelBulan ?? "").split(" ");
    return {
      ...d,
      labelShort:
        (parts[0]?.slice(0, 3) ?? "") + " " + (parts[1]?.slice(2) ?? ""),
    };
  });

  const bestMonth = data?.summary?.bulanTerbaik;
  const totalRevenue = chartData.reduce((s, d) => s + d.totalRevenue, 0);
  const totalQty = chartData.reduce((s, d) => s + d.totalQty, 0);
  const avgRevenue = chartData.length ? totalRevenue / chartData.length : 0;
  const nonZeroMonths = chartData.filter((d) => d.jumlahTransaksi > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={24} className="text-emerald-600" />
          <h1 className="text-3xl font-medium text-slate-800">
            Tren Penjualan
          </h1>
        </div>
        <p className="text-slate-500 text-sm">Histori penjualan per bulan</p>
      </div>

      {isLoading_ ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* ── Summary stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: fmtRpFull(totalRevenue),
                sub: `${nonZeroMonths.length} bulan aktif`,
                color: "text-slate-800",
              },
              {
                label: "Rata-rata / Bulan",
                value: fmtRp(avgRevenue),
                sub: "Rata-rata revenue",
                color: "text-slate-800",
              },
              {
                label: "Total Qty Terjual",
                value: `${totalQty.toFixed(1)} kg`,
                sub: "Seluruh periode",
                color: "text-slate-800",
              },
              {
                label: "Bulan Terbaik",
                value: bestMonth?.labelBulan ?? "-",
                sub: bestMonth ? fmtRp(bestMonth.totalRevenue) : "-",
                color: "text-slate-800",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {s.label}
                </p>
                <p className={`text-xl font-bold ${s.color} leading-tight`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Chart Card ── */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-medium text-slate-800">
                  Visualisasi Tren
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                {/* Periode */}
                <SegmentedControl
                  value={String(bulanKe)}
                  onChange={(val) => setBulanKe(Number(val))}
                  options={[
                    { label: "3 Bln", value: "3" },
                    { label: "6 Bln", value: "6" },
                    { label: "12 Bln", value: "12" },
                  ]}
                />

                {/* Metrik */}
                <SegmentedControl
                  value={mode}
                  onChange={(val) => setMode(val as Mode)}
                  options={[
                    { label: "Revenue", value: "revenue" },
                    { label: "Qty (kg)", value: "qty" },
                    { label: "Keduanya", value: "both" },
                  ]}
                />

                {/* Tipe chart */}
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

            {/* Chart */}
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Tidak ada data tren penjualan.
              </div>
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradRevenue"
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
                          id="gradQty"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="labelShort"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="revenue"
                        hide={mode === "qty"}
                        tickFormatter={(v) => fmtRp(v)}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <YAxis
                        yAxisId="qty"
                        orientation="right"
                        hide={mode === "revenue"}
                        tickFormatter={(v) => `${v}kg`}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                      />
                      <Tooltip content={<RevenueTooltip />} />
                      {mode !== "qty" && (
                        <Area
                          yAxisId="revenue"
                          type="monotone"
                          dataKey="totalRevenue"
                          name="totalRevenue"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#gradRevenue)"
                          dot={{ r: 3, fill: "#10b981" }}
                          activeDot={{ r: 5 }}
                        />
                      )}
                      {mode !== "revenue" && (
                        <Area
                          yAxisId="qty"
                          type="monotone"
                          dataKey="totalQty"
                          name="totalQty"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#gradQty)"
                          dot={{ r: 3, fill: "#6366f1" }}
                          activeDot={{ r: 5 }}
                        />
                      )}
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="labelShort"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="revenue"
                        hide={mode === "qty"}
                        tickFormatter={(v) => fmtRp(v)}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <YAxis
                        yAxisId="qty"
                        orientation="right"
                        hide={mode === "revenue"}
                        tickFormatter={(v) => `${v}kg`}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                      />
                      <Tooltip content={<RevenueTooltip />} />
                      {mode !== "qty" && (
                        <Bar
                          yAxisId="revenue"
                          dataKey="totalRevenue"
                          name="totalRevenue"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      )}
                      {mode !== "revenue" && (
                        <Bar
                          yAxisId="qty"
                          dataKey="totalQty"
                          name="totalQty"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      )}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart legend */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-50">
              {mode !== "qty" && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />{" "}
                  Revenue
                </span>
              )}
              {mode !== "revenue" && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />{" "}
                  Qty (kg)
                </span>
              )}
              <span className="ml-auto text-[11px] text-gray-400">
                Hover bar/titik untuk detail
              </span>
            </div>
          </div>

          {/* ── Growth highlight cards ── */}
          {nonZeroMonths.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData
                .filter((d) => d.growthRevenuePersen !== null)
                .slice(-Math.min(bulanKe, 6))
                .map((d) => {
                  const isUp = (d.growthRevenuePersen ?? 0) > 0;
                  const isDown = (d.growthRevenuePersen ?? 0) < 0;
                  return (
                    <div
                      key={d.bulan}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isUp
                            ? "bg-emerald-100 text-emerald-600"
                            : isDown
                              ? "bg-red-100 text-red-500"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp size={18} />
                        ) : isDown ? (
                          <TrendingDown size={18} />
                        ) : (
                          <Minus size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {d.labelBulan}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {fmtRpFull(d.totalRevenue)}
                        </p>
                        <p
                          className={`text-xs font-semibold mt-0.5 ${isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-gray-400"}`}
                        >
                          {isUp ? "+" : ""}
                          {d.growthRevenuePersen}% vs bln lalu
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── Tabel rincian ── */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <h2 className="text-lg font-medium text-slate-800">
                Tabel Rincian Bulanan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 text-left font-medium">Bulan</th>
                    <th className="py-3 px-5 text-right font-medium">
                      Revenue
                    </th>
                    <th className="py-3 px-5 text-right font-medium">MoM</th>
                    <th className="py-3 px-5 text-right font-medium">
                      Qty Terjual
                    </th>
                    <th className="py-3 px-5 text-right font-medium">
                      MoM Qty
                    </th>
                    <th className="py-3 px-5 text-right font-medium">
                      Transaksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {chartData.map((item, idx) => {
                    const revUp = (item.growthRevenuePersen ?? 0) > 0;
                    const revDown = (item.growthRevenuePersen ?? 0) < 0;
                    const qtyUp = (item.growthQtyPersen ?? 0) > 0;
                    const qtyDown = (item.growthQtyPersen ?? 0) < 0;
                    return (
                      <tr
                        key={item.bulan ?? idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-5 font-medium text-gray-900">
                          {item.labelBulan}
                        </td>
                        <td className="py-3 px-5 text-right font-semibold text-gray-900">
                          {fmtRpFull(item.totalRevenue)}
                        </td>
                        <td className="py-3 px-5 text-right">
                          {item.growthRevenuePersen !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                revUp
                                  ? "bg-emerald-50 text-emerald-700"
                                  : revDown
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-400"
                              }`}
                            >
                              {revUp ? (
                                <TrendingUp size={10} />
                              ) : revDown ? (
                                <TrendingDown size={10} />
                              ) : (
                                <Minus size={10} />
                              )}
                              {revUp ? "+" : ""}
                              {item.growthRevenuePersen}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right text-gray-700">
                          {(item.totalQty ?? 0).toFixed(1)} kg
                        </td>
                        <td className="py-3 px-5 text-right">
                          {item.growthQtyPersen !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                qtyUp
                                  ? "bg-emerald-50 text-emerald-700"
                                  : qtyDown
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-400"
                              }`}
                            >
                              {qtyUp ? (
                                <TrendingUp size={10} />
                              ) : qtyDown ? (
                                <TrendingDown size={10} />
                              ) : (
                                <Minus size={10} />
                              )}
                              {qtyUp ? "+" : ""}
                              {item.growthQtyPersen}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right text-gray-500">
                          {item.jumlahTransaksi} pesanan
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
