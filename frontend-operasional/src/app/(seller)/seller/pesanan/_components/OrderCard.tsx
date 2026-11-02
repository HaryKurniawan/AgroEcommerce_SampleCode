import React from "react";
import Image from "next/image";
import { Truck, ChevronRight, Copy, Package } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatRupiah, formatTanggal } from "@/lib/ecommerce-api";

import { OrderItem } from "../_hooks/useSellerOrders";
import { getStatusColor } from "../../_utils/shipping-status";

interface OrderCardProps {
  order: OrderItem;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const router = useRouter();
  const shipping = order.shipping;
  const orderId = order.id || order.id_pesanan || order.id_pesananEcom;

  const customerName =
    order.penerima ||
    order.customer?.name ||
    order.customer?.email ||
    order.pembeli ||
    "Pelanggan";

  return (
    <div
      onClick={() => router.push(`/seller/pesanan/${orderId}`)}
      className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/60 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-medium text-slate-800">{customerName}</p>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ${getStatusColor(order.status)}`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-600">
            {formatRupiah(Number(order.totalHarga || 0))}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-400">
          <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
            #{orderId ? String(orderId).slice(0, 8).toUpperCase() : "..."}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (orderId) navigator.clipboard.writeText(String(orderId));
            }}
            title="Salin ID"
            className="text-slate-300 hover:text-emerald-500 transition-colors"
          >
            <Copy size={11} />
          </button>
          <span>•</span>
          <span>{formatTanggal(order.createdAt)}</span>
          {order.metodeBayar && (
            <>
              <span>•</span>
              <span>{order.metodeBayar}</span>
            </>
          )}
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 ? (
          <div className="space-y-2.5">
            {order.items.slice(0, 2).map((item, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-sm flex-shrink-0 border border-slate-100">
                  {item.product?.gambarUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={item.product.gambarUrl}
                        alt={item.product.nama?.replace(" - ", " ") || "Produk"}
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <Package size={14} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-700 truncate">
                    {item.product?.namaEtalase ||
                      item.product?.nama?.replace(" - ", " ") ||
                      "—"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.jumlah} {item.product?.satuan || "kg"} ×{" "}
                    {formatRupiah(Number(item.harga))}
                  </p>
                </div>
                <p className="text-[12px] font-medium text-slate-600 whitespace-nowrap">
                  {formatRupiah(Number(item.jumlah) * Number(item.harga))}
                </p>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-[11px] text-slate-400 pl-12">
                +{order.items.length - 2} produk lainnya
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Data produk tidak tersedia
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-2 px-5 py-3 bg-slate-50/60 border-t border-slate-100/80"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {shipping?.status === "ARRIVED" &&
            order.status !== "SELESAI" &&
            order.status !== "DITUTUP" && (
              <span className="text-[11px] text-slate-500 font-medium">
                ⏳ Menunggu konfirmasi pembeli
              </span>
            )}
          {shipping?.kurirPenggunaId && (
            <button
              onClick={() =>
                router.push(`/seller/kurir/${shipping.kurirPenggunaId}`)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-xs font-medium rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
            >
              <Truck size={13} /> Kurir
            </button>
          )}
        </div>

        <button
          onClick={() => router.push(`/seller/pesanan/${orderId}`)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors whitespace-nowrap"
        >
          Detail <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
