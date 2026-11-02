"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Warehouse,
  ChevronRight,
  FileText,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface RequestItem {
  id: string;
  produk: {
    nama: string;
  };
  namaProduk?: string;
  varianProduk?: string | null;
  jumlahPermintaan: number;
  jumlahDisetujui: number;
}

interface StockRequest {
  id?: string;
  id_pengajuanStok?: string;
  tokoId: string;
  gudangId: string;
  status:
    | "PENDING"
    | "DISETUJUI"
    | "DITOLAK"
    | "PROSES_KIRIM"
    | "SELESAI"
    | "DIAJUKAN"
    | "DIPROSES"
    | "DIKIRIM"
    | "KONFIRMASI_DITERIMA";
  catatan?: string;
  catatanGudang?: string;
  createdAt: string;
  updatedAt: string;
  items: RequestItem[];
}

type TabType = "active" | "orders";

export default function SellerStockRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Memoized active requests (excluding SELESAI)
  const activeRequests = useMemo(() => {
    return requests.filter((r) => r.status !== "SELESAI");
  }, [requests]);

  const fetchRequests = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await gudangApi.getStockRequests();
      const rawData = res?.data?.data || res?.data || [];
      const arrayData = Array.isArray(rawData) ? rawData : [];
      setRequests(
        arrayData.map((r: any) => ({ ...r, id: r.id || r.id_pengajuanStok })),
      );

      const whRes = await gudangApi.getWarehouses();
      const whData = whRes?.data?.data || whRes?.data || [];
      if (Array.isArray(whData)) {
        const whMap: Record<string, string> = {};
        whData.forEach((w: any) => {
          whMap[w.id] = w.nama;
        });
        setWarehouses(whMap);
      }
    } catch (err: any) {
      console.error("Error fetching stock requests:", err);
      setError(err.message || "Gagal memuat daftar pengajuan stok.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
      case "DIAJUKAN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-amber-50/50 text-amber-600 border border-amber-100/60 uppercase tracking-wider shrink-0">
            <Clock className="w-3 h-3 text-amber-500" />
            Menunggu
          </span>
        );
      case "DISETUJUI":
      case "DIPROSES":
      case "DIKONFIRMASI":
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-blue-50/50 text-blue-600 border border-blue-100/60 uppercase tracking-wider shrink-0">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Dikonfirmasi
          </span>
        );
      case "PROSES_KIRIM":
      case "DIKIRIM":
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-indigo-50/50 text-indigo-600 border border-indigo-100/60 uppercase tracking-wider shrink-0">
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
            Pengiriman
          </span>
        );
      case "TIBA":
      case "ARRIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-teal-50/50 text-teal-600 border border-teal-100/60 uppercase tracking-wider shrink-0">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            Tiba
          </span>
        );
      case "KONFIRMASI_DITERIMA":
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-emerald-50/50 text-emerald-600 border border-emerald-100/60 uppercase tracking-wider shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Konfirmasi Diterima
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-primary-50 text-primary-600 border border-primary-100/60 uppercase tracking-wider shrink-0">
            <CheckCircle2 className="w-3 h-3 text-primary-500" />
            Selesai
          </span>
        );
      case "DITOLAK":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-rose-50/50 text-rose-500 border border-rose-100/60 uppercase tracking-wider shrink-0">
            <XCircle className="w-3 h-3 text-rose-400" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-slate-50/50 text-slate-500 border border-slate-100/60 uppercase tracking-wider shrink-0">
            {status}
          </span>
        );
    }
  };

  const renderOrderCard = (request: StockRequest) => {
    const reqStatus = (request.status || "DIAJUKAN").toUpperCase();
    let currentStatusIndex = 0;
    if (
      ["DISETUJUI", "DIPROSES", "DIKONFIRMASI", "CONFIRMED"].includes(reqStatus)
    ) {
      currentStatusIndex = 1;
    } else if (["DIKIRIM", "PROSES_KIRIM", "SHIPPED"].includes(reqStatus)) {
      currentStatusIndex = 2;
    } else if (
      [
        "TIBA",
        "ARRIVED",
        "KONFIRMASI_DITERIMA",
        "RECEIVED",
        "SELESAI",
      ].includes(reqStatus)
    ) {
      currentStatusIndex = 3;
    }

    return (
      <button
        key={request.id}
        onClick={() => router.push(`/seller/pengajuan-stok/${request.id}`)}
        className="w-full bg-white border border-slate-200/70 hover:border-primary-200/60 rounded-lg p-4 transition-all duration-300 text-left group"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Warehouse className="w-4 h-4 text-slate-400 shrink-0" />
              <h3 className="font-medium text-sm text-slate-800 truncate">
                {warehouses[request.gudangId] ||
                  `Gudang ${request.gudangId.slice(0, 8)}`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {request.items?.length || 0} item •{" "}
              {new Date(request.createdAt).toLocaleDateString("id-ID")}
            </p>
            <div className="flex flex-wrap gap-2">
              {request.items?.slice(0, 2).map((item, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100"
                >
                  {item.namaProduk
                    ? item.varianProduk
                      ? `${item.namaProduk} ${item.varianProduk}`
                      : item.namaProduk
                    : item.produk?.nama?.replace(" - ", " ") || "Produk"}
                </span>
              ))}
              {request.items && request.items.length > 2 && (
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                  +{request.items.length - 2} lainnya
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {getStatusBadge(request.status)}
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
          </div>
        </div>

        {/* Status Roadmap Inside Card */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
            <div className="flex justify-between w-full relative z-10">
              {[
                { label: "Diajukan", status: "DIAJUKAN" },
                { label: "Dikonfirmasi", status: "DIPROSES" },
                { label: "Dikirim", status: "DIKIRIM" },
                { label: "Tiba", status: "TIBA" },
              ].map((step, idx) => {
                const isActive = idx <= currentStatusIndex;
                const StepIcon = isActive ? CheckCircle2 : Clock;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1 relative"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "bg-primary-50 border-primary-600 text-primary-600"
                          : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[8px] font-medium text-center max-w-[50px] leading-tight ${
                        isActive ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Memuat riwayat pengajuan...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-2xl shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-800">
              Status Pengajuan Stok
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Pantau status dan riwayat pengajuan stok dari gudang logistik
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <button
            onClick={() => router.push("/seller/gudang/produk")}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Pengajuan Baru
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center sm:justify-start">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as TabType)}
          options={[
            { label: "Pesanan Aktif", value: "active" },
            { label: "Riwayat Pesanan", value: "orders" },
          ]}
        />
      </div>

      {error && (
        <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="space-y-0.5">
            <h3 className="font-medium text-sm text-rose-800">Kesalahan</h3>
            <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Pesanan Aktif Tab */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100/80 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100/50 text-slate-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                Tidak ada pesanan aktif
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequests.map(renderOrderCard)}
            </div>
          )}
        </div>
      )}

      {/* Riwayat Pesanan Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 text-slate-600/80 animate-spin" />
            </div>
          ) : requests.filter((r) => r.status === "SELESAI").length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100/80 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100/50 text-slate-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                Belum ada riwayat pesanan yang selesai
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .filter((r) => r.status === "SELESAI")
                .map((request) => (
                  <div
                    key={request.id}
                    className="bg-white border border-slate-200/70 hover:border-primary-200/60 rounded-lg p-4 transition-all duration-300"
                  >
                    {/* Card clickable area */}
                    <button
                      onClick={() =>
                        router.push(`/seller/pengajuan-stok/${request.id}`)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Warehouse className="w-4 h-4 text-slate-400 shrink-0" />
                            <h3 className="font-medium text-sm text-slate-800 truncate">
                              {warehouses[request.gudangId] ||
                                `Gudang ${request.gudangId.slice(0, 8)}`}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500">
                            {request.items?.length || 0} item •{" "}
                            {new Date(request.createdAt).toLocaleDateString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-primary-50 text-primary-600 border border-primary-100/60 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-primary-500" />
                            Selesai
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.items?.slice(0, 2).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100"
                          >
                            {item.namaProduk
                              ? item.varianProduk
                                ? `${item.namaProduk} ${item.varianProduk}`
                                : item.namaProduk
                              : item.produk?.nama?.replace(" - ", " ") ||
                                "Produk"}
                          </span>
                        ))}
                        {request.items && request.items.length > 2 && (
                          <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                            +{request.items.length - 2} lainnya
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Tombol Invoice */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Selesai pada{" "}
                        {new Date(request.updatedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                      <button
                        onClick={() =>
                          router.push(`/seller/pengajuan-stok/${request.id}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-medium rounded-lg transition-all active:scale-[0.98] border border-blue-100/60"
                      >
                        <FileText className="w-3 h-3" />
                        Lihat Invoice
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
