"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  Loader2,
  Lightbulb,
  X,
  Package,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import Link from "next/link";

import {
  usePolaPenjualan,
  usePesananHarian,
} from "@/hooks/seller/useSellerTren";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";
import SalesHeatmap from "@/components/ecommerce/analytics/SalesHeatmap";
import SalesCalendar from "@/components/ecommerce/analytics/SalesCalendar";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function DailyOrdersPanel({
  tokoId,
  date,
  isOpen,
  onClose,
}: {
  tokoId: string;
  date: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = usePesananHarian(tokoId, date);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayDate = new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!mounted) return null;

  const pesananList = data?.data || [];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[22rem] bg-white z-[9999] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                Pesanan Harian
              </p>
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {displayDate}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {!isLoading && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-gray-500">
                {pesananList.length} pesanan selesai
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
            </>
          ) : pesananList.length > 0 ? (
            pesananList.map((p: any, index: number) => (
              <div
                key={p?.id_pesanan || p?.id || `pesanan-${index}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-100 transition-colors"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                {/* Order header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wide">
                          #
                          {(p.id_pesanan || p.id)
                            ?.split("-")[0]
                            ?.toUpperCase() || ""}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {p.konsumen?.nama || "Pelanggan"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 shrink-0">
                      {formatRupiah(p.totalHarga)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                {p.item && p.item.length > 0 && (
                  <div className="border-t border-gray-50 px-4 py-3 space-y-2.5">
                    {p.item.map((it: any, itemIndex: number) => (
                      <div
                        key={it?.id || `item-${itemIndex}`}
                        className="flex items-center gap-3"
                      >
                        {/* Product image */}
                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          {it.produk?.gambarUrl ? (
                            <img
                              src={it.produk.gambarUrl}
                              alt={it.produk.nama?.replace(" - ", " ")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={12} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-700 truncate">
                            {it.produk?.nama?.replace(" - ", " ") || "Produk"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {it.jumlah} kg &times; {formatRupiah(it.harga)}
                          </p>
                        </div>
                        {/* Subtotal */}
                        <p className="text-[11px] font-semibold text-gray-600 shrink-0">
                          {formatRupiah(it.jumlah * it.harga)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer CTA */}
                <div className="border-t border-gray-50 px-4 py-2.5">
                  <Link
                    href={`/seller/pesanan/${p.id_pesanan || p.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Lihat Detail Pesanan
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                <Package size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Tidak ada pesanan
              </p>
              <p className="text-[11px] text-gray-400">
                Belum ada pesanan selesai di tanggal ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export default function PolaPenjualanPage() {
  const { store } = useSellerDashboard();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear(),
  );
  const [periodType, setPeriodType] = useState<"YEAR" | "MONTH">("YEAR");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1,
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  const { data, isLoading } = usePolaPenjualan(
    store?.id ?? "",
    selectedYear,
    periodType === "MONTH" ? selectedMonth : undefined,
  );

  const yearsList = [currentDate.getFullYear() - 1, currentDate.getFullYear()];

  // Find peak day & time if data is available
  let peakDay = "";
  let peakTime = "";
  let peakVal = 0;

  if (data?.heatmap && data.heatmap.length > 0) {
    let best = data.heatmap[0];
    data.heatmap.forEach((item) => {
      if (item.jumlahPesanan > best.jumlahPesanan) {
        best = item;
      }
    });

    if (best.jumlahPesanan > 0) {
      peakDay = best.hariLabel;
      const timeLabelMap: Record<string, string> = {
        PAGI: "Pagi (06:00 - 12:00)",
        SIANG: "Siang (12:00 - 17:00)",
        SORE: "Sore (17:00 - 21:00)",
        MALAM: "Malam (21:00 - 06:00)",
      };
      peakTime = timeLabelMap[best.sesi] || best.sesi;
      peakVal = best.jumlahPesanan;
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity size={22} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Pola Penjualan & Sesi Teramai
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* Sidebar Overlay (Render conditionally anywhere) */}
          {selectedDate && (
            <DailyOrdersPanel
              tokoId={store?.id ?? ""}
              date={selectedDate}
              isOpen={isPanelOpen}
              onClose={() => setIsPanelOpen(false)}
            />
          )}

          {/* Top Section: Insights & Session Def */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Rekomendasi Pola */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {peakVal > 0 ? (
                <div className="flex flex-col gap-4">
                  {/* Top row: label + peak info */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Waktu Pembelian Tersibuk
                      </p>
                      <p className="text-xl font-bold text-gray-900 leading-tight">
                        Hari {peakDay}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-sm text-emerald-600 font-medium">
                          {peakTime}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 bg-emerald-50 rounded-xl p-2.5">
                      <Lightbulb size={18} className="text-emerald-500" />
                    </div>
                  </div>

                  {/* Recommendation text */}
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Lakukan restok sebelum hari{" "}
                      <span className="font-semibold text-gray-700">
                        {peakDay}
                      </span>{" "}
                      pagi. Pastikan kurir & admin standby pada sesi{" "}
                      <span className="font-semibold text-gray-700">
                        {peakTime?.split(" ")[0] || ""}
                      </span>{" "}
                      karena volume pesanan tertinggi terjadi di waktu ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 py-1">
                  <div className="shrink-0 bg-gray-50 rounded-xl p-2.5">
                    <Lightbulb size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      Rekomendasi Pola
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Data pesanan belum mencukupi untuk memetakan sesi belanja
                      teramai. Lakukan lebih banyak transaksi untuk melihat
                      insight.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Definisi Sesi Waktu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Sesi Waktu
              </p>
              <div className="space-y-2">
                {[
                  {
                    icon: <Sunrise size={13} className="text-amber-400" />,
                    label: "Pagi",
                    time: "06:00 – 12:00",
                  },
                  {
                    icon: <Sun size={13} className="text-orange-400" />,
                    label: "Siang",
                    time: "12:00 – 17:00",
                  },
                  {
                    icon: <Sunset size={13} className="text-rose-400" />,
                    label: "Sore",
                    time: "17:00 – 21:00",
                  },
                  {
                    icon: <Moon size={13} className="text-indigo-400" />,
                    label: "Malam",
                    time: "21:00 – 06:00",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <span className="text-xs font-semibold text-gray-700">
                        {s.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {s.time} WIB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Kalender Transaksi{" "}
                  {periodType === "MONTH" ? "Bulanan" : "Tahunan"}
                </h2>
                <p className="text-xs text-gray-400">
                  Distribusi pesanan harian berdasarkan kalender
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={periodType}
                  onChange={(e) =>
                    setPeriodType(e.target.value as "YEAR" | "MONTH")
                  }
                  className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="MONTH">Per Bulan</option>
                  <option value="YEAR">Per Tahun</option>
                </select>

                {periodType === "MONTH" && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {[
                      { value: 1, label: "Januari" },
                      { value: 2, label: "Februari" },
                      { value: 3, label: "Maret" },
                      { value: 4, label: "April" },
                      { value: 5, label: "Mei" },
                      { value: 6, label: "Juni" },
                      { value: 7, label: "Juli" },
                      { value: 8, label: "Agustus" },
                      { value: 9, label: "September" },
                      { value: 10, label: "Oktober" },
                      { value: 11, label: "November" },
                      { value: 12, label: "Desember" },
                    ].map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {data && data.kalender && data.kalender.length > 0 ? (
              <SalesCalendar
                kalender={data.kalender}
                totalPesanan={data.totalPesanan}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
              />
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Tidak ada data transaksi di tahun {selectedYear}.
              </div>
            )}
          </div>

          {/* Heatmap Section — separate card, same filter as calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Peta Sebaran Waktu Belanja
                </h2>
                <p className="text-xs text-gray-400">
                  Intensitas pesanan berdasarkan hari dan sesi waktu
                </p>
              </div>
              {/* Badge showing active filter — synced with calendar above */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  {periodType === "MONTH"
                    ? `${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][selectedMonth - 1]} ${selectedYear}`
                    : `Tahun ${selectedYear}`}
                </span>
              </div>
            </div>
            {data && data.heatmap && data.heatmap.length > 0 ? (
              <SalesHeatmap
                heatmap={data.heatmap}
                totalPesanan={data.totalPesanan}
              />
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Tidak ada data heatmap di{" "}
                {periodType === "MONTH" ? `bulan ini` : `tahun ${selectedYear}`}
                .
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
