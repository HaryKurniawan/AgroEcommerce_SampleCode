"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { EcomProduct } from "@/types";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EcomProduct | null;
  mode?: "cart" | "buy";
  initialVarianId?: string;
  onConfirm: (
    produkId: string,
    quantity: number,
    varianKemasanId?: string,
  ) => Promise<void>;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  mode = "cart",
  initialVarianId,
  onConfirm,
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedVarianId, setSelectedVarianId] = useState<string | undefined>(
    initialVarianId,
  );

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const variants = product?.varian || product?.kemasan || [];

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const newQuantity = 1;
    let newVarianId: string | undefined = undefined;

    if (initialVarianId) {
      newVarianId = initialVarianId;
    } else if (variants.length > 0) {
      // Find first active variant with stock
      const availableVariant = variants.find(
        (v) => v.isActive && v.stokKemasan > 0,
      );
      newVarianId = availableVariant
        ? availableVariant.id_varianKemasan
        : undefined;
    }

    setQuantity(newQuantity);
    setQuantityInput(String(newQuantity));
    setSelectedVarianId(newVarianId);
  }, [isOpen, product?.id_produk, initialVarianId, variants.length]);

  if (!isOpen || !product) return null;

  const hasVariants = variants.length > 0;
  const selectedVarian = variants.find(
    (k) => k.id_varianKemasan === selectedVarianId,
  );
  const displayPrice = selectedVarian
    ? product.harga * selectedVarian.ukuranKg +
      (selectedVarian.biayaTambahan || 0)
    : product.harga;
  const displayStock = selectedVarian
    ? selectedVarian.stokKemasan
    : product.stok;
  const subtotal = displayPrice * quantity;

  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.max(1, Math.min(newQty, displayStock || 1));
    setQuantity(clamped);
    setQuantityInput(String(clamped));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // hanya menerima angka 0-9
    setQuantityInput(val);
    if (val !== "") {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        const clamped = Math.max(1, Math.min(num, displayStock || 1));
        setQuantity(clamped);
      }
    }
  };

  const handleInputBlur = () => {
    let num = parseInt(quantityInput, 10);
    if (isNaN(num) || num < 1) {
      num = 1;
    } else if (displayStock && num > displayStock) {
      num = displayStock;
    }
    setQuantity(num);
    setQuantityInput(String(num));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(product.id_produk, quantity, selectedVarianId);

      // If buy mode, redirect to checkout after adding to cart
      if (mode === "buy") {
        handleClose();
        router.push("/checkout");
      }
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
          <div className="p-5 pb-0 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
              {product.gambarUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={product.gambarUrl}
                    alt={product.nama?.replace(" - ", " ")}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-10">
              <div className="flex items-baseline gap-1 mt-0">
                <p className="font-bold text-xl text-primary-700 font-display">
                  {formatRupiah(displayPrice)}
                </p>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">
                  / {product.satuan}
                </p>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-2">
                Stok: <span className="text-gray-500">{displayStock}</span>
              </p>
            </div>
          </div>

          {/* Packaging Size Variant Selector */}
          {hasVariants && (
            <div className="p-5 pb-0">
              <div className="text-xs font-medium text-gray-600 block mb-2 font-normal">
                Ukuran Kemasan:
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variants.map((k) => {
                  const isSelected = selectedVarianId === k.id_varianKemasan;
                  const isOutOfStock = k.stokKemasan <= 0;
                  return (
                    <button
                      key={k.id_varianKemasan}
                      type="button"
                      disabled={!k.isActive || isOutOfStock}
                      onClick={() => {
                        setSelectedVarianId(k.id_varianKemasan);
                        setQuantity(1);
                        setQuantityInput("1");
                      }}
                      className={`flex flex-col items-start px-3.5 py-1.5 rounded-xl border transition-all text-left relative ${
                        isSelected
                          ? "border-primary-600 bg-primary-50/30 text-primary-900 shadow-2xs"
                          : k.isActive && !isOutOfStock
                            ? "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <span className="text-xs font-semibold text-gray-800">
                        {k.ukuranKg} kg
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                        Sisa: {k.stokKemasan}
                      </span>
                      {isOutOfStock && k.isActive && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[8px] font-bold">
                          Habis
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Confirm */}
          <div className="p-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm font-semibold text-gray-700">
                Jumlah
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors shrink-0"
                >
                  <Minus size={18} className="text-gray-600" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantityInput}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleInputBlur();
                    }
                  }}
                  className="w-16 h-10 text-center font-semibold text-lg text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= displayStock}
                  className="w-10 h-10 rounded-xl border border-gray-300 text-primary-600 flex items-center justify-center hover:bg-primary-50 disabled:opacity-40 transition-colors shrink-0"
                >
                  <Plus size={18} className="text-primary-600" />
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting || displayStock === 0}
              className={`w-full py-3.5 rounded-2xl font-medium shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 mt-4 bg-primary-600 text-white hover:bg-primary-700`}
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
          <div className="h-2 lg:hidden" />
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
