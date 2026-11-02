"use client";

import { Receipt, CheckCircle, Copy } from "lucide-react";

import { formatTanggal } from "@/lib/ecommerce-api";

interface OrderIdStripProps {
  orderId: string;
  statusLabel: string;
  statusColorClasses: string;
  copied: boolean;
  onCopy: () => void;
}

/**
 * Strip ringkas yang menampilkan nomor pesanan singkat, tanggal, dan tombol salin.
 */
export default function OrderIdStrip({
  orderId,
  statusLabel,
  statusColorClasses,
  copied,
  onCopy,
}: OrderIdStripProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3.5 flex items-center justify-between">
      {/* Kiri: ID Pesanan & Tombol Copy */}
      <div className="flex items-center gap-2">
        <div className="mt-0.5">
          <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">
            No. Pesanan
          </p>
          <div className="flex items-center gap-1.5">
            <p className="font-mono font-semibold text-[13px] text-gray-800">
              #{orderId.slice(-8).toUpperCase()}
            </p>
            <button
              onClick={onCopy}
              className="p-1 hover:bg-gray-50 rounded-md transition-colors"
              aria-label="Salin nomor pesanan"
            >
              {copied ? (
                <CheckCircle size={14} className="text-primary-500" />
              ) : (
                <Copy size={14} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Kanan: Status */}
      <span
        className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusColorClasses}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}
