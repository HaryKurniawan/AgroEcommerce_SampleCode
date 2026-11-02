"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { EcomProduct } from "@/types";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EcomProduct | null;
  mode?: "cart" | "buy";
  onConfirm: (
    produkId: string,
    quantity: number,
    grade: "A" | "B" | "C",
  ) => Promise<void>;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  mode = "cart",
  onConfirm,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<"A" | "B" | "C">("B");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  // Reset state when product changes
  useEffect(() => {
    if (product && isOpen) {
      Promise.resolve().then(() => setQuantity(1));
      // Default to cheapest available grade
      if (product.grade && product.grade.length > 0) {
        const available = product.grade.filter((g) => g.stok > 0);
        if (available.length > 0) {
          available.sort((a, b) => a.harga - b.harga);
          Promise.resolve().then(() =>
            setSelectedGrade(available[0].grade as "A" | "B" | "C"),
          );
        } else {
          Promise.resolve().then(() => setSelectedGrade("C"));
        }
      }
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const grades = product.grade || [];
  const activeGrade = grades.find((g) => g.grade === selectedGrade);
  const displayPrice = activeGrade ? activeGrade.harga : product.harga;
  const displayStock = activeGrade ? activeGrade.stok : product.stok;
  const subtotal = displayPrice * quantity;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(product.id, quantity, selectedGrade);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        className={`absolute inset-0 w-full h-full cursor-default bg-black/50 backdrop-blur-sm ${isClosing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
        onClick={handleClose}
      />

      {/* Modal — mobile: bottom sheet, desktop: centered/modal */}
      <div className="absolute bottom-0 left-0 right-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:w-full">
        <div
          className={`bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden ${isClosing ? "animate-sheet-down" : "animate-sheet-up"}`}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>

          {/* Product Header */}
          <div className="p-5 pb-0 flex gap-3">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
              {product.gambarUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={product.gambarUrl}
                    alt={product.nama?.replace(" - ", " ")}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <p className="font-display font-semibold text-sm text-gray-900 line-clamp-2">
                {product.nama?.replace(" - ", " ")}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                {product.satuan}
              </p>
              <p className="font-display font-bold text-xl text-primary-700 tracking-tighter mt-1">
                {formatRupiah(displayPrice)}
              </p>
            </div>
          </div>

          {/* Grade Selector Hidden - No more quality levels visible to user */}

          {/* Quantity + Confirm */}
          <div className="p-5 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-sm font-semibold text-gray-700">
                Jumlah
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Minus size={18} className="text-gray-600" />
                </button>
                <span className="w-8 text-center font-semibold text-xl text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= displayStock}
                  className="w-10 h-10 rounded-xl border-2 border-primary-300 text-primary-600 flex items-center justify-center hover:bg-primary-50 disabled:opacity-40 transition-colors"
                >
                  <Plus size={18} className="text-primary-600" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4 p-3 bg-primary-50/50 rounded-xl border border-primary-100">
              <span className="font-display text-sm font-semibold text-gray-500">
                Subtotal
              </span>
              <span className="font-display font-bold text-lg text-primary-700">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting || displayStock === 0}
              className={`w-full py-4 rounded-2xl font-semibold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 ${
                mode === "buy"
                  ? "bg-gray-900 text-white shadow-gray-200 hover:bg-gray-800"
                  : "bg-primary-600 text-white shadow-primary-100 hover:bg-primary-700"
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "buy" ? (
                    <CreditCard size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                  {mode === "buy" ? "Beli Sekarang" : "Tambah ke Keranjang"}
                </>
              )}
            </button>
          </div>

          {/* Safe area padding for mobile */}
          <div className="h-6 lg:hidden" />
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
