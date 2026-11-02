"use client";

import {
  TrendingUp,
  DollarSign,
  Percent,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { ProfitSummary } from "@/types/profit-report";

interface ProfitSummaryCardsProps {
  summary?: ProfitSummary;
  loading?: boolean;
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProfitSummaryCards({
  summary,
  loading,
}: ProfitSummaryCardsProps) {
  const cards = [
    {
      label: "Total Keuntungan",
      value: fmt(summary?.totalKeuntungan ?? 0),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "group-hover:border-emerald-200",
    },
    {
      label: "Total Penjualan",
      value: fmt(summary?.totalPenjualan ?? 0),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "group-hover:border-blue-200",
    },
    {
      label: "Total Harga Beli",
      value: fmt(summary?.totalHargaBeli ?? 0),
      icon: ShoppingCart,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "group-hover:border-slate-200",
    },
    {
      label: "Rata-rata Margin",
      value: `${(summary?.rataRataMargin ?? 0).toFixed(1)}%`,
      icon: Percent,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "group-hover:border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`group bg-white border border-gray-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${border}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-xl ${bg} ${color} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {label}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 size={16} className="animate-spin text-gray-300" />
              <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <p className={`text-2xl font-bold tracking-tight ${color}`}>
              {value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
