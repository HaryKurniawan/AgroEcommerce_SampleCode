"use client";

import React from "react";
import { PencilLine } from "lucide-react";

interface BulkOrderStep2DetailsProps {
  catatan: string;
  onCatatanChange: (catatan: string) => void;
}

export const BulkOrderStep2Details: React.FC<BulkOrderStep2DetailsProps> = ({
  catatan,
  onCatatanChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <PencilLine size={18} className="text-primary-600" />
            </div>
            <label
              htmlFor="catatan"
              className="font-semibold text-gray-900 leading-tight cursor-pointer"
            >
              Catatan
            </label>
          </div>
          <span className="text-xs text-gray-400 font-medium">(opsional)</span>
        </div>

        <div>
          <textarea
            id="catatan"
            value={catatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            placeholder="Contoh: butuh pengiriman pagi hari, kemasan kayu, dll..."
            className="w-full h-24 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all resize-none"
          />
          <p className="mt-2 text-[10px] text-gray-400">
            Sampaikan instruksi khusus ke penjual, seperti waktu pengiriman,
            jenis kemasan tambahan, dsb.
          </p>
        </div>
      </div>
    </div>
  );
};
