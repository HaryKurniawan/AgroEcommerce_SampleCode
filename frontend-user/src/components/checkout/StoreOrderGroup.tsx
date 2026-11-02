import React from "react";
import Image from "next/image";
import { Store, Loader2, CheckCircle2 } from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";
import type { ApiOrderItem, ApiShippingInfo } from "@/types";

interface StoreOrderGroupProps {
  storeId: string;
  storeName: string;
  items: ApiOrderItem[];
  shipping?: ApiShippingInfo;
  loadingShipping: boolean;
  catatan: string;
  onCatatanChange: (text: string) => void;
  hasSelectedAddress: boolean;
}

const StoreOrderGroup: React.FC<StoreOrderGroupProps> = ({
  storeName,
  items,
  shipping,
  loadingShipping,
  catatan,
  onCatatanChange,
  hasSelectedAddress,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden font-normal text-gray-700">
      {/* Store Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 text-gray-900 flex items-center gap-2 font-normal">
        <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
          <Store size={12} className="text-gray-500" />
        </span>
        <span className="font-normal">{storeName}</span>
      </div>

      {/* Items list */}
      <div className="divide-y divide-gray-100 font-normal">
        {items.map((item, index) => (
          <div
            key={item.id_itemPesanan || item.produkId || index}
            className="p-5 flex gap-4 font-normal"
          >
            <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 font-normal">
              {item.gambar ? (
                <Image
                  src={item.gambar}
                  alt={item.produkNama || "Produk"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-normal">
                  {item.gambar || <Store size={24} />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 font-normal">
              <p className="text-gray-900 line-clamp-1 text-sm font-normal">
                {item.produkNama || "Produk"}
              </p>
              <div className="text-xs text-gray-500 mt-1 font-normal">
                {item.jumlah} {item.satuan || ""} x {formatRupiah(item.harga)}
              </div>
            </div>
            <div className="text-gray-900 text-sm font-normal">
              {formatRupiah(Number(item.harga) * Number(item.jumlah))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Shipping Options */}
      <div className="p-5 bg-white border-t border-gray-100 space-y-4 font-normal">
        <input
          aria-label="Tinggalkan pesan"
          type="text"
          placeholder="Tinggalkan pesan (opsional)"
          value={catatan}
          onChange={(e) => onCatatanChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-normal"
        />

        <div className="pt-3 border-t border-gray-200/60 font-normal">
          {loadingShipping ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 font-normal">
              <Loader2 size={16} className="animate-spin text-primary-500" />
              Menghitung biaya pengiriman...
            </div>
          ) : shipping ? (
            <div className="space-y-3 font-normal">
              <div className="flex justify-between items-center text-xs text-gray-500 font-normal">
                <span className="font-normal">Metode Pengiriman</span>
                <span className="font-normal">
                  Jarak: {(shipping.distanceKm || 0).toFixed(1)} km | Berat:{" "}
                  {(shipping.totalWeightKg || 0).toFixed(1)} kg
                </span>
              </div>

              <div
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between font-normal ${
                  shipping.isAvailable
                    ? "bg-white border-gray-200 hover:border-gray-300"
                    : "bg-white border-red-200"
                }`}
              >
                <div className="w-full flex justify-between items-start font-normal">
                  <div className="font-normal text-sm text-gray-900 flex items-center gap-1.5">
                    Kurir Reguler (Lokal)
                    {shipping.isAvailable && (
                      <CheckCircle2 size={14} className="text-primary-500" />
                    )}
                  </div>
                  <div className="font-normal text-sm text-gray-900">
                    {!shipping.isAvailable ? (
                      <span className="text-red-500 font-normal">
                        Tidak Tersedia
                      </span>
                    ) : shipping.ongkir === 0 ? (
                      <span className="text-primary-600 font-normal">
                        Gratis
                      </span>
                    ) : (
                      formatRupiah(shipping.ongkir)
                    )}
                  </div>
                </div>

                <div
                  className={`font-normal text-xs mt-2 ${
                    shipping.isAvailable ? "text-gray-500" : "text-red-500"
                  }`}
                >
                  {shipping.keterangan}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500/80 italic font-normal">
              {hasSelectedAddress
                ? "Gagal menghitung biaya pengiriman"
                : "Pilih alamat untuk melihat biaya pengiriman"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOrderGroup;
