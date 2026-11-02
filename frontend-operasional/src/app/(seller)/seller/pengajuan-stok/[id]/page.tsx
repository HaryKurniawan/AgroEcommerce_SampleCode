"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Warehouse,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Download,
  FileText,
  X,
} from "lucide-react";

import { gudangApi, storesApi } from "@/lib/ecommerce-api";
import { InvoicePengajuanStok } from "@/components/invoice/InvoicePengajuanStok";
import { useInvoiceDownload } from "@/hooks/use-invoice-download";

interface RequestItem {
  id: string;
  produkGudangId: string;
  namaProduk: string;
  varianProduk?: string | null;
  satuan: string;
  hargaGudang: number;
  jumlahPermintaan: number;
  jumlahDisetujui: number | null;
  totalHargaBeli: number | null;
  ukuranKemasanKg?: number | null;
  jumlahKemasan?: number | null;
  totalKg?: number | null;
}

interface StockRequest {
  id: string;
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
    | "KONFIRMASI_DITERIMA"
    | "TIBA";
  catatan?: string;
  catatanGudang?: string;
  createdAt: string;
  updatedAt: string;
  items: RequestItem[];
}

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "PENDING":
    case "DIAJUKAN":
      return "bg-amber-50/60 text-amber-700 border-amber-100/60";
    case "DISETUJUI":
    case "DIPROSES":
      return "bg-blue-50/60 text-blue-700 border-blue-100/60";
    case "PROSES_KIRIM":
    case "DIKIRIM":
      return "bg-indigo-50/60 text-indigo-700 border-indigo-100/60";
    case "KONFIRMASI_DITERIMA":
      return "bg-green-50/60 text-green-700 border-green-100/60";
    case "SELESAI":
      return "bg-emerald-50/60 text-emerald-700 border-emerald-100/60";
    case "DITOLAK":
      return "bg-rose-50/60 text-rose-700 border-rose-100/60";
    default:
      return "bg-slate-50/60 text-slate-700 border-slate-100/60";
  }
};

interface TokoInfo {
  id: string;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  telepon?: string;
  email?: string;
  deskripsi?: string;
}

