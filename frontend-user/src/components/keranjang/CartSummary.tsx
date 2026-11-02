import React from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatRupiah } from "@/lib/ecommerce-api";

interface CartSummaryProps {
  subtotal: number;
  ongkir: number;
  total: number;
  isSelectMode: boolean;
  selectedCount: number;
  onRemoveSelected: () => void;
  variant: "desktop" | "mobile";
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  ongkir,
  total,
  isSelectMode,
  selectedCount,
  onRemoveSelected,
  variant,
}) => {
  const router = useRouter();

  if (variant === "desktop") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h3 className="font-display font-semibold text-sm mb-6 text-gray-900 uppercase tracking-widest flex items-center gap-2">
          Ringkasan Belanja
        </h3>
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-lg font-semibold text-gray-900">
              Subtotal
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-lg font-semibold text-gray-900">
              Biaya Pengiriman
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatRupiah(ongkir)}
            </span>
          </div>
          <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-200">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 font-bold tracking-widest mb-1">
                  Total Pembayaran
                </p>
                <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isSelectMode ? (
          <button
            disabled={selectedCount === 0}
            onClick={onRemoveSelected}
            className="w-full mt-8 bg-red-50 text-red-500 font-semibold py-4 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Hapus Terpilih ({selectedCount})
          </button>
        ) : (
          <button
            onClick={() => router.push("/checkout")}
            className="w-full mt-8 bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            Lanjut ke Checkout
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed">
          Lanjutkan ke pembayaran untuk memilih metode pengiriman dan alamat.
        </p>
      </div>
    );
  }

  // Mobile version
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.04)]">
      <div className="px-8 pt-6 pb-2 space-y-2">
        <div className="flex items-center justify-between text-gray-600">
          <span className="text-sm font-medium text-gray-700">Subtotal</span>
          <span className="font-semibold text-base text-gray-800">
            {formatRupiah(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600 pb-4 border-b-2 border-dashed border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Ongkos Kirim
          </span>
          <span className="font-semibold text-base text-gray-800">
            {formatRupiah(ongkir)}
          </span>
        </div>
      </div>

      <div className="px-8 pt-4 pb-8 flex items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium tracking-widest mb-0.5">
            Total Bayar
          </p>
          <p className="font-display font-semibold text-xl text-gray-800 tracking-tight leading-none">
            {formatRupiah(total)}
          </p>
        </div>

        {isSelectMode ? (
          <button
            disabled={selectedCount === 0}
            onClick={onRemoveSelected}
            className="flex-1 bg-red-50 text-red-500 py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Trash2 size={16} /> Hapus ({selectedCount})
          </button>
        ) : (
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold text-[15px] active:scale-95 transition-all text-center"
          >
            Checkout
          </button>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
