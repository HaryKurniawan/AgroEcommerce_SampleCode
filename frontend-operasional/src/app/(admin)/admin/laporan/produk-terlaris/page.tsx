"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  BarChart2,
  Zap,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTrenProdukBulanan } from "@/hooks/seller/useSellerTren";
import { storesApi } from "@/lib/ecommerce-api";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const MONTHS_LIST = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Okt" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

function CustomSelect({
  value,
  onChange,
  options,
  minWidth = "140px",
}: {
  value: any;
  onChange: (val: any) => void;
  options: { value: any; label: string }[];
  minWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref} style={{ minWidth }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border shadow-sm rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer ${isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"}`}
      >
        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === opt.value ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminProdukTerlarisPage() {
  const router = useRouter();
  const currentDate = new Date();

  const [selectedTokoId, setSelectedTokoId] = useState<string>("");
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    storesApi.adminGetAll({ limit: 100 }).then((res) => {
      const raw = res?.data?.data || res?.data || [];
      const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
      if (Array.isArray(arr)) setStores(arr);
    });
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear(),
  );

  const [periodType, setPeriodType] = useState<
    "WEEK" | "MONTH" | "SIX_MONTHS" | "YEAR"
  >("MONTH");

  const { data: topProductsData, isLoading: isTopLoading } =
    useTrenProdukBulanan(
      selectedTokoId,
      selectedMonth,
      selectedYear,
      100, // Menampilkan semua (atau setidaknya 100 teratas)
      periodType,
    );

  const yearsList = [currentDate.getFullYear() - 1, currentDate.getFullYear()];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-emerald-600" /> Peringkat
            Produk Terlaris
          </h1>
        </div>
        <div>
          <CustomSelect
            value={selectedTokoId}
            onChange={(val) => setSelectedTokoId(val)}
            minWidth="220px"
            options={[
              { value: "", label: "Semua Toko (Global)" },
              ...stores.map((s) => ({ value: s.id, label: s.nama })),
            ]}
          />
        </div>
      </div>

      {/* Section 2: Top Products Monthly Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
          <div>
            <h2 className="text-base font-medium text-slate-800 flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-600" /> Peringkat
              Seluruh Produk{" "}
              {periodType === "WEEK"
                ? "Mingguan"
                : periodType === "MONTH"
                  ? "Bulanan"
                  : periodType === "SIX_MONTHS"
                    ? "Per 6 Bulan"
                    : "Tahunan"}
            </h2>
            <p className="text-xs text-gray-400">
              Daftar produk paling laku berdasarkan kuantitas penjualan{" "}
              {periodType === "WEEK"
                ? "7 hari terakhir"
                : periodType === "MONTH"
                  ? "bulanan"
                  : periodType === "SIX_MONTHS"
                    ? "6 bulan terakhir"
                    : "tahunan"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CustomSelect
              value={periodType}
              onChange={(val) => setPeriodType(val as any)}
              minWidth="160px"
              options={[
                { value: "WEEK", label: "7 Hari Terakhir" },
                { value: "MONTH", label: "Per Bulan" },
                { value: "SIX_MONTHS", label: "6 Bulan Terakhir" },
                { value: "YEAR", label: "Per Tahun" },
              ]}
            />

            {periodType === "MONTH" && (
              <>
                <CustomSelect
                  value={selectedMonth}
                  onChange={(val) => setSelectedMonth(Number(val))}
                  minWidth="130px"
                  options={MONTHS_LIST}
                />

                <CustomSelect
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(Number(val))}
                  minWidth="110px"
                  options={yearsList.map((y) => ({
                    value: y,
                    label: String(y),
                  }))}
                />
              </>
            )}

            {periodType === "YEAR" && (
              <CustomSelect
                value={selectedYear}
                onChange={(val) => setSelectedYear(Number(val))}
                minWidth="110px"
                options={yearsList.map((y) => ({ value: y, label: String(y) }))}
              />
            )}
          </div>
        </div>

        {isTopLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
          </div>
        ) : topProductsData &&
          topProductsData.data &&
          topProductsData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Jumlah Transaksi</th>
                  <th className="py-3 px-4 text-center">
                    Tren vs{" "}
                    {periodType === "WEEK"
                      ? "Minggu Lalu"
                      : periodType === "MONTH"
                        ? "Bulan Lalu"
                        : periodType === "SIX_MONTHS"
                          ? "6 Bulan Lalu"
                          : "Tahun Lalu"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 text-sm">
                {topProductsData.data.map((item) => {
                  const hasTrend =
                    item.trendPersen !== null && item.trendPersen !== undefined;
                  const isUp = hasTrend && item.trendPersen > 0;
                  const isDown = hasTrend && item.trendPersen < 0;

                  return (
                    <tr
                      key={item.produk.id}
                      onClick={() =>
                        router.push(`/seller/laporan/produk/${item.produk.id}`)
                      }
                      className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 text-center font-bold text-gray-400 group-hover:text-emerald-500 transition-colors">
                        {item.rank === 1
                          ? "🥇"
                          : item.rank === 2
                            ? "🥈"
                            : item.rank === 3
                              ? "🥉"
                              : String(item.rank).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100/50 group-hover:border-emerald-100 transition-colors">
                            {item.produk.gambarUrl ? (
                              <img
                                src={item.produk.gambarUrl}
                                alt={item.produk.nama?.replace(" - ", " ")}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={14} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm group-hover:text-emerald-700 transition-colors">
                              {item.produk.nama?.replace(" - ", " ")}
                            </p>
                            {item.produk.kategori && (
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">
                                {item.produk.kategori.nama}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-gray-800">
                          {(item.jumlahTerjual || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          {item.produk.satuan || "kg"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-600">
                        {formatRupiah(item.totalRevenue || 0)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center justify-center bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                          {item.jumlahTransaksi || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {hasTrend ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                              isUp
                                ? "bg-emerald-50 text-emerald-600"
                                : isDown
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {isUp ? (
                              <TrendingUp size={12} strokeWidth={2.5} />
                            ) : isDown ? (
                              <TrendingDown size={12} strokeWidth={2.5} />
                            ) : (
                              <Minus size={12} strokeWidth={2.5} />
                            )}
                            {isUp ? "+" : ""}
                            {item.trendPersen}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            Tidak ada data penjualan produk untuk periode{" "}
            {periodType === "WEEK"
              ? "7 hari terakhir"
              : periodType === "MONTH"
                ? `${MONTHS_LIST.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
                : periodType === "SIX_MONTHS"
                  ? "6 bulan terakhir"
                  : `Tahun ${selectedYear}`}
            .
          </div>
        )}
      </div>
    </div>
  );
}
