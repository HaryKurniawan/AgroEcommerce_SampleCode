"use client";

import React from "react";
import { MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import type { ApiAddressData } from "@/types";

interface BulkOrderStep3AddressProps {
  addresses: ApiAddressData[];
  selectedAddressId: string;
  addressesLoading: boolean;
  onAddressSelect: (id: string) => void;
  // Kept for backward compatibility if page.tsx still passes them, but won't be used
  useManual?: boolean;
  manualAlamat?: string;
  onManualAddressToggle?: (useManual: boolean) => void;
  onManualAlamatChange?: (alamat: string) => void;
  onNavigateToForm?: () => void;
}

export const BulkOrderStep3Address: React.FC<BulkOrderStep3AddressProps> = ({
  addresses,
  selectedAddressId,
  addressesLoading,
  onAddressSelect,
}) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900 leading-tight">
              Alamat
            </h2>
          </div>
          {addresses.length > 0 && !addressesLoading && (
            <button
              onClick={() => {
                const currentUrl =
                  window.location.pathname + window.location.search;
                router.push(
                  `/profil/alamat?redirect=${encodeURIComponent(currentUrl)}`,
                );
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 active:scale-95 transition-all flex items-center gap-1"
            >
              <Plus size={12} />
              Alamat lain
            </button>
          )}
        </div>

        {/* Loading state */}
        {addressesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Belum Ada Alamat</p>
            <p className="text-sm text-gray-500 mb-4">
              Tambahkan alamat pengiriman terlebih dahulu agar pesanan bisa
              dikirim.
            </p>
            <button
              onClick={() => {
                const currentUrl =
                  window.location.pathname + window.location.search;
                router.push(
                  `/profil/alamat/form?redirect=${encodeURIComponent(currentUrl)}`,
                );
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium text-sm rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-[0.97]"
            >
              <Plus size={16} />
              Tambah Alamat Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses
              .filter((a) => String(a.id) === selectedAddressId)
              .map((addr) => {
                const isSelected = selectedAddressId === String(addr.id);
                return (
                  <label
                    key={addr.id}
                    htmlFor={`addr-${addr.id}`}
                    className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all overflow-hidden ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      id={`addr-${addr.id}`}
                      type="radio"
                      name="address"
                      value={String(addr.id)}
                      checked={isSelected}
                      onChange={(e) => {
                        onAddressSelect(e.target.value);
                      }}
                      className="sr-only" // Sembunyikan radio button bawaan
                    />

                    <div className="flex justify-between items-start w-full">
                      <div className="flex-1">
                        {/* Header: Nama, Telepon & Badges */}
                        <div className="flex items-start justify-start w-full mb-1.5 gap-2">
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold uppercase">
                              {addr.label || addr.penerima}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                                Utama
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Alamat */}
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col mt-0.5 items-start">
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {addr.alamat},{" "}
                              {addr.kecamatan ? `${addr.kecamatan}, ` : ""}
                              {addr.kota}, {addr.provinsi}{" "}
                              {addr.kodePos ? addr.kodePos : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
