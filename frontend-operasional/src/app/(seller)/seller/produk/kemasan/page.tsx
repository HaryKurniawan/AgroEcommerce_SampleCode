"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Package2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Edit2,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { formatRupiah } from "@/lib/ecommerce-api";

interface VarianKemasan {
  id: string;
  ukuranKg: number;
  biayaTambahan: number;
  stokKemasan: number;
  isActive: boolean;
}

interface ProductWithVarian {
  id: string;
  nama: string;
  gambarUrl?: string;
  satuan?: string;
  harga: number;
  varian: VarianKemasan[];
}

export default function KemasanSettingPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithVarian[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Editing state: { productId, varianId } → new biaya
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Get product list from seller's store (same approach as margin page)
      const summaryRes = await apiClient.get("/toko/harga/summary");
      const rawList: any[] = summaryRes?.data?.data?.products || [];

      // Fetch varian for each product in parallel
      const withVarian: ProductWithVarian[] = await Promise.all(
        rawList.map(async (p: any) => {
          try {
            const varianRes = await apiClient.get(
              `/ecom-produk/${p.id}/varian`,
            );
            return {
              id: p.id,
              nama: p.namaEtalase || p.nama,
              gambarUrl: p.gambarUrl,
              satuan: p.satuan,
              harga: p.hargaJual || p.harga,
              varian: varianRes.data || [],
            };
          } catch {
            return {
              id: p.id,
              nama: p.namaEtalase || p.nama,
              gambarUrl: p.gambarUrl,
              satuan: p.satuan,
              harga: p.hargaJual || p.harga,
              varian: [],
            };
          }
        }),
      );

      // Only show products that have at least 1 varian
      setProducts(withVarian.filter((p) => p.varian.length > 0));
    } catch (err) {
      console.error(err);
      showMessage("error", "Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSave = async (varianId: string) => {
    setSavingId(varianId);
    try {
      await apiClient.patch(`/ecom-produk/varian/${varianId}`, {
        biayaTambahan: editValue,
      });
      showMessage("success", "Biaya kemasan berhasil disimpan!");
      setEditingId(null);
      // Refresh varian data for the updated product
      await fetchProducts();
    } catch (err: any) {
      showMessage(
        "error",
        err?.response?.data?.message || "Gagal menyimpan biaya kemasan.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (varianId: string, current: boolean) => {
    setSavingId(varianId);
    try {
      await apiClient.patch(`/ecom-produk/varian/${varianId}`, {
        isActive: !current,
      });
      showMessage(
        "success",
        `Kemasan berhasil ${!current ? "diaktifkan" : "dinonaktifkan"}.`,
      );
      await fetchProducts();
    } catch (err: any) {
      showMessage(
        "error",
        err?.response?.data?.message || "Gagal mengubah status kemasan.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">
                Setting Kemasan
              </h1>
              <p className="text-xs text-gray-400">
                Atur biaya plastik/karung per bungkus untuk setiap kemasan
                produk
              </p>
            </div>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-800">
              Cara Kerja Biaya Kemasan Grosir
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Biaya kemasan ditampilkan kepada pembeli saat mereka mengisi form
              pengajuan grosir dan memilih ukuran kemasan. Isi{" "}
              <strong>0</strong> jika biaya kemasan sudah termasuk dalam harga
              produk. Biaya hanya berlaku untuk kemasan yang{" "}
              <strong>Aktif</strong>.
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-400">Memuat data kemasan...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package2 size={28} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600">
              Belum Ada Varian Kemasan
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
              Varian kemasan muncul otomatis saat ada stok masuk dari gudang
              dengan spesifikasi kemasan tertentu (ukuran bungkus).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                {/* Product Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                    {product.gambarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.gambarUrl}
                        alt={product.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {product.nama}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRupiah(product.harga)}/{product.satuan} •{" "}
                      {product.varian.length} varian kemasan
                    </p>
                  </div>
                </div>

                {/* Varian List */}
                <div className="divide-y divide-gray-50">
                  {product.varian.map((varian) => {
                    const isEditing = editingId === varian.id;
                    const isSaving = savingId === varian.id;
                    return (
                      <div
                        key={varian.id}
                        className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                          !varian.isActive ? "opacity-50" : ""
                        } ${isEditing ? "bg-emerald-50/30" : "hover:bg-gray-50/50"}`}
                      >
                        {/* Left: kemasan info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              varian.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-gray-100 text-gray-400 border-gray-100"
                            }`}
                          >
                            {varian.ukuranKg} kg
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                              Stok kemasan:{" "}
                              <strong className="text-gray-700">
                                {varian.stokKemasan}
                              </strong>{" "}
                              unit
                            </p>
                            {isEditing ? null : (
                              <p
                                className={`text-xs font-semibold mt-0.5 ${
                                  varian.biayaTambahan > 0
                                    ? "text-emerald-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {varian.biayaTambahan > 0
                                  ? `+${formatRupiah(varian.biayaTambahan)} / bungkus`
                                  : "Biaya: Gratis"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isEditing ? (
                            <>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                                  Rp
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) =>
                                    setEditValue(Number(e.target.value))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleSave(varian.id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  className="w-32 pl-8 pr-2 py-1.5 text-xs font-semibold border border-emerald-300 bg-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-400"
                                  placeholder="0"
                                />
                              </div>
                              <button
                                onClick={() => handleSave(varian.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold disabled:opacity-60"
                              >
                                {isSaving ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Save size={11} />
                                )}
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(varian.id);
                                  setEditValue(varian.biayaTambahan);
                                }}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Edit2 size={11} />
                                Ubah Biaya
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleActive(varian.id, varian.isActive)
                                }
                                disabled={isSaving}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                                  varian.isActive
                                    ? "bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                }`}
                              >
                                {isSaving ? (
                                  <Loader2
                                    size={11}
                                    className="animate-spin inline"
                                  />
                                ) : varian.isActive ? (
                                  "Nonaktifkan"
                                ) : (
                                  "Aktifkan"
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
