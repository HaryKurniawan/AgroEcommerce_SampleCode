"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  Plus,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

import {
  FormItem,
  ProductData,
  GudangData,
  RETAIL_KG,
  MEDIUM_KG,
} from "./_components/types";
import { SuccessModal } from "./_components/SuccessModal";
import { ErrorMinModal } from "./_components/ErrorMinModal";
import { ProductRequestItem } from "./_components/ProductRequestItem";
import { SummarySidebar } from "./_components/SummarySidebar";

// ─── Constants ─────────────────────────────────────────────────────────────────
const CART_KEY = "pengajuan_cart";

// ─── Helper ────────────────────────────────────────────────────────────────────
const totalKgOf = (it: { packRetail: number; packMedium: number }) =>
  Math.round((it.packRetail * RETAIL_KG + it.packMedium * MEDIUM_KG) * 10) / 10;

/**
 * Bagi total kg rata ke dua kemasan (50% medium, 50% retail).
 * Medium dibulatkan ke bawah, sisa kg masuk retail (1 kg pas).
 */
function bagiRata(targetKg: number): {
  packRetail: number;
  packMedium: number;
} {
  const safe = Math.max(0, targetKg);
  const setengah = safe / 2;
  const packMedium = Math.floor(setengah / MEDIUM_KG);
  const kgMedium = packMedium * MEDIUM_KG;
  const sisaKg = Math.round((safe - kgMedium) * 10) / 10;
  const packRetail = Math.ceil(sisaKg / RETAIL_KG);
  return { packRetail, packMedium };
}

// ─── localStorage ──────────────────────────────────────────────────────────────
function loadCart(): { gudangId: string; items: FormItem[] } | null {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveCart(gudangId: string, items: FormItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ gudangId, items }));
  } catch {
    /* ignore */
  }
}
function clearCart() {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {
    /* ignore */
  }
}

/** Migrasi item lama (format berbeda) → ke format pack */
function normalizeItem(raw: any): FormItem {
  if (
    typeof raw?.packRetail === "number" ||
    typeof raw?.packMedium === "number"
  ) {
    return {
      produkGudangId: raw.produkGudangId,
      packRetail: Number(raw.packRetail) || 0,
      packMedium: Number(raw.packMedium) || 0,
    };
  }
  const total = Number(raw?.jumlahPermintaan) || Number(raw?.totalKg) || 0;
  return {
    produkGudangId: raw.produkGudangId,
    packRetail: total,
    packMedium: 0,
  };
}

