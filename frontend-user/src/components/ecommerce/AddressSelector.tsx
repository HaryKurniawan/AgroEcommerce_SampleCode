"use client";

import React from "react";
import { MapPin, Plus } from "lucide-react";

import type { ApiAddressData } from "@/types";

interface AddressSelectorProps {
  addresses: ApiAddressData[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  onManualAddress: () => void;
  loading?: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onManualAddress,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return null; // AddressButton component will handle empty state
  }

  return (
    <div className="space-y-3">
      {/* Header with manual address option */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Pilih Alamat Pengiriman
        </h3>
        <button
          type="button"
          onClick={onManualAddress}
          className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
        >
          <Plus size={12} />
          Alamat lain
        </button>
      </div>

      {/* Address list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === String(addr.id);
          return (
            <label
              key={addr.id}
              htmlFor={`address-${addr.id}`}
              aria-label={`Pilih alamat ${addr.penerima || addr.label}`}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary-500 bg-primary-50/50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="mt-0.5 relative flex items-center justify-center flex-shrink-0">
                <input
                  id={`address-${addr.id}`}
                  type="radio"
                  name="addressSelection"
                  checked={isSelected}
                  onChange={() => onAddressSelect(String(addr.id))}
                  className="peer sr-only"
                />
                <div
                  className={`w-5 h-5 border-2 rounded-full transition-all ${
                    isSelected
                      ? "border-primary-500 border-[6px]"
                      : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {addr.penerima || addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex-shrink-0">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  {addr.alamat}, {addr.kota}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
