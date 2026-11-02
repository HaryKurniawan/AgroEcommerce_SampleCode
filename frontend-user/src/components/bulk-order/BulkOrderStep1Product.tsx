"use client";

import React from "react";
import {
  Package,
  AlertCircle,
  CheckCircle2,
  X,
  Info,
  Truck,
} from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";

interface PackagingSpec {
  ukuranKg: number;
  jumlahBungkus: number;
}

interface VarianKemasan {
  id: string;
  ukuranKg: number;
  stokKemasan: number;
  isActive: boolean;
}

interface BulkOrderStep1ProductProps {
  product: {
    id: string;
    nama?: string;
    gambarUrl?: string;
    harga: number;
    satuan?: string;
    varian?: VarianKemasan[];
    stok?: number;
  } | null;
  jumlah: number;
  onJumlahChange: (value: number) => void;
  packagingSpecs: PackagingSpec[];
  onPackagingSpecsChange: (specs: PackagingSpec[]) => void;
}

// Preset sizes max 10 kg
const PRESET_SIZES = [1, 2, 5, 10];

function computeBungkus(
  jumlah: number,
  ukuranKg: number,
): { bungkus: number; sisa: number } {
  if (ukuranKg <= 0 || jumlah <= 0) return { bungkus: 0, sisa: 0 };
  const bungkus = Math.floor(jumlah / ukuranKg);
  const sisa = jumlah % ukuranKg;
  return { bungkus, sisa };
}

