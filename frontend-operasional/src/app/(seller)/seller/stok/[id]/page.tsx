"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle, History, Package } from "lucide-react";

import { productsApi } from "@/lib/ecommerce-api";

import { ProductItem, StockLog, BatchItem } from "./_components/types";
import { StockProductHeader } from "./_components/StockProductHeader";
import { StockInfoCard } from "./_components/StockInfoCard";
import { StockAdjustForm } from "./_components/StockAdjustForm";
import { StockHistoryTable } from "./_components/StockHistoryTable";
import { StockBatchGrid } from "./_components/StockBatchGrid";

export default function SellerProductStockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  // State
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [adjustType, setAdjustType] = useState<"masuk" | "keluar">("masuk");
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<StockLog[]>([]);
  const [historyTab, setHistoryTab] = useState<"masuk" | "keluar">("masuk");

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<"riwayat" | "batch">(
    "riwayat",
  );

  const targetStock = useMemo(() => {
    if (!product) return 0;
    const current = Number(product.stok) || 0;
    const qty = adjustQty;
    if (adjustType === "masuk") {
      return current + qty;
    } else {
      return Math.max(0, current - qty);
    }
  }, [product, adjustType, adjustQty]);

  // Fetch product detail and history logs
  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setErrorText("");

      const res = await productsApi.getById(productId);
      const prodData = res?.data?.data || res?.data;
      if (prodData) {
        setProduct(prodData);
      } else {
        throw new Error("Produk tidak ditemukan");
      }

      // Fetch real stock history from backend
      try {
        const historyRes = await productsApi.getStockHistory(productId);
        const historyData =
          historyRes?.data?.data?.data || historyRes?.data?.data || [];

        if (Array.isArray(historyData) && historyData.length > 0) {
          const mappedLogs: StockLog[] = historyData.map((log: any) => {
            let logType: "MASUK" | "KELUAR" | "PERUBAHAN" = "MASUK";
            if (log.tipe === "OUT") logType = "KELUAR";
            if (log.tipe === "ADJUSTMENT") logType = "PERUBAHAN";

            return {
              id: log.id,
              produkId: log.produkId,
              produkNama: prodData.nama?.replace(" - ", " "),
              gambarUrl: prodData.gambarUrl,
              change: log.tipe === "OUT" ? -log.kuantitas : log.kuantitas,
              tipe: logType,
              keterangan:
                log.catatan ||
                (log.tipe === "IN"
                  ? "Stok Masuk"
                  : log.tipe === "OUT"
                    ? "Stok Keluar"
                    : "Penyesuaian Stok"),
              timestamp: log.createdAt,
            };
          });
          setHistoryLogs(mappedLogs);
        }
      } catch (historyErr) {
        console.error(
          "Failed to fetch product stock history from API",
          historyErr,
        );
      }

      // Fetch batches
      try {
        const batchRes = await productsApi.getBatches(productId);
        const batchData = batchRes?.data?.data || batchRes?.data || [];
        setBatches(batchData);
      } catch (batchErr) {
        console.error("Failed to fetch product batches from API", batchErr);
      }
    } catch (err: any) {
      console.error("Failed to fetch product stock details:", err);
      setErrorText(err.message || "Gagal memuat detail produk.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Filter logs for this product and selected tab
  const filteredProductLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      if (log.produkId !== productId) return false;
      if (historyTab === "masuk") return log.tipe === "MASUK";
      if (historyTab === "keluar") return log.tipe === "KELUAR";
      return true;
    });
  }, [historyLogs, productId, historyTab]);

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const qty = adjustQty;
    if (qty <= 0) {
      alert("Jumlah penyesuaian harus lebih dari 0.");
      return;
    }

    setIsUpdating(true);
    try {
      const tipe = adjustType === "masuk" ? "IN" : "OUT";

      await productsApi.updateStock(product.id, {
        tipe,
        kuantitas: qty,
        catatan:
          notes.trim() ||
          `Penyesuaian manual — ${
            adjustType === "masuk" ? "Stok Masuk" : "Stok Keluar"
          }: ${qty} ${product.satuan || "unit"}`,
      });

      setIsEditing(false);
      setAdjustQty(1);
      setNotes("");
      fetchProductDetails();
    } catch (err: any) {
      console.error("Failed to update stock:", err);
      alert(err.message || "Gagal menyimpan penyesuaian stok.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Memuat detail stok produk...
        </p>
      </div>
    );
  }

  if (errorText || !product) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12">
        <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="space-y-0.5">
            <h3 className="font-medium text-sm text-rose-800">
              Gagal Memuat Detail
            </h3>
            <p className="text-xs text-rose-600 leading-relaxed">
              {errorText || "Produk tidak ditemukan."}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/seller/stok")}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-all"
        >
          Kembali ke Pengelolaan Stok
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <StockProductHeader productName={product.nama} />

      {/* Top Section: Compact Info or Edit Form */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        {!isEditing ? (
          <StockInfoCard
            product={product}
            onEditClick={() => setIsEditing(true)}
          />
        ) : (
          <StockAdjustForm
            product={product}
            targetStock={targetStock}
            adjustType={adjustType}
            setAdjustType={setAdjustType}
            adjustQty={adjustQty}
            setAdjustQty={setAdjustQty}
            notes={notes}
            setNotes={setNotes}
            isUpdating={isUpdating}
            onCancel={() => {
              setIsEditing(false);
              setAdjustQty(1);
              setNotes("");
            }}
            onSubmit={handleSaveStock}
          />
        )}
      </div>

      {/* Bottom Section: Main Tabs */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 mb-4">
          <button
            type="button"
            onClick={() => setActiveMainTab("riwayat")}
            className={`pb-3 text-[13px] font-medium border-b-2 transition-all ${
              activeMainTab === "riwayat"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <History size={14} />
              Riwayat Mutasi Produk
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("batch")}
            className={`pb-3 text-[13px] font-medium border-b-2 transition-all ${
              activeMainTab === "batch"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={14} />
              Batch Stok
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeMainTab === "riwayat" ? (
          <StockHistoryTable
            product={product}
            filteredLogs={filteredProductLogs}
            historyTab={historyTab}
            setHistoryTab={setHistoryTab}
          />
        ) : (
          <StockBatchGrid product={product} batches={batches} />
        )}
      </div>
    </div>
  );
}
