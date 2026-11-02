"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Percent,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  TrendingDown,
  Package,
} from "lucide-react";

import { productsApi, storesApi, formatRupiah } from "@/lib/ecommerce-api";

// ── Konstanta aturan diskon ─────────────────────────────────────────────────
const DISKON_MAX = 30;
const DISKON_MIN = 5;

interface ProductDetail {
  id: string;
  nama: string;
  harga: number;
  hargaAsli?: number;
  gambarUrl?: string;
  category?: { nama: string };
  stok: number;
  satuan?: string;
  diskonPersen?: number;
  status: string;
}

interface PageParams {
  id: string;
}

export default function DiskonPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [diskon, setDiskon] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ── Fetch produk ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await productsApi.getById(id);
        const data = res?.data?.data || res?.data;
        if (!data) {
          setNotFound(true);
          return;
        }

        // Verifikasi produk milik toko seller ini
        const storeRes = await storesApi.getMyStore();
        const storeData = storeRes?.data?.data || storeRes?.data;
        if (storeData?.id && data.tokoId && data.tokoId !== storeData.id) {
          setNotFound(true);
          return;
        }

        setProduct(data);
        setDiskon(data.diskonPersen ?? 0);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Handler simpan diskon ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!product) return;
    const val = Number(diskon);

    if (!Number.isInteger(val)) {
      setFeedback({ type: "error", msg: "Diskon harus bilangan bulat." });
      return;
    }
    if (val !== 0 && (val < DISKON_MIN || val > DISKON_MAX)) {
      setFeedback({
        type: "error",
        msg: `Diskon harus 0 (hapus) atau antara ${DISKON_MIN}%–${DISKON_MAX}%.`,
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await productsApi.setDiskon(product.id, val);
      setProduct((prev) =>
        prev ? { ...prev, diskonPersen: val === 0 ? undefined : val } : prev,
      );
      setFeedback({
        type: "success",
        msg:
          val === 0
            ? "Diskon berhasil dihapus."
            : `Diskon ${val}% berhasil disimpan!`,
      });
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        msg:
          e?.response?.data?.message || e?.message || "Gagal menyimpan diskon.",
      });
    } finally {
      setSaving(false);
    }
  };

  const hargaSetelahDiskon =
    product && diskon >= DISKON_MIN && diskon <= DISKON_MAX
      ? Math.round(product.harga * (1 - diskon / 100))
      : null;

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500">Memuat data produk…</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Package className="w-14 h-14 text-gray-300 mx-auto" />
          <p className="font-semibold text-gray-700">Produk tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-emerald-600 hover:underline flex items-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">
              Pengaturan Diskon
            </h1>
            <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">
              {product.nama?.replace(" - ", " ")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ── Info Produk Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
            {product.gambarUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={product.gambarUrl}
                  alt={product.nama?.replace(" - ", " ")}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              "📦"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">
              {product.nama?.replace(" - ", " ")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {product.category?.nama || "Tanpa Kategori"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-gray-900">
                {formatRupiah(product.harga)}
              </span>
              {product.diskonPersen && product.diskonPersen > 0 ? (
                <span className="flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  <Tag size={10} /> Diskon aktif: {product.diskonPersen}%
                </span>
              ) : (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Belum ada diskon
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Aturan Diskon Info ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Aturan Diskon Platform</p>
            <ul className="text-xs space-y-1 text-amber-700 list-disc list-inside">
              <li>
                Diskon minimum <strong>{DISKON_MIN}%</strong>
              </li>
              <li>
                Diskon maksimum <strong>{DISKON_MAX}%</strong>
              </li>
              <li>Harus berupa bilangan bulat (tidak boleh desimal)</li>
              <li>
                Masukkan <strong>0</strong> untuk menghapus diskon
              </li>
            </ul>
          </div>
        </div>

        {/* ── Panel Input Diskon ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
              <Percent size={15} className="text-orange-600" />
            </div>
            <p className="font-semibold text-gray-900">
              Atur Persentase Diskon
            </p>
          </div>

          {/* Input angka besar */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <input
                type="number"
                id="diskon-input"
                min={0}
                max={DISKON_MAX}
                step={1}
                value={diskon}
                onChange={(e) => {
                  setDiskon(Number(e.target.value));
                  setFeedback(null);
                }}
                className="text-5xl font-black text-center text-orange-600 w-40 bg-orange-50 border-2 border-orange-200 rounded-2xl py-4 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
              />
              <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-3xl font-black text-orange-400">
                %
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={DISKON_MAX}
              step={1}
              value={diskon}
              onChange={(e) => {
                setDiskon(Number(e.target.value));
                setFeedback(null);
              }}
              className="w-full h-2 accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0% (Hapus)</span>
              <span>{DISKON_MIN}% Min</span>
              <span>{DISKON_MAX}% Maks</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-5 gap-2">
            {[0, 5, 10, 15, 20, 25, 30].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setDiskon(v);
                  setFeedback(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  diskon === v
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {v === 0 ? "Hapus" : `${v}%`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Preview Harga ── */}
        {hargaSetelahDiskon !== null ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown size={15} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-medium">
                Harga setelah diskon {diskon}%
              </p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {formatRupiah(hargaSetelahDiskon)}
              </p>
              <p className="text-xs text-emerald-600 line-through opacity-60">
                Harga asli: {formatRupiah(product.harga)}
              </p>
            </div>
          </div>
        ) : diskon > 0 && (diskon < DISKON_MIN || diskon > DISKON_MAX) ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Nilai diskon tidak valid. Harus antara {DISKON_MIN}%–{DISKON_MAX}%
              atau 0.
            </p>
          </div>
        ) : diskon === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <Info size={18} className="text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-500">
              Menyimpan dengan nilai <strong>0</strong> akan menghapus diskon
              dari produk ini.
            </p>
          </div>
        ) : null}

        {/* ── Feedback ── */}
        {feedback && (
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2
                size={18}
                className="flex-shrink-0 text-emerald-600"
              />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
            )}
            <p className="text-sm font-medium">{feedback.msg}</p>
          </div>
        )}

        {/* ── Tombol Aksi ── */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-200"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Percent size={18} />
            )}
            {diskon === 0 ? "Hapus Diskon" : "Simpan Diskon"}
          </button>
        </div>
      </div>
    </div>
  );
}