export default function StockRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<StockRequest | null>(null);
  const [warehouseName, setWarehouseName] = useState("Gudang Logistik");
  const [tokoInfo, setTokoInfo] = useState<TokoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [namaPenerima, setNamaPenerima] = useState("");

  const { downloadInvoice, downloading } = useInvoiceDownload();

  const fetchRequestDetail = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await gudangApi.getStockRequestById(id);
        const rawData = res?.data?.data || res?.data;
        if (rawData) {
          const mappedData = {
            ...rawData,
            id: rawData.id || rawData.id_pengajuanStok,
            items:
              rawData.items?.map((item: any) => ({
                ...item,
                id: item.id || item.id_itemPengajuan,
              })) || [],
          };
          setRequest(mappedData);

          // Fetch warehouse name
          const whRes = await gudangApi.getWarehouses();
          const whData = whRes?.data?.data || whRes?.data || [];
          if (Array.isArray(whData)) {
            const wh = whData.find((w: any) => w.id === rawData.gudangId);
            if (wh) setWarehouseName(wh.nama);
          }

          // Fetch toko info
          try {
            const tokoRes = await storesApi.getMyStore();
            const tokoData = tokoRes?.data?.data || tokoRes?.data;
            if (tokoData) {
              setTokoInfo({
                id: tokoData.id,
                nama: tokoData.nama || "PT. AGRO JABAR (PERSERODA)",
                alamat: tokoData.alamat,
                kota: tokoData.kota || tokoData.kotaKabupaten,
                provinsi: tokoData.provinsi,
                kodePos: tokoData.kodePos,
                telepon: tokoData.telepon,
                email: tokoData.email,
                deskripsi: tokoData.deskripsi,
              });
            }
          } catch {
            // Biarkan tokoInfo null, component akan pakai default
          }
        } else {
          setError("Pengajuan tidak ditemukan.");
        }
      } catch (err: any) {
        console.error("Error fetching details:", err);
        setError(err.message || "Gagal memuat detail pengajuan stok.");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  const handleConfirmReceived = async () => {
    if (!request) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);

      // Update status ke SELESAI
      await gudangApi.updateStockRequestStatus(request.id, {
        status: "SELESAI",
        catatan: `Barang telah tiba dan dikonfirmasi diterima oleh seller. | Penerima: ${namaPenerima || tokoInfo?.nama || "Seller"}`,
      });

      // Refresh data
      await fetchRequestDetail(false);
    } catch (err: any) {
      console.error("Error confirming receipt:", err);
      setError(err.message || "Gagal mengkonfirmasi penerimaan barang.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = () => {
    setNamaPenerima(tokoInfo?.nama || "");
    setShowConfirmModal(true);
  };

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  // Setup polling to fetch updates (gudang adalah project terpisah, tidak menggunakan SSE)
  useEffect(() => {
    if (!request) return;
    if (request.status === "SELESAI" || request.status === "DITOLAK") {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const interval = setInterval(() => {
      fetchRequestDetail(false);
    }, 5000); // Polling setiap 5 detik

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [request?.status, fetchRequestDetail]);

  const getTimelineSteps = () => {
    if (!request) return [];

    const steps = [
      {
        title: "Pengajuan Dibuat",
        description: "Seller mengajukan stok ke gudang logistik",
        date: new Date(request.createdAt).toLocaleString("id-ID"),
        completed: true,
        current: request.status === "PENDING" || request.status === "DIAJUKAN",
      },
      {
        title: "Verifikasi Gudang",
        description:
          request.status === "DITOLAK"
            ? "Pengajuan Ditolak oleh Gudang"
            : "Pihak Gudang memeriksa ketersediaan ruang simpan",
        date:
          request.status !== "PENDING" && request.status !== "DIAJUKAN"
            ? new Date(request.updatedAt).toLocaleString("id-ID")
            : "",
        completed:
          request.status !== "PENDING" && request.status !== "DIAJUKAN",
        current:
          request.status === "DISETUJUI" || request.status === "DIPROSES",
        error: request.status === "DITOLAK",
      },
      {
        title: "Proses Pengiriman",
        description: "Gudang mengirimkan stok menuju titik Seller",
        date: ["DIKIRIM", "TIBA", "KONFIRMASI_DITERIMA", "SELESAI"].includes(
          request.status,
        )
          ? new Date(request.updatedAt).toLocaleString("id-ID")
          : "",
        completed: [
          "DIKIRIM",
          "TIBA",
          "KONFIRMASI_DITERIMA",
          "SELESAI",
        ].includes(request.status),
        current: request.status === "DIKIRIM",
      },
      {
        title: "Barang Tiba",
        description: "Barang telah tiba dan menunggu konfirmasi penerimaan",
        date: ["TIBA", "KONFIRMASI_DITERIMA", "SELESAI"].includes(
          request.status,
        )
          ? new Date(request.updatedAt).toLocaleString("id-ID")
          : "",
        completed: ["TIBA", "KONFIRMASI_DITERIMA", "SELESAI"].includes(
          request.status,
        ),
        current: request.status === "TIBA",
      },
      {
        title: "Konfirmasi & Selesai",
        description:
          "Seller mengkonfirmasi barang, stok ditambahkan ke etalase toko",
        date: ["SELESAI", "KONFIRMASI_DITERIMA"].includes(request.status)
          ? new Date(request.updatedAt).toLocaleString("id-ID")
          : "",
        completed: ["SELESAI", "KONFIRMASI_DITERIMA"].includes(request.status),
        current: ["SELESAI", "KONFIRMASI_DITERIMA"].includes(request.status),
      },
    ];

    return steps;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Memuat detail pengajuan...
        </p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="w-full space-y-4 max-w-4xl">
        <button
          onClick={() => router.push("/seller/pengajuan-stok")}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>
        <div className="bg-rose-50/50 border border-rose-100/80 text-rose-700 p-4 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <h3 className="font-medium text-xs text-rose-800">Kesalahan</h3>
            <p className="text-xs mt-0.5 text-rose-600/90 font-normal">
              {error || "Pengajuan tidak ditemukan"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center">
        <button
          onClick={() => router.push("/seller/pengajuan-stok")}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Riwayat Pengajuan
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-50/50 text-emerald-600 rounded-xl shrink-0 border border-emerald-100/30">
            <Warehouse className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-medium tracking-tight text-slate-800">
                Detail Pengajuan Stok
              </h1>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full border ${getStatusBadgeStyle(request.status)}`}
              >
                {request.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ID Pengajuan:{" "}
              <span className="font-mono text-[11px] text-slate-500">
                {request.id}
              </span>{" "}
              • Dibuat pada{" "}
              {new Date(request.createdAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        {/* Kanan - Badge + Tombol Invoice */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Polling Status Badge */}
          {isPolling && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-medium rounded-full border bg-emerald-50/50 text-emerald-700 border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto Refresh Aktif
            </span>
          )}

          {/* Tombol Invoice - muncul jika status SELESAI atau KONFIRMASI_DITERIMA */}
          {(request.status === "SELESAI" ||
            request.status === "KONFIRMASI_DITERIMA") && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-all active:scale-[0.98] shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Lihat Invoice
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(true);
                  setTimeout(() => {
                    downloadInvoice(
                      "invoice-print-area",
                      `Invoice-${request.id.slice(0, 8)}.pdf`,
                    );
                  }, 300);
                }}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-medium rounded-xl transition-all active:scale-[0.98] shadow-sm"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download Struk
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tombol Konfirmasi Diterima */}
      {request.status === "TIBA" && (
        <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-blue-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Konfirmasi Penerimaan Barang
              </h4>
              <p className="text-xs text-blue-600 leading-relaxed">
                Apakah Anda sudah menerima semua barang yang dikirim? Klik
                tombol konfirmasi untuk memproses stok ke etalase.
              </p>
            </div>
            <button
              onClick={openConfirmModal}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Konfirmasi Diterima
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Info & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Warehouse className="w-4.5 h-4.5 text-emerald-600/70" />
              <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                Gudang Logistik Tujuan
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {warehouseName}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
                  Pengadaan barang fisik dari toko Anda akan diverifikasi,
                  disetujui, dan dicatat ke dalam stok di gudang ini.
                </p>
              </div>

              {/* Note sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Catatan Pengaju (Anda)
                  </span>
                  <div className="text-xs text-slate-600 bg-slate-50/60 p-3.5 rounded-xl font-normal border border-slate-200/40 leading-relaxed min-h-[64px] flex items-center">
                    {request.catatan || (
                      <span className="text-slate-400 italic font-normal">
                        Tidak ada catatan dari Anda
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Tanggapan / Catatan Gudang
                  </span>
                  <div
                    className={`text-xs p-3.5 rounded-xl font-normal border leading-relaxed min-h-[64px] flex items-center ${
                      request.catatanGudang
                        ? "text-emerald-700 bg-emerald-50/30 border-emerald-100/50"
                        : "text-slate-500 bg-slate-50/60 border-slate-200/40 italic"
                    }`}
                  >
                    {request.catatanGudang ||
                      "Belum ada tanggapan atau catatan dari pihak gudang."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items requested card */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600/70" />
              <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                Detail Produk Yang Diajukan
              </h3>
            </div>

            {/* List Table Headers (Visible on Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <div className="col-span-6">Nama Produk</div>
              <div className="col-span-3 text-right">Harga Satuan</div>
              <div className="col-span-3 text-right">
                Jumlah (Diminta / Disetujui)
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {request.items?.map((item) => (
                <div
                  key={item.id}
                  className="py-4 md:px-2 md:grid md:grid-cols-12 md:gap-4 items-center group"
                >
                  {/* Product Name & Packaging Info */}
                  <div className="col-span-6 space-y-1">
                    <h4 className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors text-xs">
                      {item.namaProduk || "Produk"}
                    </h4>
                    {item.varianProduk && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100/50">
                        {item.varianProduk}
                      </span>
                    )}
                    {item.ukuranKemasanKg ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100/50 mt-1">
                        Kemasan:{" "}
                        {item.ukuranKemasanKg === 1.0
                          ? "Retail (1.0 kg)"
                          : `Medium (${item.ukuranKemasanKg} kg)`}
                      </span>
                    ) : null}
                    <span className="md:hidden text-[10.5px] text-slate-400 font-normal block mt-1">
                      Harga: Rp{" "}
                      {(item.hargaGudang || 0).toLocaleString("id-ID")} /{" "}
                      {item.satuan}
                    </span>
                  </div>

                  {/* Price (Desktop only) */}
                  <div className="hidden md:block col-span-3 text-right text-xs text-slate-500 font-normal">
                    Rp {(item.hargaGudang || 0).toLocaleString("id-ID")} /{" "}
                    {item.satuan}
                  </div>

                  {/* Quantities */}
                  <div className="col-span-3 text-left md:text-right mt-2 md:mt-0 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0">
                    <div className="text-xs font-normal text-slate-500">
                      <span className="md:hidden text-[10.5px] text-slate-400 font-medium uppercase tracking-wider mr-1">
                        Diminta:
                      </span>
                      {item.ukuranKemasanKg && item.jumlahKemasan ? (
                        <>
                          <span className="text-slate-800 font-medium">
                            {item.jumlahKemasan.toLocaleString("id-ID")} packs
                          </span>
                          <span className="text-slate-400 text-[10px] block mt-0.5">
                            ({item.jumlahPermintaan.toLocaleString("id-ID")} kg)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-800 font-medium">
                            {item.jumlahPermintaan.toLocaleString("id-ID")}
                          </span>{" "}
                          <span className="text-slate-400">{item.satuan}</span>
                        </>
                      )}
                    </div>
                    {request.status !== "PENDING" &&
                      request.status !== "DIAJUKAN" && (
                        <div className="text-[10px] font-medium text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100/40">
                          <span className="md:hidden text-emerald-600/80 mr-1 font-normal">
                            Disetujui:
                          </span>
                          {item.ukuranKemasanKg && item.jumlahKemasan ? (
                            <>
                              {item.jumlahDisetujui !== null
                                ? Math.round(
                                    item.jumlahDisetujui /
                                      (item.ukuranKemasanKg || 1),
                                  ).toLocaleString("id-ID")
                                : (item.jumlahKemasan || 0).toLocaleString(
                                    "id-ID",
                                  )}{" "}
                              packs
                            </>
                          ) : (
                            <>
                              {(item.jumlahDisetujui !== null
                                ? item.jumlahDisetujui
                                : item.jumlahPermintaan
                              ).toLocaleString("id-ID")}{" "}
                              {item.satuan}
                            </>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Real-time Timeline tracker */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-emerald-600/70" />
              <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                Real-time Status Tracking
              </h3>
            </div>

            {/* Timeline Steps list */}
            <div className="space-y-6 relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
              {getTimelineSteps().map((step, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {/* Circle Indicator */}
                  <div className="absolute left-[-19px] top-1 z-10 shrink-0">
                    {step.error ? (
                      <div className="w-3 h-3 bg-rose-50 text-rose-500 border border-rose-200 rounded-full flex items-center justify-center">
                        <XCircle className="w-2 h-2" />
                      </div>
                    ) : step.current ? (
                      <div className="w-3 h-3 bg-emerald-50 border border-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                      </div>
                    ) : step.completed ? (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-2 h-2 text-white" />
                      </div>
                    ) : (
                      <div className="w-3 h-3 bg-white border border-slate-200 rounded-full" />
                    )}
                  </div>

                  {/* Text Step */}
                  <div className="space-y-1 flex-1">
                    <h4
                      className={`text-xs font-medium ${step.error ? "text-rose-700" : step.current ? "text-emerald-700" : "text-slate-800"}`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                      {step.description}
                    </p>
                    {step.date && (
                      <span className="text-[9.5px] bg-slate-50/50 text-slate-400 font-medium px-2 py-0.5 rounded-full inline-block border border-slate-200/30 mt-1">
                        {step.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL INVOICE ─────────────────────────────────────────── */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto p-4 pt-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInvoiceModal(false);
          }}
        >
          <div className="relative w-full max-w-4xl">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-t-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Invoice Pengajuan Stok
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ID: {request.id.slice(0, 12)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadInvoice(
                      "invoice-print-area",
                      `Invoice-PengajuanStok-${request.id.slice(0, 8)}.pdf`,
                    )
                  }
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all active:scale-[0.98]"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloading ? "Menyiapkan..." : "Download / Print"}
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
              <InvoicePengajuanStok
                data={{
                  ...request,
                  gudang: {
                    id: request.gudangId,
                    nama: warehouseName,
                  },
                }}
                tokoInfo={tokoInfo}
              />
            </div>

            {/* Info teks bawah */}
            <div className="text-center py-3 text-xs text-slate-400">
              Klik &quot;Download / Print&quot; untuk menyimpan sebagai PDF,
              atau tekan{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-mono">
                Ctrl+P
              </kbd>{" "}
              di dialog print
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL KONFIRMASI PENERIMAAN ──────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Konfirmasi Penerimaan
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pastikan semua barang fisik telah Anda terima dan periksa.
                  Stok ini akan langsung ditambahkan ke inventaris Anda setelah
                  dikonfirmasi.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wide">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value)}
                  placeholder="Contoh: Budi (Staf Toko)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400">
                  Nama ini akan dicantumkan pada invoice dan berita acara
                  penerimaan barang.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReceived}
                disabled={loading || !namaPenerima.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Konfirmasi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
