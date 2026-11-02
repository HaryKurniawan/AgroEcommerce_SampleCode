"use client";

import { X, TrendingUp, TrendingDown, Layers, Calculator } from "lucide-react";

import { ProfitTransaction } from "@/types/profit-report";

interface BatchDetailsModalProps {
  transaction: ProfitTransaction;
  visible: boolean;
  onClose: () => void;
}

export function BatchDetailsModal({
  transaction,
  visible,
  onClose,
}: BatchDetailsModalProps) {
  if (!visible) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPositive = transaction.keuntungan >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Detail Batch FIFO
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pesanan{" "}
              <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                #{transaction.nomorPesanan}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Informasi Transaksi */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Informasi Transaksi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Tanggal Transaksi
                </p>
                <p className="font-medium text-slate-700 text-sm">
                  {formatDate(transaction.tanggalTransaksi)}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Jumlah Terjual
                </p>
                <p className="font-medium text-slate-700 text-sm">
                  {transaction.jumlahTerjual}{" "}
                  <span className="text-xs text-slate-400">kg</span>
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Harga Jual/kg
                </p>
                <p className="font-medium text-slate-700 text-sm">
                  {formatCurrency(transaction.hargaJual)}
                </p>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">
                  Total Harga Jual
                </p>
                <p className="font-bold text-blue-700 text-sm">
                  {formatCurrency(transaction.totalHargaJual)}
                </p>
              </div>
            </div>
          </div>

          {/* Table Batch */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Detail Batch Terserap
            </h3>
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="py-3 px-4">Tanggal Masuk</th>
                    <th className="py-3 px-4 text-right">Qty (kg)</th>
                    <th className="py-3 px-4 text-right">Harga Beli/kg</th>
                    <th className="py-3 px-4 text-right">Total Harga Beli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {transaction.batchDetails.map((batch) => (
                    <tr
                      key={batch.stokMasukId}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatDate(batch.tanggalMasuk)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {batch.jumlahDigunakan.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {formatCurrency(batch.hargaBeli)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(batch.totalHargaBeli)}
                      </td>
                    </tr>
                  ))}
                  {transaction.batchDetails.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400 text-xs"
                      >
                        Tidak ada detail batch ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ringkasan */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Ringkasan Keuntungan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Total Harga Beli (FIFO)
                  </p>
                  <p className="font-bold text-slate-800 text-xl">
                    {formatCurrency(transaction.totalHargaBeli)}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Total Harga Jual
                  </p>
                  <p className="font-bold text-slate-800 text-xl">
                    {formatCurrency(transaction.totalHargaJual)}
                  </p>
                </div>
              </div>
              <div
                className={`col-span-2 rounded-2xl p-6 border ${isPositive ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} flex items-center justify-between`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPositive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    Keuntungan Bersih
                  </p>
                  <div className="flex items-center gap-3">
                    <p
                      className={`text-3xl font-black tracking-tight ${isPositive ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {formatCurrency(transaction.keuntungan)}
                    </p>
                    <span
                      className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {isPositive ? (
                        <TrendingUp size={16} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={16} strokeWidth={2.5} />
                      )}
                      {transaction.persenKeuntungan.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-full ${isPositive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
                >
                  <Calculator size={32} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 px-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-500">
            <Layers size={13} className="text-slate-400" />
            FIFO Weighted Average
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-500">
            <Layers size={13} className="text-slate-400" />
            {transaction.batchDetails.length} Batch Digunakan
          </div>
        </div>
      </div>
    </div>
  );
}
