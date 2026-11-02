"use client";

import React from "react";

import type { TrenBulananItem } from "@/lib/api/analytics";

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

interface TrenBarChartProps {
  data: TrenBulananItem[];
  mode?: "revenue" | "qty";
}

export default function TrenBarChart({
  data,
  mode = "revenue",
}: TrenBarChartProps) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) =>
    mode === "revenue" ? d.totalRevenue : d.totalQty,
  );
  const maxVal = Math.max(...values, 1);

  return (
    <div className="w-full">
      {/* Bar chart */}
      <div className="flex items-end gap-2 h-44 px-1">
        {data.map((item, idx) => {
          const val = mode === "revenue" ? item.totalRevenue : item.totalQty;
          const growth =
            mode === "revenue"
              ? item.growthRevenuePersen
              : item.growthQtyPersen;
          const heightPct = Math.max(4, (val / maxVal) * 100);
          const isLast = idx === data.length - 1;
          const isPositive = growth !== null && growth > 0;
          const isNegative = growth !== null && growth < 0;

          return (
            <div
              key={item.bulan ?? idx}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="font-normal">{item.labelBulan}</div>
                <div>
                  {mode === "revenue"
                    ? `Rp ${formatRupiah(val)}`
                    : `${val.toFixed(1)} kg`}
                </div>
                {growth !== null && (
                  <div
                    className={
                      isPositive
                        ? "text-primary-300"
                        : isNegative
                          ? "text-red-400"
                          : "text-slate-400"
                    }
                  >
                    {isPositive ? "+" : ""}
                    {growth}% vs bln lalu
                  </div>
                )}
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-500 relative overflow-hidden ${
                  isLast
                    ? "bg-primary-600"
                    : isPositive
                      ? "bg-primary-400"
                      : isNegative
                        ? "bg-red-300"
                        : "bg-slate-200"
                }`}
                style={{ height: `${heightPct}%` }}
              >
                {isLast && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 px-1 mt-1">
        {data.map((item, idx) => {
          const label = item.labelBulan ?? item.bulan ?? "";
          const parts = label.split(" ");
          return (
            <div key={item.bulan ?? idx} className="flex-1 text-center">
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {parts[0] ?? ""}
              </p>
              <p className="text-[10px] text-slate-300">{parts[1] ?? ""}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-normal">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-primary-600 inline-block" />{" "}
          Bulan ini
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-primary-400 inline-block" />{" "}
          Naik
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-300 inline-block" /> Turun
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />{" "}
          Stabil
        </span>
      </div>
    </div>
  );
}
