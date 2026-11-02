"use client";

import React from "react";

import { formatRupiah } from "@/lib/ecommerce-api";

interface PackagingSpec {
  ukuranKg: number;
  jumlahBungkus: number;
}

interface BulkOrderSummaryProps {
  product: {
    satuan?: string;
    harga: number;
  } | null;
  jumlah: number;
  packagingSpecs: PackagingSpec[];
  diskonGrosirPersen?: number;
  ongkosKirimGrosir?: number;
  currentStep: number;
}

export const BulkOrderSummary: React.FC<BulkOrderSummaryProps> = ({
  product,
  jumlah,
  packagingSpecs,
  diskonGrosirPersen = 0,
  ongkosKirimGrosir = 0,
  currentStep,
}) => {
  if (!product || currentStep !== 3) return null;

  const harga = product.harga || 0;
  const subtotal = harga * jumlah;

  const nominalDiskon =
    diskonGrosirPersen > 0 ? (subtotal * diskonGrosirPersen) / 100 : 0;

  // Gratis Ongkir jika pembelian >= 300kg
  const finalOngkir = jumlah >= 300 ? 0 : ongkosKirimGrosir;
  const totalEstimate = subtotal - nominalDiskon + finalOngkir;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
      <h3 className="font-semibold text-gray-900 mb-5">Ringkasan Pengajuan</h3>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Harga / {product.satuan}</span>
          <span className="font-semibold text-gray-800">
            {formatRupiah(harga)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Jumlah</span>
          <span className="font-semibold text-gray-800">
            {jumlah.toLocaleString()} {product.satuan}
          </span>
        </div>

        {/* Packaging Specification Summary */}
        {packagingSpecs.length > 0 && (
          <div className="pt-3 border-t border-dashed border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium mb-2">
              Jenis Kemasan
            </p>
            <div className="space-y-1.5">
              {packagingSpecs.map((spec, idx) => {
                const bungkus = spec.jumlahBungkus;
                const totalSpec = spec.ukuranKg * bungkus;
                const sisa = totalSpec - jumlah;
                return (
                  <div key={idx} className="text-xs text-gray-700">
                    <span className="font-semibold">
                      {spec.ukuranKg}kg × {bungkus} bungkus
                    </span>
                    <span className="text-gray-400 ml-1">({totalSpec}kg)</span>
                    {sisa > 0 && (
                      <span className="text-amber-500 ml-1 text-[10px]">
                        +{sisa}kg dibulatkan
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-dashed border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Subtotal</p>
          <p className="font-semibold text-gray-800">
            {formatRupiah(subtotal)}
          </p>

          {diskonGrosirPersen > 0 && (
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-gray-400 font-medium">
                Diskon Grosir ({diskonGrosirPersen}%)
              </p>
              <p className="font-medium text-red-500 text-sm">
                -{formatRupiah(nominalDiskon)}
              </p>
            </div>
          )}

          {finalOngkir > 0 ? (
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-gray-400 font-medium">
                Ongkos Kirim
              </p>
              <p className="font-medium text-gray-800 text-sm">
                +{formatRupiah(finalOngkir)}
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-gray-400 font-medium">
                Ongkos Kirim
              </p>
              <p className="font-medium text-emerald-600 text-sm">Gratis</p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">
                Estimasi Nilai Pesanan
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight text-right">
              {formatRupiah(totalEstimate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
