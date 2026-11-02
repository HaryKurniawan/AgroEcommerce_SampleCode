import React from "react";
import { X, Package, ChevronRight, Info, CheckCircle2 } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedGrade: string;
  onContinue: (grade: string) => void;
}

const BulkOrderModal: React.FC<BulkOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedGrade,
  onContinue,
}) => {
  if (!isOpen) return null;

  const activeGradeData = product?.grade?.find(
    (g: any) => g.grade === selectedGrade,
  );
  const harga = activeGradeData ? activeGradeData.harga : product?.harga || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Tutup"
      />

      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative h-32 bg-emerald-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
            <Package size={40} className="text-white" />
          </div>
        </div>

        <div className="p-10 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Beli Jumlah Besar
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Dapatkan harga khusus grosir untuk komoditas{" "}
            <span className="font-bold text-gray-900">
              {product?.nama?.replace(" - ", " ")}
            </span>
            . Permintaan Anda akan dikirim langsung ke Penjual untuk
            dikonfirmasi.
          </p>

          <div className="space-y-4 mb-10 text-left bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-gray-600">
                Harga termurah langsung dari produsen/penjual.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-gray-600">
                Pengiriman skala besar via Gudang Logistik.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-gray-600">
                Pembayaran aman dengan sistem verifikasi.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onContinue(selectedGrade)}
              className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-100 group"
            >
              Lanjutkan ke Pengajuan{" "}
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={onClose}
              className="w-full h-14 bg-white text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Nanti Saja
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
            <Info size={14} />
            <p className="text-[10px] uppercase font-black tracking-widest">
              Membutuhkan akun yang sudah terverifikasi
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors text-white"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default BulkOrderModal;
