"use client";

import { useState, useEffect, useCallback } from "react";

import { usersApi } from "@/lib/ecommerce-api";

import { CourierPicker, CourierItem } from "./CourierPicker";

export interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
  sellerProfile?: {
    storeName: string;
    status: string;
    store?: {
      id: string;
      nama: string;
      kabupaten: string;
      wilayah: string;
      status: string;
      courierStaffId: string | null;
      courierStaff: {
        id: string;
        name: string | null;
        email: string;
      } | null;
      kurirStaffs?: Array<{
        id: string;
        name: string | null;
        email: string;
        noTelepon?: string | null;
      }>;
    } | null;
  } | null;
}

interface SellerCourierSettingsProps {
  seller: SellerInfo;
  onClose: () => void;
  onUpdated: () => void;
}

type SettingsAction = "view" | "change" | "create_new";

const extractList = (
  res: { data?: { data?: unknown[] } | unknown[] } | unknown,
): unknown[] => {
  const body = (res as { data?: { data?: unknown[] } | unknown[] })?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray((body as { data?: unknown[] })?.data))
    return (body as { data: unknown[] }).data;
  return [];
};

export function SellerCourierSettings({
  seller,
  onClose,
  onUpdated,
}: SellerCourierSettingsProps) {
  const [action, setAction] = useState<SettingsAction>("view");
  const [couriers, setCouriers] = useState<CourierItem[]>([]);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newCourier, setNewCourier] = useState({
    name: "",
    email: "",
    password: "",
  });

  const store = seller.sellerProfile?.store;
  const currentCourier = store?.courierStaff;

  const fetchCouriers = useCallback(async () => {
    setCouriersLoading(true);
    try {
      const res = await usersApi.getAllCouriersForSelection();
      setCouriers(extractList(res) as CourierItem[]);
    } catch (err) {
      console.error("Error fetching couriers:", err);
    } finally {
      setCouriersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (action === "change" && couriers.length === 0) {
      Promise.resolve().then(() => fetchCouriers());
    }
  }, [action, couriers.length, fetchCouriers]);

  const handleAssign = async () => {
    if (!store || !selectedCourierId) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await usersApi.updateSellerCourierAffiliation(store.id, {
        action: "assign",
        courierUserId: selectedCourierId,
      });
      setSuccess("Kurir berhasil diafiliasikan!");
      setAction("view");
      onUpdated();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Gagal mengafiliasikan kurir");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNew = async () => {
    if (!store || !newCourier.name || !newCourier.email || !newCourier.password)
      return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await usersApi.updateSellerCourierAffiliation(store.id, {
        action: "create_new",
        courierName: newCourier.name,
        courierEmail: newCourier.email,
        courierPassword: newCourier.password,
      });
      setSuccess("Kurir baru berhasil dibuat dan diafiliasikan!");
      setAction("view");
      setNewCourier({ name: "", email: "", password: "" });
      onUpdated();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Gagal membuat kurir baru");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (courierId: string) => {
    if (!store) return;
    if (!confirm("Yakin ingin melepas kurir ini dari toko?")) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await usersApi.updateSellerCourierAffiliation(store.id, {
        action: "remove",
        courierUserId: courierId,
      });
      setSuccess("Afiliasi kurir berhasil dilepas.");
      onUpdated();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Gagal melepas kurir");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tutup"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 w-full h-full border-none outline-none cursor-default"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-5 border-b flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                ⚙️ Pengaturan Afiliasi Kurir
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Toko:{" "}
                <span className="font-semibold text-slate-700">
                  {store?.nama || seller.sellerProfile?.storeName || "—"}
                </span>
                {store?.kabupaten && (
                  <span className="text-slate-400"> · {store.kabupaten}</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-500 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200">
                ✅ {success}
              </div>
            )}

            {/* Current state */}
            <div className="p-4 rounded-xl border bg-slate-50 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daftar Kurir Terafiliasi
              </p>
              {store?.kurirStaffs && store.kurirStaffs.length > 0 ? (
                <div className="space-y-3">
                  {(() => {
                    const kurirStaffsList = store.kurirStaffs || [];
                    return (
                      <>
                        {kurirStaffsList.map((courier) => (
                          <div
                            key={courier.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                          >
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {courier.name
                                ? courier.name.charAt(0).toUpperCase()
                                : "K"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">
                                {courier.name || "Nama belum diatur"}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {courier.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                AKTIF
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemove(courier.id)}
                                disabled={
                                  submitting || kurirStaffsList.length <= 1
                                }
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                title={
                                  kurirStaffsList.length <= 1
                                    ? "Minimal 1 kurir wajib terhubung ke toko"
                                    : "Lepas kurir"
                                }
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        {kurirStaffsList.length <= 1 && (
                          <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1 px-1">
                            ⚠️ Minimal 1 kurir wajib aktif untuk setiap toko.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : currentCourier ? (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {currentCourier.name
                      ? currentCourier.name.charAt(0).toUpperCase()
                      : "K"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {currentCourier.name || "Nama belum diatur"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentCourier.email}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                    AKTIF
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-sm">⚠️</span>
                  <span className="text-xs font-semibold">
                    Belum ada kurir terafiliasi
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {action === "view" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAction("change")}
                  className="w-full p-3.5 text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                >
                  <span className="font-semibold text-slate-800">
                    📋 Pilih & Tambah Kurir
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hubungkan kurir lain yang sudah terdaftar di sistem
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setAction("create_new")}
                  className="w-full p-3.5 text-left rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm"
                >
                  <span className="font-semibold text-slate-800">
                    🆕 Buat Kurir Baru
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Buat akun kurir baru dan otomatis hubungkan ke toko
                  </p>
                </button>
              </div>
            )}

            {/* Change courier */}
            {action === "change" && (
              <div>
                <CourierPicker
                  couriers={couriers}
                  selectedId={selectedCourierId}
                  onSelect={setSelectedCourierId}
                  loading={couriersLoading}
                />
              </div>
            )}

            {/* Create new courier */}
            {action === "create_new" && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700">
                  🏍️ Data Kurir Baru
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label
                      htmlFor="new-courier-name"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Nama *
                    </label>
                    <input
                      id="new-courier-name"
                      type="text"
                      value={newCourier.name}
                      onChange={(e) =>
                        setNewCourier({ ...newCourier, name: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                      placeholder="Nama kurir"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-courier-email"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      id="new-courier-email"
                      type="email"
                      value={newCourier.email}
                      onChange={(e) =>
                        setNewCourier({
                          ...newCourier,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                      placeholder="kurir@agrojabar.id"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-courier-password"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Password *
                    </label>
                    <input
                      id="new-courier-password"
                      type="password"
                      value={newCourier.password}
                      onChange={(e) =>
                        setNewCourier({
                          ...newCourier,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                      placeholder="Min. 6 karakter"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-slate-50 flex gap-2 justify-end">
            {action !== "view" && (
              <button
                type="button"
                onClick={() => {
                  setAction("view");
                  setError("");
                  setSelectedCourierId(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                ← Kembali
              </button>
            )}
            {action === "change" && (
              <button
                type="button"
                onClick={handleAssign}
                disabled={submitting || !selectedCourierId}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
            {action === "create_new" && (
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={
                  submitting ||
                  !newCourier.name ||
                  !newCourier.email ||
                  !newCourier.password
                }
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-all"
              >
                {submitting ? "Membuat..." : "Buat & Afiliasikan"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
