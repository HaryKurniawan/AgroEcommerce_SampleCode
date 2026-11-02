"use client";

import React from "react";
import { Package, AlertCircle, Loader2 } from "lucide-react";

import { ProductItem } from "./types";

interface StockAdjustFormProps {
  product: ProductItem;
  targetStock: number;
  adjustType: "masuk" | "keluar";
  setAdjustType: (type: "masuk" | "keluar") => void;
  adjustQty: number;
  setAdjustQty: React.Dispatch<React.SetStateAction<number>>;
  notes: string;
  setNotes: (notes: string) => void;
  isUpdating: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StockAdjustForm({
  product,
  targetStock,
  adjustType,
  setAdjustType,
  adjustQty,
  setAdjustQty,
  notes,
  setNotes,
  isUpdating,
  onCancel,
  onSubmit,
}: StockAdjustFormProps) {
  const s = Number(product.stok) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Column 1: Info & Current Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Card Row */}
        <div className="flex gap-3 p-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl">
          <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
            {product.gambarUrl ? (
              <img
                src={product.gambarUrl}
                alt={product.nama?.replace(" - ", " ")}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="space-y-1 min-w-0 flex-1 justify-center flex flex-col">
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-100/50 font-medium self-start leading-none">
              {product.category?.nama || "Lainnya"}
            </span>
            <h4 className="text-[13px] font-medium text-slate-800 truncate leading-tight">
              {product.nama?.replace(" - ", " ")}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Rp {Number(product.harga).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Current Stock block */}
        <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[9px] text-slate-400 font-medium block uppercase tracking-wider mb-0.5">
                Stok Saat Ini
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-medium text-slate-700">
                  {product.stok}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {product.satuan || "unit"}
                </span>
              </div>
            </div>
            <div>
              {s === 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-rose-50 text-rose-500 border border-rose-100">
                  Habis
                </span>
              ) : s < 10 ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-amber-50 text-amber-500 border border-amber-100">
                  Rendah
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Cukup
                </span>
              )}
            </div>
          </div>

          {product.varian && product.varian.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100/80">
              {product.varian.map((v) => (
                <div
                  key={v.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-50/50 text-emerald-600 border border-emerald-100/50 flex gap-1"
                >
                  <span className="font-semibold">{v.ukuranKg}kg:</span>
                  <span>{v.stokKemasan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Adjust Stock Form */}
      <form
        onSubmit={onSubmit}
        className="space-y-4 border-t border-slate-100/80 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:border-slate-100/80 lg:pl-6 animate-in fade-in duration-200"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipe Penyesuaian */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Tipe Penyesuaian
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType("masuk")}
                className={`py-2 px-3 rounded-xl border text-[11px] font-medium transition-all text-center ${
                  adjustType === "masuk"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                Stok Masuk (+)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType("keluar")}
                className={`py-2 px-3 rounded-xl border text-[11px] font-medium transition-all text-center ${
                  adjustType === "keluar"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                Stok Keluar (-)
              </button>
            </div>
          </div>

          {/* Jumlah Perubahan */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Jumlah Perubahan
            </label>
            <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100/50 rounded-xl p-1 h-[36px]">
              <button
                type="button"
                disabled={adjustQty <= 1}
                onClick={() => setAdjustQty((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.95] transition-all text-xs font-medium shadow-sm"
              >
                -
              </button>

              <div className="flex items-baseline gap-1 px-2">
                <span className="text-xs font-medium text-slate-700">
                  {adjustQty}
                </span>
                <span className="text-[9px] text-slate-400 font-normal">
                  {product.satuan || "unit"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAdjustQty((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-500 hover:bg-slate-50 active:scale-[0.95] transition-all text-xs font-medium shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets row */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Pilihan Cepat Tambah Jumlah
          </label>
          <div className="flex flex-wrap gap-1.5 items-center">
            {[1, 5, 10, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAdjustQty((prev) => prev + val)}
                className="px-2.5 py-1 bg-white border border-slate-100 hover:bg-slate-50 rounded-lg text-[10px] font-medium text-slate-600 transition-all active:scale-[0.95] shadow-sm"
              >
                +{val}
              </button>
            ))}
            <button
              type="button"
              disabled={adjustQty === 1}
              onClick={() => setAdjustQty(1)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-medium text-slate-500 transition-all active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
            >
              Reset ke 1
            </button>
          </div>
        </div>

        {/* Stock Delta Badge */}
        <div
          className={`p-3 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
            adjustType === "masuk"
              ? "bg-emerald-50/40 border-emerald-100 text-emerald-700"
              : "bg-rose-50/40 border-rose-100 text-rose-600"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Stok akan berubah dari{" "}
            <span className="font-medium text-slate-700">{product.stok}</span>{" "}
            menjadi{" "}
            <span className="font-medium text-slate-950">{targetStock}</span>{" "}
            (Selisih:{" "}
            {adjustType === "masuk" ? `+${adjustQty}` : `-${adjustQty}`}{" "}
            {product.satuan || "unit"}).
          </span>
        </div>

        {/* Notes Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Catatan / Alasan Penyesuaian
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Penerimaan pengajuan kiriman stok, koreksi selisih hitung fisik..."
            rows={2}
            className="w-full p-3 bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-xl text-xs placeholder-slate-400 font-normal text-slate-700 resize-none transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-medium transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isUpdating || adjustQty <= 0}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Penyesuaian"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