export const BulkOrderStep1Product: React.FC<BulkOrderStep1ProductProps> = ({
  product,
  jumlah,
  onJumlahChange,
  packagingSpecs,
  onPackagingSpecsChange,
}) => {
  if (!product) return null;

  const handleSelectPreset = (ukuranKg: number) => {
    const existingIdx = packagingSpecs.findIndex(
      (s) => s.ukuranKg === ukuranKg,
    );
    if (existingIdx !== -1) {
      onPackagingSpecsChange(
        packagingSpecs.filter((_, i) => i !== existingIdx),
      );
      return;
    }
    if (packagingSpecs.length >= 2) return;
    const { bungkus } = computeBungkus(jumlah, ukuranKg);
    onPackagingSpecsChange([
      ...packagingSpecs,
      { ukuranKg, jumlahBungkus: bungkus },
    ]);
  };

  const handleRemoveSpec = (idx: number) => {
    onPackagingSpecsChange(packagingSpecs.filter((_, i) => i !== idx));
  };

  const handleJumlahChange = (val: number) => {
    onJumlahChange(val);
    if (packagingSpecs.length > 0) {
      onPackagingSpecsChange(
        packagingSpecs.map((s) => ({
          ...s,
          jumlahBungkus: computeBungkus(val, s.ukuranKg).bungkus,
        })),
      );
    }
  };

  const totalKg = packagingSpecs.reduce((sum, s) => {
    const { sisa } = computeBungkus(jumlah, s.ukuranKg);
    return sum + s.ukuranKg * s.jumlahBungkus + sisa;
  }, 0);

  const minGrosir = Math.max(100, (product.stok || 0) + 1);
  const isJumlahValid = jumlah >= minGrosir;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Package size={16} className="text-emerald-600" />
          </div>
          <h2 className="font-semibold text-gray-900">
            Produk & Jumlah Pesanan
          </h2>
        </div>

        {/* Product card */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl mb-5">
          <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 relative">
            {product.gambarUrl ? (
              <Image
                src={product.gambarUrl}
                alt={product.nama?.replace(" - ", " ") || ""}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">
                📦
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-1 pr-2">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {product.nama?.replace(" - ", " ")}
            </h3>
            <p className="text-primary-600 font-bold mt-1">
              {formatRupiah(product.harga)}{" "}
              <span className="text-xs text-gray-400 font-normal">
                / {product.satuan}
              </span>
            </p>
          </div>
        </div>

        {/* Total Quantity Input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            Total Jumlah Pesanan ({product.satuan})
          </label>
          <div className="relative">
            <input
              type="number"
              min={minGrosir}
              required
              value={jumlah || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  handleJumlahChange(0);
                } else {
                  handleJumlahChange(parseInt(val) || 0);
                }
              }}
              onBlur={() => {
                if (jumlah < minGrosir) {
                  handleJumlahChange(minGrosir);
                }
              }}
              placeholder="Masukkan jumlah..."
              className="w-full h-14 bg-gray-50 border border-gray-200/80 rounded-2xl px-5 pr-16 text-lg sm:text-xl font-semibold text-gray-900 placeholder:font-normal placeholder:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
              {product.satuan}
            </div>
          </div>
          {jumlah < minGrosir ? (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5 font-medium">
              <AlertCircle size={12} />
              Minimal pemesanan grosir adalah {minGrosir} {product.satuan}
            </p>
          ) : (
            <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/80 space-y-3">
              {/* Estimasi Nilai Pesanan */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/60">
                <span className="text-xs font-medium text-gray-500">
                  Estimasi Nilai Pesanan
                </span>
                <span className="text-base font-bold text-emerald-600">
                  {formatRupiah(jumlah * product.harga)}
                </span>
              </div>

              {/* Status Ongkir */}
              {jumlah >= 300 ? (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-100/80 px-3.5 py-2.5 rounded-xl">
                  <Truck size={15} className="text-emerald-600 shrink-0" />
                  <span>
                    Pesanan Anda <strong>Memenuhi Syarat Gratis Ongkir!</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50/80 border border-amber-100/80 px-3.5 py-2.5 rounded-xl">
                  <Truck size={15} className="text-amber-600 shrink-0" />
                  <span>
                    Dikenakan Ongkir Grosir (Gratis jika &ge; 300{" "}
                    {product.satuan})
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-100 mb-5" />

        {/* Packaging Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-500">
              Pilih Kemasan{" "}
              <span className="font-normal text-gray-400">
                (maks. 2 jenis, maks. 10 kg)
              </span>
            </label>
            {packagingSpecs.length > 0 && (
              <span className="text-[10px] text-gray-400">
                {packagingSpecs.length}/2 jenis dipilih
              </span>
            )}
          </div>

          <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
            <Info size={10} />
            Pilih ukuran kemasan. Jumlah bungkus dihitung otomatis dari total
            pesanan.
          </p>

          {/* Preset buttons */}
          {isJumlahValid && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_SIZES.map((size) => {
                const isSelected = packagingSpecs.some(
                  (s) => s.ukuranKg === size,
                );
                const isDisabled = !isSelected && packagingSpecs.length >= 2;
                const { bungkus } = computeBungkus(jumlah, size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectPreset(size)}
                    className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 text-center transition-all duration-200 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-100 bg-gray-50 hover:border-primary-200 hover:bg-primary-50/40 text-gray-700 cursor-pointer"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    )}
                    <span className="text-base font-bold leading-tight">
                      {size}
                    </span>
                    <span className="text-[10px] font-medium leading-tight">
                      kg
                    </span>
                    <span className="text-[9px] mt-1 text-gray-400 leading-tight">
                      {bungkus} bungkus
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!isJumlahValid && (
            <div className="py-4 text-center text-xs text-gray-400">
              Masukkan jumlah pesanan terlebih dahulu (min. {minGrosir}{" "}
              {product.satuan})
            </div>
          )}

          {/* Selected specs detail */}
          {packagingSpecs.length > 0 && (
            <div className="space-y-2">
              {packagingSpecs.map((spec, idx) => {
                const { bungkus, sisa } = computeBungkus(jumlah, spec.ukuranKg);
                const isExact = sisa === 0;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      isExact
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        Kemasan {spec.ukuranKg} kg
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          × {bungkus} bungkus = {spec.ukuranKg * bungkus} kg
                        </span>
                      </p>
                      {sisa > 0 ? (
                        <p className="text-[10px] text-amber-600 mt-0.5">
                          + 1 kemasan isi {sisa} kg (
                          {spec.ukuranKg * bungkus + sisa} kg total)
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          ✓ Tepat habis dibagi
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/60 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add second packaging hint */}
          {isJumlahValid && packagingSpecs.length === 1 && (
            <p className="text-[10px] text-primary-500 mt-2 text-center font-medium">
              + Pilih 1 jenis kemasan lagi dari tombol di atas (opsional)
            </p>
          )}

          {/* Summary footer */}
          {packagingSpecs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  packagingSpecs.length > 1
                    ? totalKg >= jumlah
                      ? "bg-blue-50 border-blue-100 text-blue-700"
                      : "bg-red-50 border-red-100 text-red-600"
                    : "bg-gray-50 border-gray-100 text-gray-500"
                }`}
              >
                {packagingSpecs.length === 1 ? (
                  <span>
                    Total kemasan: <strong>{totalKg} kg</strong>
                    {totalKg !== jumlah && (
                      <span className="text-amber-600 ml-1">
                        (termasuk {totalKg - jumlah} kg selisih)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    Total semua kemasan: <strong>{totalKg} kg</strong>
                    {totalKg < jumlah && (
                      <span className="text-red-500 ml-1">
                        — kurang {jumlah - totalKg} kg
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
