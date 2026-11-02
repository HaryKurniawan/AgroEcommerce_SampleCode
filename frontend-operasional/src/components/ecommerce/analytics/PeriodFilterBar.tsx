"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type PeriodOption = {
  value: string;
  label: string;
  short: string;
};

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "TODAY", label: "Hari Ini", short: "Hari Ini" },
  { value: "WEEK", label: "7 Hari Terakhir", short: "7 Hari" },
  { value: "MONTH", label: "Bulan Ini", short: "Bulan Ini" },
  { value: "LAST_MONTH", label: "Bulan Lalu", short: "Bln Lalu" },
  { value: "3_MONTHS", label: "3 Bulan Terakhir", short: "3 Bulan" },
  { value: "YEAR", label: "Tahun Ini", short: "Tahun Ini" },
  { value: "CUSTOM", label: "Kustom", short: "Kustom" },
];

interface PeriodFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (v: string) => void;
  onEndDateChange?: (v: string) => void;
  className?: string;
}

export default function PeriodFilterBar({
  value,
  onChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
}: PeriodFilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${
              value === opt.value
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
            }
          `}
        >
          {opt.short}
        </button>
      ))}

      {/* Custom date range */}
      {value === "CUSTOM" && (
        <div className="flex items-center gap-2 mt-2 w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <Calendar size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-500 font-medium">Dari</label>
              <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                className="border border-emerald-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <span className="text-gray-400 mt-4">–</span>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-500 font-medium">
                Sampai
              </label>
              <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                className="border border-emerald-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
