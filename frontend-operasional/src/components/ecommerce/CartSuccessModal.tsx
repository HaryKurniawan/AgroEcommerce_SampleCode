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
  grade?: "A" | "B" | "C";
}

const CartSuccessModal: React.FC<CartSuccessModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity = 1,
  grade,
}) => {
  const router = useRouter();

  if (!isOpen || !product) return null;

  // Find price from grade data if available
  const gradeData = grade && product.grade?.find((g) => g.grade === grade);
  const displayPrice = gradeData ? gradeData.harga : product.harga;

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
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-primary-600" />
          </div>
        </div>

        <h3 className="font-display font-bold text-lg text-gray-900 text-center">
          Berhasil Ditambahkan!
        </h3>
        <p className="text-sm text-gray-500 text-center mt-1 mb-1">
          Produk sudah masuk ke keranjang belanja kamu
        </p>

        {/* Item Preview */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 my-4 border border-gray-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100 overflow-hidden">
            {product.gambarUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={product.gambarUrl}
                  alt={product.nama?.replace(" - ", " ")}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              "📦"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 line-clamp-1">
              {product.nama?.replace(" - ", " ")}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {grade && (
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 border border-primary-200 px-1.5 py-0.5 rounded">
                  Grade {grade}
                </span>
              )}
              <span className="text-xs text-gray-400">x{quantity}</span>
            </div>
            <p className="text-xs font-bold text-primary-700 mt-0.5">
              {formatRupiah(displayPrice * quantity)}
            </p>
          </div>
        </div>

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
