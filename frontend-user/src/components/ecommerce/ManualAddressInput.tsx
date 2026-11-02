"use client";

import React from "react";

interface ManualAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onUseSaved: () => void;
  hasAddresses?: boolean;
  required?: boolean;
}

export const ManualAddressInput: React.FC<ManualAddressInputProps> = ({
  value,
  onChange,
  onUseSaved,
  hasAddresses = false,
  required = false,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Alamat Pengiriman Manual
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Masukkan alamat lengkap pengiriman di sini..."
          className="w-full h-28 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white focus:border-transparent transition-all resize-none"
        />
      </div>

      {hasAddresses && (
        <button
          type="button"
          onClick={onUseSaved}
          className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline"
        >
          ← Gunakan alamat tersimpan
        </button>
      )}
    </div>
  );
};
