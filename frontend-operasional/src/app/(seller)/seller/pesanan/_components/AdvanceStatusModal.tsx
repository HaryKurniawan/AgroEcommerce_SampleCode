import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  Truck,
  User,
  Upload as UploadIcon,
  Mail,
} from "lucide-react";

import { apiClient } from "@/lib/ecommerce-api";

import { OrderItem } from "../_hooks/useSellerOrders";
import { getNextStatus, getStatusLabel } from "../../_utils/shipping-status";

interface CourierItem {
  id: string;
  nama?: string;
  name?: string | null;
  noTelepon?: string | null;
  phoneNumber?: string | null;
}

interface AdvanceStatusModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onConfirm: (
    note: string,
    kurirId?: string,
    sendEmailNotification?: boolean,
  ) => void;
  loading: boolean;
  couriers?: CourierItem[];
}

const AdvanceStatusModal: React.FC<AdvanceStatusModalProps> = ({
  order,
  onClose,
  onConfirm,
  loading,
  couriers = [],
}) => {
  const [note, setNote] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextStatus = order ? getNextStatus(order.shipping?.status ?? "") : null;
  const isHandover = nextStatus === "PICKUP_CONFIRMATION";

  // Automatically select courier if there is only 1 available
  useEffect(() => {
    if (isHandover && couriers.length === 1) {
      setSelectedCourierId(couriers[0].id);
    }
  }, [couriers, isHandover]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !order) return null;

  const canConfirm =
    (!isHandover || (couriers.length > 0 && !!selectedCourierId)) && !uploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmAction = async () => {
    try {
      setUploading(true);
      let fotoUrl = undefined;

      if (fotoFile) {
        const formData = new FormData();
        formData.append("file", fotoFile);
        const uploadRes = await apiClient.post(
          "/upload/pesanan/gambar",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        fotoUrl = uploadRes.data?.data?.url;
      }

      if (fotoUrl) {
        // Panggil update status order dulu dengan foto URL
        await apiClient.patch(`/ecom-pesanan/${order.id}/status`, {
          status: order.status,
          fotoSebelumKirimUrl: fotoUrl,
        });
      }

      onConfirm(
        note,
        isHandover ? selectedCourierId : undefined,
        isHandover ? sendEmailNotification : undefined,
      );
    } catch (err: any) {
      alert(
        "Gagal mengupload foto atau memperbarui pesanan: " +
          (err.message || ""),
      );
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <>
      {/* Single backdrop — only rendered when order is not null (guarded above) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Tutup"
      />
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-medium text-sm text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Update Status Pengiriman
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Status Indicator */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-0.5">
                  Status Berikutnya
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {getStatusLabel(nextStatus || "")}
                </p>
              </div>
            </div>

            {/* Courier Selector - Only for Handover step */}
            {isHandover && (
              <div className="space-y-3">
                {couriers.length === 0 ? (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-lg p-3 text-[11px] font-medium flex items-start gap-2">
                    <span>⚠️</span>
                    <p className="leading-relaxed">
                      Toko Anda belum memiliki kurir. Silakan hubungi admin
                      pusat.
                    </p>
                  </div>
                ) : couriers.length === 1 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-medium text-sm uppercase shrink-0">
                      {(couriers[0].nama || couriers[0].name || "K").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-medium rounded uppercase">
                        Kurir Otomatis
                      </span>
                      <p className="text-xs font-medium text-slate-800 mt-1 truncate">
                        {couriers[0].nama || couriers[0].name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Pilih Kurir *
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        value={selectedCourierId}
                        onChange={(e) => setSelectedCourierId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 transition-colors bg-white cursor-pointer appearance-none font-medium"
                      >
                        <option value="" disabled>
                          -- Pilih Kurir --
                        </option>
                        {couriers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-600">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium text-slate-800"
                placeholder="Tulis catatan..."
              />
            </div>

            {/* Foto Sebelum Kirim (Hanya untuk Handover) */}
            {isHandover && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-600">
                  Foto Pesanan (Opsional)
                </label>

                {!fotoPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-emerald-500 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <UploadIcon size={18} className="mb-1.5" />
                    <span className="text-[10px] font-medium">
                      Klik untuk upload foto
                    </span>
                  </div>
                ) : (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setFotoPreview(null);
                        setFotoFile(null);
                      }}
                      className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Email Notification Toggle */}
            {isHandover && couriers.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-800">
                      Notifikasi Email Kurir
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSendEmailNotification(!sendEmailNotification)
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sendEmailNotification ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      sendEmailNotification ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Confirm Button */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-medium hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={loading || uploading || !canConfirm}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-[11px] transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center justify-center gap-1.5"
              >
                {loading || uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Truck size={14} />
                )}
                {loading || uploading ? "Memproses..." : "Konfirmasi & Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AdvanceStatusModal;
