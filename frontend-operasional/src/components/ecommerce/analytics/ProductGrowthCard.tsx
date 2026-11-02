"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Package } from "lucide-react";

import type { PertumbuhanProdukItem } from "@/lib/api/analytics";

function fmtRev(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

interface ProductGrowthCardProps {
  item: PertumbuhanProdukItem;
}

export default function ProductGrowthCard({ item }: ProductGrowthCardProps) {
  const isPositive = item.growthPersen >= 0;
  const isZero = item.growthPersen === 0;

  const maxRev = Math.max(item.periodeA.revenue, item.periodeB.revenue, 1);
  const barA = (item.periodeA.revenue / maxRev) * 100;
  const barB = (item.periodeB.revenue / maxRev) * 100;

  const growthColor = isZero
    ? "text-gray-400"
    : isPositive
      ? "text-emerald-500"
      : "text-red-500";

  const dotColor = isZero
    ? "bg-gray-200"
    : isPositive
      ? "bg-emerald-400"
      : "bg-red-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      {/* Top row: image + name + badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
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

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate leading-snug">
            {item.produk.nama?.replace(" - ", " ")}
          </p>
          {item.produk.kategori && (
            <p className="text-[10px] text-gray-400 truncate">
              {item.produk.kategori.nama}
            </p>
          )}
        </div>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      </div>

      {/* Growth number */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-extrabold leading-none tracking-tight ${growthColor}`}
        >
          {isPositive && !isZero ? "+" : ""}
          {item.growthPersen}%
        </span>
        <span className="text-[10px] text-gray-400 leading-tight">
          vs periode
          <br />
          sebelumnya
        </span>
      </div>

      {/* Comparison bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span className="truncate max-w-[55%]">{item.periodeA.label}</span>
            <span className="font-semibold text-gray-600">
              {fmtRev(item.periodeA.revenue)}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${barA}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span className="truncate max-w-[55%]">{item.periodeB.label}</span>
            <span className="font-semibold text-gray-400">
              {fmtRev(item.periodeB.revenue)}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-200 rounded-full"
              style={{ width: `${barB}%` }}
            />
          </div>
        </div>
      </div>

      {/* Qty footer */}
      <div className="flex justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50">
        <span>{item.periodeA.qty.toFixed(1)} kg</span>
        <span className="text-gray-300">
          vs {item.periodeB.qty.toFixed(1)} kg
        </span>
      </div>
    </div>
  );
}
