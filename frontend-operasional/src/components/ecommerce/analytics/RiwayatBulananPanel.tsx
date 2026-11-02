"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { useRiwayatTerlaris } from "@/hooks/analytics/useProdukTerlaris";

import KategoriTerlarisCard from "./KategoriTerlarisCard";

const BULAN_ID = [
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
];

export default function RiwayatBulananPanel({ tokoId }: { tokoId?: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, isError } = useRiwayatTerlaris(
    { month, year, tokoId, limit: 5 },
    true,
  );

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const goNext = () => {
    const isCurrentMonth =
      month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Riwayat Bulanan</h2>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
          <button
            onClick={goPrev}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>

          <div className="px-3 py-1 text-sm font-semibold text-gray-800 min-w-[130px] text-center">
            {BULAN_ID[month - 1]} {year}
          </div>

          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className={`p-1.5 rounded-lg transition-all ${
              isCurrentMonth
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-white hover:shadow-sm"
            }`}
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Comparison badge */}
      {data && (
        <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <TrendingUp size={15} className="text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Menampilkan data <strong>{data.period.label}</strong> — dibandingkan
            dengan{" "}
            <span className="text-blue-500">{data.prevPeriod.label}</span>
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-10 text-red-500 text-sm">
          Gagal memuat data riwayat. Coba lagi.
        </div>
      )}

      {/* Data */}
      {data &&
        !isLoading &&
        (data.data.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-gray-100">
            Tidak ada data penjualan untuk {BULAN_ID[month - 1]} {year}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.data.map((kategoriData) => (
              <KategoriTerlarisCard
                key={kategoriData.kategori.id}
                data={kategoriData}
                showTrend={true}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
