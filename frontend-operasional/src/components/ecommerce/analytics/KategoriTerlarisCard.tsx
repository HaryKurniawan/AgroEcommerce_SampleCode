"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Package } from "lucide-react";

import type {
  KategoriTerlarisData,
  ProdukTerlarisItem,
} from "@/lib/api/analytics";

const RANK_ICON = ["🥇", "🥈", "🥉"];

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toFixed(0)}`;
}

function TrendBadge({ persen, arah }: { persen?: number; arah?: string }) {
  if (persen === undefined || persen === null) return null;
  const isUp = arah === "UP" || persen > 0;
  const isDown = arah === "DOWN" || persen < 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-normal px-1.5 py-0.5 rounded-md
      ${isUp ? "bg-primary-50 text-primary-700 border border-primary-100" : isDown ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
    >
      {isUp ? (
        <TrendingUp size={9} />
      ) : isDown ? (
        <TrendingDown size={9} />
      ) : (
        <Minus size={9} />
      )}
      {Math.abs(persen)}%
    </span>
  );
}

function ProdukRow({
  item,
  showTrend,
}: {
  item: ProdukTerlarisItem;
  showTrend: boolean;
}) {
  const rankIcon = RANK_ICON[item.rank - 1] ?? `#${item.rank}`;
  const barWidth = item.persenDariKategori
    ? Math.max(8, item.persenDariKategori)
    : 30;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 rounded-lg px-2 transition-colors group">
      {/* Rank */}
      <div className="w-7 text-center text-lg leading-none flex-shrink-0">
        {item.rank <= 3 ? (
          rankIcon
        ) : (
          <span className="text-xs font-normal text-slate-400">
            #{item.rank}
          </span>
        )}
      </div>

      {/* Gambar produk */}
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
        {item.produk.gambarUrl ? (
          <img
            src={item.produk.gambarUrl}
            alt={item.produk.nama?.replace(" - ", " ")}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={13} className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Info produk */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-normal text-slate-800 truncate">
          {item.produk.nama?.replace(" - ", " ")}
        </p>
        {item.toko && (
          <p className="text-[10px] text-slate-400 truncate">
            {item.toko.nama}
          </p>
        )}
        {/* Progress bar */}
        {item.persenDariKategori !== undefined && (
          <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full transition-all"
              style={{ width: `${barWidth}%` }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-normal text-slate-800">
          {item.jumlahTerjual.toFixed(1)}{" "}
          <span className="text-[10px] text-slate-400">kg</span>
        </p>
        <p className="text-[10px] text-slate-400">
          {formatRupiah(item.totalRevenue)}
        </p>
        {showTrend && (
          <div className="mt-0.5">
            <TrendBadge persen={item.trendPersen} arah={item.trendArah} />
          </div>
        )}
      </div>
    </div>
  );
}

interface KategoriTerlarisCardProps {
  data: KategoriTerlarisData;
  showTrend?: boolean;
}

export default function KategoriTerlarisCard({
  data,
  showTrend = false,
}: KategoriTerlarisCardProps) {
  const { kategori, topProduk, totalKategoriTerjual, totalKategoriRevenue } =
    data;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all group">
      {/* Header kategori */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {kategori.icon && (
              <span className="text-xl leading-none">{kategori.icon}</span>
            )}
            <div>
              <h3 className="text-sm font-normal text-slate-800">
                {kategori.nama}
              </h3>
              <p className="text-[10px] text-slate-400">
                {topProduk.length} produk teratas
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-normal text-primary-600">
              {totalKategoriTerjual.toFixed(0)} kg
            </p>
            <p className="text-[10px] text-slate-400">
              {formatRupiah(totalKategoriRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Produk list */}
      <div className="px-3 pb-3">
        {topProduk.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-normal">
            Belum ada data penjualan
          </div>
        ) : (
          topProduk.map((item) => (
            <ProdukRow key={item.produk.id} item={item} showTrend={showTrend} />
          ))
        )}
      </div>
    </div>
  );
}
