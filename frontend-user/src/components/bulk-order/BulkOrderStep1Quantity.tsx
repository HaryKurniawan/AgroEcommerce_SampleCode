"use client";

import React from "react";
import { Scale, AlertCircle, CheckCircle2, Truck, Info } from "lucide-react";
import Image from "next/image";

interface BulkOrderStep1QuantityProps {
  product: {
    id_produk: string;
    nama?: string;
    gambarUrl?: string;
    harga: number;
    satuan?: string;
    stok?: number;
  } | null;
  jumlah: number;
  onJumlahChange: (value: number) => void;
  tanggalPengiriman: string;
  onTanggalPengirimanChange: (value: string) => void;
}

const QUICK_AMOUNTS = [300, 500, 1000, 2000, 5000];

import { formatRupiah } from "@/lib/ecommerce-api";

export const BulkOrderStep1Quantity: React.FC<BulkOrderStep1QuantityProps> = ({
  product,
  jumlah,
  onJumlahChange,
  tanggalPengiriman,
  onTanggalPengirimanChange,
}) => {
  if (!product) return null;

  const productStok = product.stok || 0;
  const minGrosir = Math.max(100, productStok + 1);

  // Calculate current capacity based on selected date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateObj = new Date(tanggalPengiriman);
  selectedDateObj.setHours(0, 0, 0, 0);
  const diffTime = selectedDateObj.getTime() - today.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 2) diffDays = 2;

  const maxCapacityForSelectedDate = (diffDays - 1) * 1000;
  const maxAllowed = Math.min(productStok, maxCapacityForSelectedDate);

  const isValid = jumlah >= minGrosir && jumlah <= maxAllowed;

  const handleChange = (val: number) => {
    let finalVal = Math.max(0, val);
    if (finalVal > productStok) {
      finalVal = productStok;
    }
    onJumlahChange(finalVal);

    // Auto-adjust date if needed
    const requiredDays = Math.ceil(finalVal / 1000) + 1;
    if (requiredDays > diffDays) {
      const newD = new Date();
      newD.setDate(newD.getDate() + requiredDays);
      onTanggalPengirimanChange(newD.toISOString().split("T")[0]);
    }
  };

  // Generate date options based on max stock capacity
  const dateOptions = [];
  const maxDaysNeeded = Math.ceil(productStok / 1000) + 1;
  const maxDaysOptions = Math.max(2, maxDaysNeeded);

  for (let i = 2; i <= maxDaysOptions; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const capacity = (i - 1) * 1000;
    const finalCapacity = Math.min(capacity, productStok);
    dateOptions.push({
      dateStr,
      label: `H+${i} (${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}) - Max ${finalCapacity} kg`,
      capacity: finalCapacity,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Scale size={16} className="text-emerald-600" />
          </div>
          <h2 className="font-semibold text-gray-900">
            Berapa yang ingin dipesan?
          </h2>
        </div>

        {/* Product card */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
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

        {/* Date Selection input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            Tanggal Pengiriman
          </label>
          <select
            value={tanggalPengiriman}
            onChange={(e) => {
              onTanggalPengirimanChange(e.target.value);
              // Calculate capacity for the new date to optionally limit the amount
              const newSelectedDateObj = new Date(e.target.value);
              newSelectedDateObj.setHours(0, 0, 0, 0);
              const newDiffTime =
                newSelectedDateObj.getTime() - today.getTime();
              let newDiffDays = Math.ceil(newDiffTime / (1000 * 60 * 60 * 24));
              if (newDiffDays < 2) newDiffDays = 2;

              const newMaxCapacity = (newDiffDays - 1) * 1000;
              const newMaxAllowed = Math.min(productStok, newMaxCapacity);

              if (jumlah > newMaxAllowed) {
                onJumlahChange(newMaxAllowed);
              }
            }}
            className="w-full h-14 bg-gray-50 border border-gray-200/80 rounded-2xl px-5 text-base sm:text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
          >
            {dateOptions.map((opt) => (
              <option key={opt.dateStr} value={opt.dateStr}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Kapasitas pengiriman gudang adalah 1000 kg per hari.
          </p>
        </div>

        {/* Amount input */}
        <div className="mb-2">
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            Total Pesanan
          </label>
          <div className="relative">
            <input
              type="number"
              min={minGrosir}
              max={maxAllowed}
              required
              value={jumlah || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  handleChange(0);
                } else {
                  handleChange(parseInt(val) || 0);
                }
              }}
              onBlur={() => {
                if (jumlah > 0 && jumlah < minGrosir) {
                  handleChange(minGrosir);
                }
                if (jumlah > productStok) {
                  handleChange(productStok);
                }
              }}
              placeholder="Masukkan jumlah pesanan..."
              className="w-full h-14 bg-gray-50 border border-gray-200/80 rounded-2xl px-5 pr-16 text-lg sm:text-xl font-semibold text-gray-900 placeholder:font-normal placeholder:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
              {product.satuan}
            </div>
          </div>

          {/* Validation message */}
          {jumlah > 0 && jumlah < minGrosir ? (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5 font-medium">
              <AlertCircle size={12} />
              Minimal pemesanan grosir adalah {minGrosir} {product.satuan}
            </p>
          ) : jumlah > maxAllowed ? (
            <p className="mt-2 text-xs text-amber-500 flex items-center gap-1.5 font-medium">
              <AlertCircle size={12} />
              Kapasitas maksimal untuk tanggal terpilih adalah {maxAllowed}{" "}
              {product.satuan}. Silakan pilih tanggal lebih lama jika ingin
              memesan lebih banyak, atau input akan otomatis menyesuaikan
              tanggal pengiriman.
            </p>
          ) : jumlah >= minGrosir ? (
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
                  <span>Dikenakan Ongkir Grosir (Gratis jika &ge; 300 kg)</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
