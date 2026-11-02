"use client";

import { Loader2, Truck } from "lucide-react";

import type { ApiOrderData } from "@/types";
import { OrderCard } from "@/components/business";

interface SingleOrderCardProps {
  order: ApiOrderData;
  onPay?: () => void;
  onConfirmReceived?: (e: React.MouseEvent) => void;
  isConfirming?: boolean;
}

export default function SingleOrderCard({
  order,
  onPay,
  onConfirmReceived,
  isConfirming,
}: SingleOrderCardProps) {
  const isUnpaid = order.status?.toUpperCase() === "MENUNGGU_BAYAR";
  const isShipped = order.status?.toUpperCase() === "DIKIRIM";
  const isArrived = (order as any).pengiriman?.status === "ARRIVED";

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <OrderCard order={order} className="border-0 shadow-none rounded-none" />

      {isUnpaid && onPay && (
        <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Selesaikan pembayaran
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPay();
            }}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-medium active:scale-95 transition-all hover:bg-primary-700"
          >
            Bayar Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
