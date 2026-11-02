import React from "react";
import Image from "next/image";
import { Minus, Plus, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { ApiCartItem } from "@/types";

interface CartItemRowProps {
  item: ApiCartItem;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdateQuantity: (deltaOrTarget: number, isAbsolute?: boolean) => void;
  onUpdateVariant?: (newVarianId: string) => void;
  onPromptDelete?: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  isSelectMode,
  isSelected,
  onToggleSelection,
  onUpdateQuantity,
  onUpdateVariant,
  onPromptDelete,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [localJumlah, setLocalJumlah] = React.useState<string>(
    String(item.jumlah),
  );

  React.useEffect(() => {
    setLocalJumlah(String(item.jumlah));
  }, [item.jumlah]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVariant = item.availableVariants?.find(
    (v) => v.id_varianKemasan === item.varianId,
  );
  const maxStock = selectedVariant
    ? selectedVariant.stokKemasan
    : item.stok || item.stokTersediaKg || 0;
  const isOutOfStock = maxStock === 0;
  const isInvalidStock = maxStock > 0 && item.jumlah > maxStock;
  const isDisabledCheckbox = isOutOfStock || isInvalidStock;
  const isMaxStock = item.jumlah >= maxStock || isOutOfStock;

  const handleMinusClick = () => {
    if (item.jumlah <= 1) {
      onPromptDelete?.();
    } else {
      onUpdateQuantity(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // hanya menerima angka 0-9
    setLocalJumlah(val);
    if (val !== "") {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1) {
        const clamped = maxStock > 0 ? Math.min(num, maxStock) : num;
        onUpdateQuantity(clamped, true);
      }
    }
  };

  const handleInputBlur = () => {
    let num = parseInt(localJumlah, 10);
    if (isNaN(num) || num < 1) {
      num = 1;
    } else if (maxStock > 0 && num > maxStock) {
      num = maxStock;
    }
    setLocalJumlah(String(num));
    if (num !== item.jumlah) {
      onUpdateQuantity(num, true);
    }
  };

  return (
    <div
      className={`px-6 py-5 transition-all relative z-0 ${
        isOutOfStock
          ? "opacity-50 bg-gray-50/50"
          : isInvalidStock
            ? "bg-orange-50/30"
            : isSelectMode && !isSelected
              ? "opacity-40 grayscale-[0.5]"
              : ""
      }`}
    >
      <div className="flex items-start gap-5">
        {isSelectMode && (
          <div className="pt-2">
            <input
              type="checkbox"
              checked={isSelected && !isDisabledCheckbox}
              onChange={onToggleSelection}
              disabled={isDisabledCheckbox}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        )}

        {/* Product Image */}
        <Link
          href={`/produk/${item.produkId}`}
          className="relative w-[72px] h-[72px] bg-gray-50 rounded-2xl flex-shrink-0 border border-gray-100 overflow-hidden group block"
        >
          {item.gambar && item.gambar.length > 5 ? (
            <Image
              src={item.gambar}
              alt={item.produkNama}
              fill
              sizes="80px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {item.gambar ? item.gambar : "📦"}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link href={`/produk/${item.produkId}`}>
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-base text-gray-900 line-clamp-2 leading-tight hover:text-primary-600 transition-colors cursor-pointer">
                    {item.produkNama}
                  </p>
                  {isOutOfStock && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Habis
                    </span>
                  )}
                  {isInvalidStock && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Kurangi Jumlah
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.availableVariants && item.availableVariants.length > 1 ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg border-none focus:outline-none transition-colors"
                >
                  <span>
                    {selectedVariant?.ukuranKg
                      ? `Kemasan ${selectedVariant.ukuranKg} kg (Sisa ${selectedVariant.stokKemasan})`
                      : item.varian || "Pilih Kemasan"}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 py-1">
                    {item.availableVariants.map((v) => (
                      <button
                        key={v.id_varianKemasan}
                        onClick={() => {
                          onUpdateVariant?.(v.id_varianKemasan);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[11px] font-medium flex items-center justify-between transition-colors ${
                          item.varianId === v.id_varianKemasan
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>Kemasan {v.ukuranKg} kg</span>
                        <span
                          className={`text-[10px] ${item.varianId === v.id_varianKemasan ? "text-primary-500" : "text-gray-400"}`}
                        >
                          Sisa {v.stokKemasan}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : item.varian ? (
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                Variasi: {item.varian}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                / {item.satuan}
              </span>
            )}
          </div>

          {/* Price + Quantity */}
          <div className="flex items-end justify-between mt-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold leading-none">
                Subtotal
              </p>
              <p className="font-display font-bold text-base text-gray-900 tracking-tight">
                {formatRupiah(item.harga * item.jumlah)}
              </p>
              {/* Sisa Stok */}
              {maxStock > 0 && (
                <p
                  className={`text-[10px] font-semibold leading-none ${isInvalidStock ? "text-orange-500" : isMaxStock ? "text-red-400" : "text-gray-400"}`}
                >
                  Sisa stok: {maxStock}
                </p>
              )}
            </div>

            {isOutOfStock ? (
              <button
                onClick={() => onPromptDelete?.()}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-red-100 bg-white"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={handleMinusClick}
                    className="w-9 h-9 flex items-center justify-center transition-colors border-r border-gray-100 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <Minus size={14} className="text-gray-400" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={localJumlah}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInputBlur();
                      }
                    }}
                    className="font-display text-sm font-semibold w-12 text-center text-gray-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 py-1"
                  />
                  <button
                    onClick={() => onUpdateQuantity(1)}
                    disabled={isMaxStock}
                    className={`w-9 h-9 flex items-center justify-center transition-colors border-l border-gray-100 ${
                      isMaxStock
                        ? "bg-red-50 opacity-40 cursor-not-allowed border-l-red-100 text-red-400"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <Plus
                      size={14}
                      className={isMaxStock ? "text-red-400" : "text-gray-400"}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
