"use client";

import type { ProfitReportFilters } from "@/lib/api/profit-report";

interface ProfitReportFiltersProps {
  filters: ProfitReportFilters;
  onFiltersChange: (filters: ProfitReportFilters) => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Menunggu Konfirmasi", value: "MENUNGGU_KONFIRMASI_SELLER" },
  { label: "Menunggu Bayar", value: "MENUNGGU_BAYAR" },
  { label: "Diproses", value: "DIPROSES" },
  { label: "Dikirim", value: "DIKIRIM" },
  { label: "Selesai", value: "SELESAI" },
  { label: "Dibatalkan", value: "DIBATALKAN" },
];

export function ProfitReportFilters({
  filters,
  onFiltersChange,
  loading,
}: ProfitReportFiltersProps) {
  const inputCls = `w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-700
    focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all
    disabled:opacity-50 disabled:bg-gray-50/50 hover:border-gray-300`;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[150px] max-w-[200px]">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Dari Tanggal
        </label>
        <input
          type="date"
          disabled={loading}
          value={filters.startDate ? filters.startDate.split("T")[0] : ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              startDate: e.target.value || undefined,
              page: 1,
            })
          }
          className={inputCls}
        />
      </div>
      <div className="flex-1 min-w-[150px] max-w-[200px]">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Sampai Tanggal
        </label>
        <input
          type="date"
          disabled={loading}
          value={filters.endDate ? filters.endDate.split("T")[0] : ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              endDate: e.target.value || undefined,
              page: 1,
            })
          }
          className={inputCls}
        />
      </div>
      <div className="flex-1 min-w-[150px] max-w-[220px]">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Status Pesanan
        </label>
        <select
          disabled={loading}
          value={filters.status || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value || undefined,
              page: 1,
            })
          }
          className={inputCls}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        disabled={loading}
        onClick={() => onFiltersChange({ page: 1, limit: filters.limit ?? 20 })}
        className="px-5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors disabled:opacity-50 active:scale-95 border border-slate-200"
      >
        Reset Filter
      </button>
    </div>
  );
}
