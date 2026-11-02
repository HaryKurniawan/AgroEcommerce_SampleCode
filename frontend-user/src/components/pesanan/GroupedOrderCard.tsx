"use client";

import { useRouter } from "next/navigation";
import { Store, ChevronRight, Package } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { ApiOrderData } from "@/types";

interface GroupedOrderCardProps {
  orders: ApiOrderData[];
  onPay: () => void;
}

export default function GroupedOrderCard({
  orders,
  onPay,
}: GroupedOrderCardProps) {
  const router = useRouter();
  const grandTotal = orders.reduce(
    (sum, o) => sum + Number(o.totalHarga || 0),
    0,
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-amber-200">
      {/* Header — checkout group badge */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Store size={12} className="text-amber-600" />
          </div>
          <span className="text-xs font-bold text-amber-700">
            {orders.length} Toko · 1 Checkout
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Menunggu Bayar
        </span>
      </div>

      {/* Each store's order row */}
      <div className="divide-y divide-dashed divide-gray-100 mx-4">
        {orders.map((order) => {
          const orderAny = order as any;
          const rawItems = (orderAny.item ?? orderAny.items ?? []) as any[];
          const firstItem = rawItems[0];
          const productName =
            firstItem?.produk?.nama?.replace(" - ", " ") ||
            firstItem?.product?.nama?.replace(" - ", " ") ||
            firstItem?.produkNama ||
            "Produk";
          const satuan =
            firstItem?.produk?.satuan ||
            firstItem?.product?.satuan ||
            firstItem?.satuan ||
            "pcs";
          const itemCount = rawItems.length;
          const storeName =
            firstItem?.produk?.toko?.nama ||
            firstItem?.product?.store?.nama ||
            orderAny.storeName ||
            "Toko";

          return (
            <div
              key={order.id_pesanan}
              className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors rounded-xl"
              onClick={() => router.push(`/pesanan/${order.id_pesanan}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/pesanan/${order.id_pesanan}`);
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-primary-600 mb-0.5 flex items-center gap-1">
                  <Store size={10} />
                  {String(storeName)}
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {String(productName)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {String(firstItem?.jumlah ?? 0)} {String(satuan)}
                  {itemCount > 1 && ` · +${itemCount - 1} lainnya`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-gray-700">
                  {formatRupiah(Number(order.totalHarga || 0))}
                </span>
                <ChevronRight
                  size={14}
                  className="text-gray-300 mt-1 ml-auto"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimasi Pengiriman */}
      {(() => {
        const hideEstimate = orders.some((order) => {
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
          return isUnconfirmedGrosir || isPendingSellerConfirm;
        });

        if (hideEstimate) return null;

        return (
          <div className="px-4 py-2.5 bg-emerald-50/30 border-t border-dashed border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package size={13} className="text-emerald-600" />
              <span className="text-[11px] text-gray-500 font-medium">
                Estimasi Barang Sampai
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              {(() => {
                const firstOrder = orders[0];
                const date = firstOrder?.createdAt
                  ? new Date(firstOrder.createdAt)
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

      {/* Footer: total + pay button */}
      <div className="flex items-center justify-between px-4 py-3 mt-1 border-t border-gray-100 bg-gray-50/70">
        <div>
          <p className="text-[10px] text-gray-400">Total Pembayaran</p>
          <p className="text-base font-bold text-primary-600">
            {formatRupiah(grandTotal)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPay();
          }}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all hover:bg-primary-700"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
}
