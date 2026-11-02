"use client";

import React from "react";
import { Package, Clock, TrendingUp, TrendingDown } from "lucide-react";

import { StockLog, ProductItem } from "./types";

interface StockHistoryTableProps {
  product: ProductItem;
  filteredLogs: StockLog[];
  historyTab: "masuk" | "keluar";
  setHistoryTab: (tab: "masuk" | "keluar") => void;
}

export function StockHistoryTable({
  product,
  filteredLogs,
  historyTab,
  setHistoryTab,
}: StockHistoryTableProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-slate-100/50 self-start sm:self-auto w-max">
        <button
          type="button"
          onClick={() => setHistoryTab("masuk")}
          className={`flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            historyTab === "masuk"
              ? "bg-white text-emerald-600 shadow-sm border border-slate-100/30"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <TrendingUp size={11} />
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setHistoryTab("keluar")}
          className={`flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            historyTab === "keluar"
              ? "bg-white text-rose-600 shadow-sm border border-rose-100"
              : "text-gray-500 hover:text-rose-600"
          }`}
        >
          <TrendingDown size={11} />
          Keluar
        </button>
      </div>

      {/* Timeline Feed / Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-14 space-y-2">
          <Clock className="w-8 h-8 text-slate-200 mx-auto" />
          <p className="text-[11px] text-slate-400 font-medium">
            Tidak ada mutasi{" "}
            {historyTab === "masuk" ? "stok masuk" : "stok keluar"} untuk produk
            ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="p-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Tipe Mutasi
                  </th>
                  <th className="p-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Jenis Kemasan
                  </th>
                  <th className="p-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Keterangan / Alasan
                  </th>
                  <th className="p-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider text-right">
                    Perubahan Stok
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log, index) => {
                  const isKeluar = log.tipe === "KELUAR";
                  const isChange = log.tipe === "PERUBAHAN";
                  const isMasuk = log.tipe === "MASUK";
                  const textColor = isChange
                    ? "text-blue-600"
                    : isMasuk
                      ? "text-emerald-600"
                      : "text-rose-500";

                  const displayChange = isChange
                    ? log.change >= 0
                      ? `+${Math.abs(log.change)}`
                      : `-${Math.abs(log.change)}`
                    : isKeluar
                      ? `-${Math.abs(log.change)}`
                      : `+${Math.abs(log.change)}`;

                  const matchKemasan =
                    log.keterangan?.match(/Kemasan\s*([\d.]+\s*kg[^,)]*)/i) ||
                    log.keterangan?.match(/\(([\d.]+\s*kg[^)]*)\)/i) ||
                    log.keterangan?.match(/([\d.]+\s*kg)/i);

                  const jenisKemasan = matchKemasan
                    ? matchKemasan[1]
                    : product.satuan
                      ? `Standard (1 ${product.satuan})`
                      : "Standard (1 kg)";

                  return (
                    <tr
                      key={log.id ? `${log.id}-${index}` : index}
                      className={`transition-colors ${
                        isKeluar
                          ? "bg-rose-50/30 hover:bg-rose-50/50"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="p-3 text-xs font-normal text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3">
                        {isChange ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-blue-50 text-blue-600 border border-blue-100">
                            Perubahan
                          </span>
                        ) : isMasuk ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Stok Masuk
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-rose-50 text-rose-500 border border-rose-100">
                            Stok Keluar
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60 inline-flex items-center gap-1">
                          <Package size={10} className="text-slate-400" />
                          {jenisKemasan}
                        </span>
                      </td>
                      <td className="p-3 text-xs font-normal text-slate-600 max-w-sm truncate">
                        {log.keterangan}
                      </td>
                      <td
                        className={`p-3 text-xs font-medium text-right ${textColor}`}
                      >
                        {displayChange} {product.satuan || "unit"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden relative border-l border-slate-100 pl-4 py-2 space-y-5">
            {filteredLogs.map((log, index) => {
              const isKeluar = log.tipe === "KELUAR";
              const isChange = log.tipe === "PERUBAHAN";
              const isMasuk = log.tipe === "MASUK";
              const bulletColor = isChange
                ? "bg-blue-500"
                : isMasuk
                  ? "bg-emerald-500"
                  : "bg-rose-500";
              const textColor = isChange
                ? "text-blue-600"
                : isMasuk
                  ? "text-emerald-600"
                  : "text-rose-500";

              const displayChange = isChange
                ? log.change >= 0
                  ? `+${Math.abs(log.change)}`
                  : `-${Math.abs(log.change)}`
                : isKeluar
                  ? `-${Math.abs(log.change)}`
                  : `+${Math.abs(log.change)}`;

              const matchKemasanMobile =
                log.keterangan?.match(/Kemasan\s*([\d.]+\s*kg[^,)]*)/i) ||
                log.keterangan?.match(/\(([\d.]+\s*kg[^)]*)\)/i) ||
                log.keterangan?.match(/([\d.]+\s*kg)/i);

              const jenisKemasanMobile = matchKemasanMobile
                ? matchKemasanMobile[1]
                : product.satuan
                  ? `Standard (1 ${product.satuan})`
                  : "Standard (1 kg)";

              return (
                <div
                  key={log.id ? `${log.id}-${index}` : index}
                  className="relative group text-left"
                >
                  <span
                    className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 ${bulletColor}`}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 inline-flex items-center gap-1">
                        <Package size={9} className="text-slate-400" />
                        {jenisKemasanMobile}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal leading-normal block">
                      {log.keterangan}
                    </span>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] text-slate-300 font-medium block">
                        {new Date(log.timestamp).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span
                        className={`text-[11px] font-medium flex-shrink-0 ${textColor}`}
                      >
                        {displayChange}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
