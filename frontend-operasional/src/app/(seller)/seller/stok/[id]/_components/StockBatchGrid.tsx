"use client";

import React from "react";
import { Package, AlertCircle } from "lucide-react";

import { BatchItem, ProductItem } from "./types";

interface StockBatchGridProps {
  product: ProductItem;
  batches: BatchItem[];
}

export function StockBatchGrid({ product, batches }: StockBatchGridProps) {
  if (batches.length === 0) {
    return (
      <div className="text-center py-14 space-y-2">
        <Package className="w-8 h-8 text-slate-200 mx-auto" />
        <p className="text-[11px] text-slate-400 font-medium">
          Belum ada batch stok untuk produk ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {batches.map((batch, index) => {
        let expireInfo: string | null = null;
        let isExpired = false;
        let isExpiringSoon = false;
        let finalExpireDate: Date | null = null;

        if (batch.tanggalMasuk) {
          finalExpireDate = new Date(batch.tanggalMasuk);
          finalExpireDate.setMonth(finalExpireDate.getMonth() + 6);
        } else if (batch.tanggalKadaluarsa) {
          finalExpireDate = new Date(batch.tanggalKadaluarsa);
        }

        if (finalExpireDate) {
          const today = new Date();
          const diffTime = finalExpireDate.getTime() - today.getTime();
          const diffDays = Math.ceil(
            Math.abs(diffTime) / (1000 * 60 * 60 * 24),
          );

          const dateStr = finalExpireDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          if (finalExpireDate < today) {
            isExpired = true;
            expireInfo = `${dateStr} (Lewat ${diffDays} hari)`;
          } else {
            expireInfo = `${dateStr} (Sisa ${diffDays} hari)`;
            if (diffDays <= 3) isExpiringSoon = true;
          }
        }

        const rawReqId =
          batch.pengajuanStok?.id_pengajuanStok || batch.pengajuanStokId;

        return (
          <div
            key={batch.id ? `${batch.id}-${index}` : index}
            className={`p-4 rounded-2xl border transition-all ${
              isExpired
                ? "bg-rose-50/30 border-rose-200"
                : isExpiringSoon
                  ? "bg-amber-50/30 border-amber-200"
                  : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">
                  No. Pengajuan
                </p>
                <p className="text-[12px] font-semibold text-slate-700">
                  {rawReqId
                    ? `#${rawReqId.substring(0, 8).toUpperCase()}`
                    : "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium uppercase">
                  Tanggal Masuk
                </p>
                <p className="text-[11px] font-medium text-slate-600">
                  {new Date(batch.tanggalMasuk).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {batch.ukuranKemasanKg && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Ukuran Kemasan:</span>
                  <span className="font-medium text-slate-700">
                    {batch.ukuranKemasanKg} kg
                  </span>
                </div>
              )}
              {batch.jumlahKemasanTersisa !== undefined && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Sisa Kemasan:</span>
                  <span className="font-medium text-slate-700">
                    {batch.jumlahKemasanTersisa} kemasan
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Stok Awal Batch:</span>
                <span className="text-xs font-medium text-slate-700">
                  {batch.jumlahMasuk} {product.satuan || "kg"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Sisa Stok:</span>
                <span
                  className={`text-sm font-bold ${
                    batch.jumlahTersisa > 0
                      ? "text-emerald-600"
                      : "text-rose-500"
                  }`}
                >
                  {batch.jumlahTersisa} {product.satuan || "kg"}
                </span>
              </div>

              <div>
                {finalExpireDate ? (
                  <div
                    className={`mt-2 p-2 rounded-xl flex items-center justify-between gap-2 ${
                      isExpired
                        ? "bg-rose-100 text-rose-700"
                        : isExpiringSoon
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-medium">
                        Kadaluarsa:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-right leading-tight">
                      {expireInfo}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 p-2 rounded-xl flex items-center justify-between gap-2 bg-slate-50 text-slate-500 border border-slate-100">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-medium">
                        Kadaluarsa:
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-right leading-tight">
                      Tidak tercatat
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
