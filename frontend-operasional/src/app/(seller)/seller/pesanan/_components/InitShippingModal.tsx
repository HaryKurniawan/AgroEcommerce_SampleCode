import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Truck, X, Loader2, Package, ArrowRight } from "lucide-react";

import { OrderItem } from "../_hooks/useSellerOrders";

interface InitShippingModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const InitShippingModal: React.FC<InitShippingModalProps> = ({
  order,
  onClose,
  onConfirm,
  loading,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !order) return null;

  return createPortal(
    <>
      {/* Single backdrop — only rendered when order is not null */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Tutup"
      />

      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          {/* ── Header strip */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 pt-6 pb-8 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 right-10 w-16 h-16 bg-white/10 rounded-full" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
            >
              <X size={15} />
            </button>

            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-widest">
                  Konfirmasi Aksi
                </p>
                <h3 className="text-white font-bold text-base leading-tight">
                  Proses Pengiriman
                </h3>
              </div>
            </div>
          </div>

          {/* ── Overlap order ID pill */}
          <div className="flex justify-center -mt-4 relative z-10 px-6">
            <div className="bg-white border border-slate-100 shadow-md rounded-xl px-4 py-2 flex items-center gap-2">
              <Package size={13} className="text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium">
                Order
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                #
                {String(
                  order.id ||
                    (order as any).id_pesanan ||
                    (order as any).id_pesananEcom ||
                    "",
                )
                  .slice(0, 8)
                  .toUpperCase()}
              </span>
            </div>
          </div>

          {/* ── Body */}
          <div className="px-6 pt-5 pb-6 space-y-5">
            {/* Status transition indicator */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status Sekarang
                </p>
                <span className="inline-block bg-amber-100 text-amber-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                  Diproses
                </span>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                <ArrowRight size={15} className="text-emerald-600" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status Berikutnya
                </p>
                <span className="inline-block bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                  Sedang Disiapkan
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-500 text-center leading-relaxed">
              Pesanan akan diteruskan ke{" "}
              <span className="font-semibold text-slate-700">
                daftar tugas Kurir
              </span>{" "}
              setelah dikonfirmasi.
            </p>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Truck size={16} />
                )}
                {loading ? "Memproses..." : "Ya, Proses Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default InitShippingModal;
