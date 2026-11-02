"use client";

import React from "react";
import { Package, Edit } from "lucide-react";

import { ProductItem } from "./types";

interface StockInfoCardProps {
  product: ProductItem;
  onEditClick: () => void;
}

export function StockInfoCard({ product, onEditClick }: StockInfoCardProps) {
  const s = Number(product.stok) || 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Product Details Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
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
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100/50 font-medium">
              {product.category?.nama || "Lainnya"}
            </span>
          </div>
          <h4 className="text-[14px] font-medium text-slate-800 truncate leading-none">
            {product.nama?.replace(" - ", " ")}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium">
            Rp {Number(product.harga).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Current Stock & Edit Button Right */}
      <div className="flex items-center gap-6 shrink-0 self-end sm:self-auto">
        <div className="text-right">
          <span className="text-[9px] text-slate-400 font-medium block uppercase tracking-wider mb-0.5">
            Stok Saat Ini
          </span>
          <div className="flex items-center gap-2 justify-end mb-1">
            <span className="text-base font-medium text-slate-700">
              {product.stok}
            </span>
            <span className="text-xs font-normal text-slate-400">
              {product.satuan || "unit"}
            </span>
            {s === 0 ? (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium uppercase bg-rose-50 text-rose-500 border border-rose-100">
                Habis
              </span>
            ) : s < 10 ? (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium uppercase bg-amber-50 text-amber-500 border border-amber-100">
                Rendah
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                Cukup
              </span>
            )}
          </div>

          {product.varian && product.varian.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px] mt-1.5">
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

        <button
          type="button"
          onClick={onEditClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5 h-[36px]"
        >
          <Edit className="w-3.5 h-3.5" />
          Ubah Stok
        </button>
      </div>
    </div>
  );
}
