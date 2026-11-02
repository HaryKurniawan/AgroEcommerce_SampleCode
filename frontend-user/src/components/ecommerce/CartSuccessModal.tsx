"use client";

import { useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { EcomProduct } from "@/types";

interface CartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EcomProduct | null;
  quantity?: number;
}

const CartSuccessModal: React.FC<CartSuccessModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity = 1,
}) => {
  const router = useRouter();

  if (!isOpen || !product) return null;

  const displayPrice = product.harga;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        className="absolute inset-0 w-full h-full cursor-default bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto p-6 animate-slide-up">
        {/* Success Icon */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-[6px] border-emerald-100 shadow-xl shadow-emerald-500/20">
              <ShoppingCart size={34} className="text-emerald-600 -ml-0.5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-[3px] border-white shadow-lg">
              <Check size={16} className="text-white" strokeWidth={4} />
            </div>
          </div>
        </div>

        <h3 className="font-display font-medium text-xl text-gray-900 text-center mb-1">
          Berhasil Ditambahkan!
        </h3>
        <p className="text-[13px] text-gray-500 text-center mt-1 mb-8 px-4">
          Yuk, segera checkout pesananmu sekarang sebelum kehabisan!
        </p>
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Lanjut Belanja
          </button>
          <button
            onClick={() => {
              onClose();
              router.push("/keranjang");
            }}
            className="flex-1 py-3 px-4 bg-primary-600 rounded-2xl text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-primary-100"
          >
            <ShoppingCart size={16} /> Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSuccessModal;
