"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, Store, ChevronRight, TrendingUp } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { ApiOrderData } from "@/types";

interface OrderCardProps {
  order: ApiOrderData;
  onClick?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  MENUNGGU_KONFIRMASI_SELLER: {
    label: "Menunggu Konfirmasi",
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-400",
  },
  MENUNGGU_BAYAR: {
    label: "Menunggu Bayar",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  DIPROSES: {
    label: "Diproses",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  DIKIRIM: {
    label: "Dikirim",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-400",
  },
  SELESAI: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  DITUTUP: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

export default function OrderCard({
  order,
  onClick,
  className,
}: OrderCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/pesanan/${order.id_pesanan}`);
  };

  const statusKey = order.status?.toUpperCase() ?? "";
  const statusCfg = STATUS_CONFIG[statusKey] ?? {
    label: order.status,
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  // Handle both API shapes:
  // list API  → item[].produk.nama?.replace(' - ', ' ')  + item[].produk.toko.nama
  // detail API → items[].product.nama?.replace(' - ', ' ') + storeName
  const rawItems = order.item ?? order.items ?? [];
  const firstItem = rawItems[0] as any;
  const itemCount = rawItems.length;

  const productName =
    firstItem?.produk?.nama?.replace(" - ", " ") ||
    firstItem?.product?.nama?.replace(" - ", " ") ||
    firstItem?.produkNama ||
    "Produk";

  const productImage =
    firstItem?.produk?.gambarUrl ||
    firstItem?.product?.gambarUrl ||
    firstItem?.gambar ||
    "";

  const productSatuan =
    firstItem?.produk?.satuan ||
    firstItem?.product?.satuan ||
    firstItem?.satuan ||
    "pcs";

  // Store name: prefer nested toko, then top-level storeName
  const storeName =
    firstItem?.produk?.toko?.nama ||
    firstItem?.product?.store?.nama ||
    order.storeName ||
    "Toko";

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Pesanan dari ${storeName}`}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${className ?? ""}`}
    >
      {/* ── Store header ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Store size={12} className="text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800 truncate">
            {storeName}
          </span>
          {order.isGrosir && (
            <span className="inline-flex items-center text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              Grosiran
            </span>
          )}
        </div>
        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-2 ${statusCfg.bg} ${statusCfg.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="mx-4 border-t border-gray-100" />

      {/* ── Product row ───────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Thumbnail */}
        <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative flex items-center justify-center">
          {productImage && !imageError ? (
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="56px"
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <Package size={22} className="text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {productName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {firstItem?.jumlah ?? 0} {productSatuan}
            {itemCount > 1 && (
              <span className="ml-1.5 text-gray-400">
                +{itemCount - 1} produk lainnya
              </span>
            )}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
      </div>

      {/* ── Footer: total ─────────────────────────────────── */}
      <div className="mx-4 border-t border-dashed border-gray-200" />

      {/* Estimasi Pengiriman */}
      {(() => {
        const isGrosir =
          order.isGrosir ||
          (order as any).isB2B ||
          (order as any).tipePesanan === "GROSIR";
        const isPaid = ["DIPROSES", "DIKIRIM", "SELESAI", "DITUTUP"].includes(
          order.status?.toUpperCase() || "",
        );
        const isUnconfirmedGrosir = isGrosir && !isPaid;
        const isPendingSellerConfirm =
          order.status?.toUpperCase() === "MENUNGGU_KONFIRMASI_SELLER";
        const hideEstimate = isUnconfirmedGrosir || isPendingSellerConfirm;

        if (hideEstimate) return null;

        return (
          <div className="px-4 py-2.5 bg-emerald-50/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package size={13} className="text-emerald-600" />
              <span className="text-[11px] text-gray-500 font-medium">
                Estimasi Barang Sampai
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              {(() => {
                const date = order.createdAt
                  ? new Date(order.createdAt)
                  : new Date();
                const hour = date.getHours();
                if (hour >= 15) {
                  date.setDate(date.getDate() + 1);
                }
                return date.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
              })()}
            </span>
          </div>
        );
      })()}

      <div className="mx-4 border-t border-dashed border-gray-200" />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-gray-400">Total Pesanan</span>
        <span className="text-sm font-semibold text-primary-600">
          {formatRupiah(order.totalHarga || 0)}
        </span>
      </div>
    </div>
  );
}