export default function NewStockRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gudangId = searchParams.get("gudangId") || "";

  const [gudang, setGudang] = useState<GudangData | null>(null);
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);
  const [items, setItems] = useState<FormItem[]>([]);

  // Toggle "custom kemasan" per produk (key = produkGudangId)
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  // Target kg acuan per produk (untuk bagi rata di mode custom)
  const [targetKg, setTargetKg] = useState<Record<string, number>>({});

  const [catatan, setCatatan] = useState("");
  const [tipePengiriman, setTipePengiriman] = useState<"DEFAULT" | "CUSTOM">(
    "DEFAULT",
  );
  const [tanggalPermintaanKirim, setTanggalPermintaanKirim] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showErrorMinModal, setShowErrorMinModal] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successGudangNama, setSuccessGudangNama] = useState("");

  // ── Init ─────────────────────────────────────────────────────────────────────
  const initPage = useCallback(async () => {
    if (!gudangId) {
      router.push("/seller/gudang/produk");
      return;
    }
    try {
      setLoading(true);

      const prodRes = await gudangApi.getProductsForRequest(gudangId);
      const responseData =
        prodRes?.data?.data?.data || prodRes?.data?.data || prodRes?.data || {};
      const products: ProductData[] = Array.isArray(responseData.products)
        ? responseData.products
        : [];
      setAvailableProducts(products);

      try {
        const whRes = await gudangApi.getAllWarehousesForMarketplace();
        const allWh = whRes?.data?.data || whRes?.data || [];
        const found = Array.isArray(allWh)
          ? allWh.find((w: any) => w.id === gudangId)
          : null;
        if (found)
          setGudang({ id: found.id, nama: found.nama, alamat: found.alamat });
      } catch {
        /* best-effort */
      }

      // Restore cart
      const saved = loadCart();
      if (saved?.gudangId === gudangId && saved.items.length > 0) {
        const valid = saved.items
          .filter((it) => products.some((p) => p.id === it.produkGudangId))
          .map(normalizeItem);
        if (valid.length > 0) {
          setItems(valid);
          return;
        }
      }

      // Draft dari sessionStorage
      try {
        const raw = sessionStorage.getItem("pengajuan_draft");
        if (raw) {
          const draft = JSON.parse(raw) as {
            gudangId: string;
            produkIds: string[];
          };
          if (draft?.gudangId === gudangId && draft.produkIds?.length > 0) {
            const newItems: FormItem[] = draft.produkIds
              .filter((pid) => products.some((p) => p.id === pid))
              .map((pid) => {
                return {
                  produkGudangId: pid,
                  packRetail: 1,
                  packMedium: 0,
                };
              });
            setItems(newItems);
            saveCart(gudangId, newItems);
          }
          sessionStorage.removeItem("pengajuan_draft");
        }
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [gudangId, router]);

  useEffect(() => {
    initPage();
  }, [initPage]);

  useEffect(() => {
    if (gudangId && items.length > 0) saveCart(gudangId, items);
  }, [items, gudangId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const updateItem = (index: number, patch: Partial<FormItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      saveCart(gudangId, next);
      return next;
    });
  };

  const handlePackChange = (
    index: number,
    field: "packRetail" | "packMedium",
    value: string,
  ) => {
    const n = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    updateItem(index, { [field]: n } as Partial<FormItem>);
  };

  // Bagi target kg (acuan input) jadi 50:50 ke dua kemasan
  const handleBagiRata = (index: number, produkId: string) => {
    const target = targetKg[produkId] ?? totalKgOf(items[index]);
    if (target <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...bagiRata(target) };
      saveCart(gudangId, next);
      return next;
    });
  };

  // Toggle custom kemasan.
  const toggleCustomMode = (index: number, produkId: string) => {
    const nextOn = !customMode[produkId];
    setCustomMode((prev) => ({ ...prev, [produkId]: nextOn }));
    if (nextOn) {
      // Aktifkan: jadikan total kg saat ini sebagai target acuan
      setTargetKg((prev) => ({ ...prev, [produkId]: totalKgOf(items[index]) }));
    } else {
      // Matikan: konversi semua ke kemasan 1 kg
      setItems((prev) => {
        const next = [...prev];
        const total = totalKgOf(next[index]);
        next[index] = {
          ...next[index],
          packRetail: Math.round(total),
          packMedium: 0,
        };
        saveCart(gudangId, next);
        return next;
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) clearCart();
      else saveCart(gudangId, next);
      return next;
    });
  };

  const handleTambahProduk = () => {
    const existingIds = items.map((it) => it.produkGudangId).filter(Boolean);
    sessionStorage.setItem(
      "pengajuan_draft",
      JSON.stringify({ gudangId, produkIds: existingIds }),
    );
    router.push(`/seller/gudang/produk?gudangId=${gudangId}`);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!gudangId) {
      setError("Gudang tidak ditemukan.");
      return;
    }

    const validItems = items.filter(
      (it) => it.produkGudangId && totalKgOf(it) > 0,
    );
    if (validItems.length === 0) {
      setError(
        "Belum ada produk dengan jumlah. Tambahkan produk dan isi pack.",
      );
      return;
    }

    const totalKgAll = validItems.reduce((s, it) => s + totalKgOf(it), 0);
    if (totalKgAll < 300) {
      setShowErrorMinModal(true);
      return;
    }

    if (tipePengiriman === "CUSTOM" && !tanggalPermintaanKirim) {
      setError("Silakan pilih tanggal pengiriman untuk opsi Terjadwal.");
      return;
    }

    try {
      setSubmitting(true);
      const apiItems: any[] = [];
      for (const it of validItems) {
        if (it.packMedium > 0) {
          apiItems.push({
            produkGudangId: it.produkGudangId,
            jumlahPermintaan: it.packMedium * MEDIUM_KG,
            ukuranKemasanKg: MEDIUM_KG,
            jumlahKemasan: it.packMedium,
            totalKg: it.packMedium * MEDIUM_KG,
            kemasanDetail: [
              {
                ukuranKg: MEDIUM_KG,
                jumlahKemasan: it.packMedium,
              },
            ],
          });
        }
        if (it.packRetail > 0) {
          apiItems.push({
            produkGudangId: it.produkGudangId,
            jumlahPermintaan: it.packRetail * RETAIL_KG,
            ukuranKemasanKg: RETAIL_KG,
            jumlahKemasan: it.packRetail,
            totalKg: it.packRetail * RETAIL_KG,
            kemasanDetail: [
              {
                ukuranKg: RETAIL_KG,
                jumlahKemasan: it.packRetail,
              },
            ],
          });
        }
      }

      await gudangApi.createStockRequest({
        gudangId,
        catatan,
        tipePengiriman,
        ...(tipePengiriman === "CUSTOM" && { tanggalPermintaanKirim }),
        items: apiItems,
      });
      clearCart();
      setSuccessGudangNama(gudang?.nama || "Gudang");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim pengajuan stok.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Mempersiapkan pengajuan...
        </p>
      </div>
    );
  }

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totalKgAll = items.reduce((s, it) => s + totalKgOf(it), 0);
  const totalHargaAll = items.reduce((s, it) => {
    const prod = availableProducts.find((p) => p.id === it.produkGudangId);
    return s + (prod?.hargaGudang || 0) * totalKgOf(it);
  }, 0);
  const hasValid =
    items.filter((it) => it.produkGudangId && totalKgOf(it) > 0).length > 0;

  return (
    <div className="flex bg-gray-50 h-full overflow-hidden relative">
      {/* Main Content Area - Independent Scroll */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto overscroll-contain pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
        <div className="px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {/* Modals */}
          <SuccessModal
            isOpen={showSuccessModal}
            gudangNama={successGudangNama}
            onClose={() => setShowSuccessModal(false)}
            onViewStatus={() => router.push("/seller/pengajuan-stok")}
            onCreateNew={() => router.push("/seller/gudang/produk")}
          />

          <ErrorMinModal
            isOpen={showErrorMinModal}
            onClose={() => setShowErrorMinModal(false)}
          />

          <form
            id="pengajuan-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Daftar produk */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100/60 mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-slate-400" />
                  Produk yang Diajukan
                  {items.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={handleTambahProduk}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border border-slate-200 active:scale-[0.98] shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Produk
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Belum ada produk dipilih
                  </p>
                  <button
                    type="button"
                    onClick={handleTambahProduk}
                    className="mx-auto px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pilih Produk dari Gudang
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const prod = availableProducts.find(
                      (p) => p.id === item.produkGudangId,
                    );
                    if (!prod) return null;

                    return (
                      <ProductRequestItem
                        key={index}
                        index={index}
                        item={item}
                        prod={prod}
                        customMode={!!customMode[prod.id]}
                        targetKg={targetKg[prod.id] ?? totalKgOf(item)}
                        onRemove={() => handleRemoveItem(index)}
                        onToggleCustom={() => toggleCustomMode(index, prod.id)}
                        onPackChange={(field, val) =>
                          handlePackChange(index, field, val)
                        }
                        onTargetKgChange={(val) =>
                          setTargetKg((prev) => ({
                            ...prev,
                            [prod.id]: val,
                          }))
                        }
                        onBagiRata={() => handleBagiRata(index, prod.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Summary */}
      <SummarySidebar
        items={items}
        availableProducts={availableProducts}
        totalKgAll={totalKgAll}
        totalHargaAll={totalHargaAll}
        hasValid={hasValid}
        tipePengiriman={tipePengiriman}
        setTipePengiriman={setTipePengiriman}
        tanggalPermintaanKirim={tanggalPermintaanKirim}
        setTanggalPermintaanKirim={setTanggalPermintaanKirim}
        catatan={catatan}
        setCatatan={setCatatan}
        submitting={submitting}
      />
    </div>
  );
}
