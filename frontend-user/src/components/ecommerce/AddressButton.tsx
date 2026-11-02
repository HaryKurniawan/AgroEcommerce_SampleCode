"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface AddressButtonProps {
  onNavigateToForm: () => void;
  onManualAddress: () => void;
}

export const AddressButton: React.FC<AddressButtonProps> = ({
  onNavigateToForm,
  onManualAddress,
}) => {
  return (
    <div className="text-center py-6 bg-orange-50 rounded-2xl border border-orange-100">
      <MapPin size={28} className="text-orange-400 mx-auto mb-3" />
      <p className="font-semibold text-sm text-gray-800 mb-1">
        Belum Ada Alamat Tersimpan
      </p>
      <p className="text-xs text-gray-500 mb-4 px-4">
        Tambah alamat di profil kamu terlebih dahulu, atau isi manual di bawah
        ini.
      </p>
      <div className="flex flex-col gap-2 px-6">
        <button
          type="button"
          onClick={onNavigateToForm}
          className="py-2.5 px-4 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-all"
        >
          Isi Alamat
        </button>
        <button
          type="button"
          onClick={onManualAddress}
          className="py-2.5 px-4 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Isi Alamat Manual
        </button>
      </div>
    </div>
  );
};
