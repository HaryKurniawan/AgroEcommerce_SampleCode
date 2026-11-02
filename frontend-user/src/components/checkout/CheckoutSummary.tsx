import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";

interface CheckoutSummaryProps {
  itemCount: number;
  totalBarang: number;
  totalOngkir: number;
  totalPPN?: number;
  persenPPN?: number;
  grandTotal: number;
  loadingShipping: boolean;
  loadingSubmit: boolean;
  disabled: boolean;
  disabledReason?: string;
  onSubmit: () => void;
  shippingInfos?: any;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  itemCount,
  totalBarang,
  totalOngkir,
  totalPPN = 0,
  persenPPN = 0,
  grandTotal,
  loadingShipping,
  loadingSubmit,
  disabled,
  disabledReason,
  onSubmit,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-gray-800 mb-4 text-base font-semibold">
        Ringkasan Belanja
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span className="font-normal">Total Harga ({itemCount} Barang)</span>
          <span className="font-normal text-gray-900">
            {formatRupiah(totalBarang)}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-normal">Total Ongkos Kirim</span>
          <span className="font-normal text-gray-900">
            {loadingShipping ? "Menghitung..." : formatRupiah(totalOngkir)}
          </span>
        </div>
        {totalPPN > 0 && (
          <div className="flex justify-between text-gray-600">
            <span className="font-normal">PPN ({persenPPN}%)</span>
            <span className="font-normal text-gray-900">
              {formatRupiah(totalPPN)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-gray-700">
            Total Tagihan
          </span>
          <span className="text-2xl font-semibold text-primary-600">
            {formatRupiah(grandTotal)}
          </span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loadingSubmit || loadingShipping}
        className={`w-full mt-6 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 ${
          disabled
            ? "bg-slate-300 text-slate-600 hover:bg-slate-400 active:scale-[0.98] cursor-pointer"
            : "bg-primary-600 hover:bg-primary-700 text-white active:scale-[0.98] shadow-md shadow-primary-600/20"
        } ${loadingSubmit || loadingShipping ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loadingSubmit ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <CheckCircle2 size={18} />
        )}
        Buat Pesanan
      </button>
      {disabled && disabledReason && !loadingShipping && !loadingSubmit && (
        <p
          className="text-xs text-amber-600 text-center mt-2.5 font-medium bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200/60 cursor-pointer"
          onClick={onSubmit}
        >
          ⚠️ {disabledReason} (Klik untuk melengkapi)
        </p>
      )}
    </div>
  );
};

export default CheckoutSummary;
