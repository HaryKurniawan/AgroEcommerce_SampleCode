"use client";

import { useState } from "react";
import {
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Inbox,
} from "lucide-react";

import { ProfitTransaction, Pagination } from "@/types/profit-report";

import { BatchDetailsModal } from "./BatchDetailsModal";

interface ProfitTransactionsTableProps {
  transactions: ProfitTransaction[];
  pagination: Pagination;
  loading?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
}

const STATUS_COLOR: Record<string, string> = {
  MENUNGGU_KONFIRMASI_SELLER:
    "bg-amber-50 text-amber-600 border border-amber-100",
  MENUNGGU_BAYAR: "bg-amber-50 text-amber-600 border border-amber-100",
  DIPROSES: "bg-blue-50 text-blue-600 border border-blue-100",
  DIKIRIM: "bg-cyan-50 text-cyan-600 border border-cyan-100",
  SELESAI: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  DIBATALKAN: "bg-red-50 text-red-500 border border-red-100",
};

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_KONFIRMASI_SELLER: "Menunggu",
  MENUNGGU_BAYAR: "Menunggu Bayar",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProfitTransactionsTable({
  transactions,
  pagination,
  loading,
  onPageChange,
}: ProfitTransactionsTableProps) {
  const [selected, setSelected] = useState<ProfitTransaction | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-800 font-semibold mb-1">Hening di Laporan</p>
        <p className="text-sm text-gray-400 max-w-[250px]">
          Belum ada riwayat transaksi atau silakan coba ubah filter yang Anda
          pilih.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-y border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {[
                "Tanggal",
                "No. Pesanan",
                "Qty (kg)",
                "Harga Beli",
                "Harga Jual",
                "Keuntungan",
                "Margin",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className={`py-3.5 px-5 ${["Qty (kg)", "Harga Beli", "Harga Jual", "Keuntungan", "Margin"].includes(h) ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[13px]">
            {transactions.map((tx, idx) => (
              <tr
                key={tx.id ?? `tx-${idx}`}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="py-4 px-5 text-gray-500 whitespace-nowrap">
                  {fmtDate(tx.tanggalTransaksi)}
                </td>
                <td className="py-4 px-5">
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100/50">
                    #{tx.nomorPesanan.substring(0, 8)}
                  </span>
                </td>
                <td className="py-4 px-5 text-right font-medium text-slate-700">
                  {tx.jumlahTerjual.toFixed(2)}
                </td>
                <td className="py-4 px-5 text-right text-slate-500">
                  {fmt(tx.hargaBeli)}
                </td>
                <td className="py-4 px-5 text-right text-slate-700 font-medium">
                  {fmt(tx.hargaJual)}
                </td>
                <td className="py-4 px-5 text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 font-bold ${tx.keuntungan >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {tx.keuntungan >= 0 ? (
                      <TrendingUp size={14} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={14} strokeWidth={2.5} />
                    )}
                    {fmt(tx.keuntungan)}
                  </div>
                </td>
                <td className="py-4 px-5 text-right font-semibold text-slate-400">
                  {tx.persenKeuntungan.toFixed(1)}%
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${STATUS_COLOR[tx.statusPesanan] ?? "bg-gray-50 text-gray-500 border border-gray-100"}`}
                  >
                    {STATUS_LABEL[tx.statusPesanan] ?? tx.statusPesanan}
                  </span>
                </td>
                <td className="py-4 px-5">
                  {tx.batchDetails.length > 0 && (
                    <button
                      onClick={() => setSelected(tx)}
                      className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      title="Lihat Detail Batch"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-1">
          <p className="text-xs text-gray-400">
            Halaman {pagination.page} dari {pagination.totalPages} ·{" "}
            {pagination.total} transaksi
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onPageChange?.(pagination.page - 1, pagination.limit)
              }
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from(
              { length: Math.min(pagination.totalPages, 5) },
              (_, i) => {
                const p =
                  pagination.page <= 3
                    ? i + 1
                    : pagination.page >= pagination.totalPages - 2
                      ? pagination.totalPages - 4 + i
                      : pagination.page - 2 + i;
                if (p < 1 || p > pagination.totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p, pagination.limit)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                      p === pagination.page
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              },
            )}
            <button
              onClick={() =>
                onPageChange?.(pagination.page + 1, pagination.limit)
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selected && (
        <BatchDetailsModal
          transaction={selected}
          visible={true}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
