"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
  User,
  CheckCircle,
  Building,
  Phone,
  Clock,
  Copy,
  ExternalLink,
  X,
  Truck,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

import {
  formatRupiah,
  formatTanggal,
  ordersApi,
  storesApi,
} from "@/lib/ecommerce-api";
import { apiClient } from "@/lib/api-client";
import CetakSuratJalanModal from "@/app/(seller)/seller/pesanan/_components/CetakSuratJalanModal";
const MapView = dynamic(() => import("@/components/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
      <Loader2 size={16} className="animate-spin text-emerald-500/80" />
      <span className="text-xs text-slate-400 ml-2 font-medium">
        Memuat peta...
      </span>
    </div>
  ),
});

interface OrderDetail {
  id: string;
  status: string;
  totalHarga: number | string;
  metodeBayar?: string;
  alamatKirim?: string;
  catatan?: string;
  createdAt: string;
  updatedAt?: string;
  kemasanGrosir?: any;
  diskonGrosirPersen?: number;
  konsumen?: { nama?: string; email?: string };
  customer?: { name?: string; email?: string; phone?: string };
  item?: Array<{
    id: string;
    jumlah: number;
    harga: number;
    grade?: string;
    produk?: { nama: string; hargaBeli?: number; satuan?: string };
  }>;
  items?: Array<{
    id: string;
    jumlah: number;
    harga: number | string;
    grade?: string;
    product?: { nama: string; hargaBeli?: number; satuan?: string };
  }>;
  shipping?: {
    id: string;
    status: string;
    kurirName?: string;
    kurirPhone?: string;
    catatan?: string;
    trackingHistory?: Array<{
      status: string;
      label?: string;
      note?: string;
      timestamp?: string;
      createdAt?: string;
    }>;
  };
  pengiriman?: {
    id: string;
    status: string;
    kurirName?: string;
    kurirPhone?: string;
    catatan?: string;
    trackingHistory?: Array<{
      status: string;
      label?: string;
      note?: string;
      timestamp?: string;
      createdAt?: string;
    }>;
  };
}

const statusColor = (s: string) => {
  switch (s) {
    case "MENUNGGU_KONFIRMASI_SELLER":
      return "bg-amber-50/50 text-amber-600 border-amber-100/60";
    case "MENUNGGU_BAYAR":
      return "bg-blue-50/50 text-blue-600 border-blue-100/60";
    case "DIPROSES":
      return "bg-indigo-50/50 text-indigo-600 border-indigo-100/60";
    case "DIKIRIM":
      return "bg-sky-50/50 text-sky-600 border-sky-100/60";
    case "SELESAI":
      return "bg-emerald-50/50 text-emerald-600 border-emerald-100/60";
    case "DIBATALKAN":
      return "bg-red-50/50 text-red-550 border-red-100/60";
    default:
      return "bg-gray-50/50 text-gray-500 border-gray-100/60";
  }
};

const getShippingStatusLabel = (s: string) => {
  switch (s) {
    case "PREPARING":
      return "Disiapkan Seller";
    case "PICKUP_CONFIRMATION":
      return "Diserahkan ke Kurir";
    case "PICKED_UP":
      return "Diterima Kurir";
    case "IN_TRANSIT":
      return "Dalam Perjalanan";
    case "ARRIVED":
      return "Sampai di Tujuan";
    default:
      return s;
  }
};

export default function DetailPesananGrosirPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [geocoords, setGeocoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [showGudangModal, setShowGudangModal] = useState(false);
  const [showSuratJalanModal, setShowSuratJalanModal] = useState(false);
  const [myStore, setMyStore] = useState<any>(null);
  const [gudangList, setGudangList] = useState<any[]>([]);
  const [selectedGudangId, setSelectedGudangId] = useState("");
  const [loadingGudang, setLoadingGudang] = useState(false);

  useEffect(() => {
    storesApi
      .getMyStore()
      .then((res) => {
        const s = res?.data?.data || res?.data;
        if (s) setMyStore(s);
      })
      .catch(() => {});
  }, []);

  const handleCopyId = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    toast.success("ID Pesanan disalin!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await ordersApi.getById(id);
      let data = res?.data?.data || res?.data;
      if (data) {
        data = {
          ...data,
          shipping: data.shipping || data.pengiriman,
        };
      }
      setOrder(data);
    } catch (err) {
      console.error("Failed to fetch wholesale order detail:", err);
      setError("Gagal memuat detail pesanan grosir.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order?.alamatKirim) return;
    const lat =
      (order as any)?.alamatLat ||
      (order?.customer as any)?.alamatLat ||
      (order as any)?.konsumen?.alamatLat;
    const lng =
      (order as any)?.alamatLng ||
      (order?.customer as any)?.alamatLng ||
      (order as any)?.konsumen?.alamatLng;

    if (lat && lng) {
      setGeocoords({ lat, lng });
    } else {
      setGeocoding(true);
      setGeocodeError("");
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(order.alamatKirim)}&format=json&limit=1&email=admin@agrojabar.com`,
        { headers: { "Accept-Language": "id,en" } },
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setGeocoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          } else {
            setGeocodeError("Titik peta otomatis tidak ditemukan.");
          }
        })
        .catch(() => {
          setGeocodeError("Gagal memuat peta otomatis.");
        })
        .finally(() => {
          setGeocoding(false);
        });
    }
  }, [order?.alamatKirim]);

  const handleConfirm = async () => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      await ordersApi.confirmWholesale(id, { terima: true });
      toast.success("Pesanan grosir berhasil dikonfirmasi");
      await fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal konfirmasi pesanan";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAjukanGudang = async () => {
    setShowGudangModal(true);
    setLoadingGudang(true);
    try {
      const res = await apiClient.get("/toko/warehouses");
      const data = res.data?.data || res.data || [];
      setGudangList(data);
      if (data.length > 0) setSelectedGudangId(data[0].id);
    } catch (err) {
      toast.error("Gagal memuat daftar gudang");
    } finally {
      setLoadingGudang(false);
    }
  };

  const submitAjukanGudang = async () => {
    if (!id || actionLoading || !selectedGudangId) {
      if (!selectedGudangId)
        toast.error("Silakan pilih gudang terlebih dahulu");
      return;
    }
    setShowGudangModal(false);
    setActionLoading(true);
    try {
      await ordersApi.ajukanGudang(id, selectedGudangId);
      toast.success("Berhasil diajukan ke Gudang Express!");
      await fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengajukan ke Gudang";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600/80 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="bg-rose-50/50 text-rose-700 p-6 rounded-3xl flex items-center gap-3 border border-rose-100 shadow-sm">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <div className="space-y-0.5">
            <h3 className="font-medium text-sm text-rose-800">
              Terjadi Kesalahan
            </h3>
            <p className="text-xs text-rose-600 font-medium">
              {error || "Pesanan grosir tidak ditemukan."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unified normalization for robustness
  const accountName =
    order.customer?.name || order.konsumen?.nama || "Guest User";
  const accountEmail = order.customer?.email || order.konsumen?.email || "-";
  const accountPhone =
    order.customer?.phone || (order.customer as any)?.phoneNumber || "-";

  const recipientName =
    (order as any).penerima || (order.customer as any)?.penerima || accountName;
  const recipientPhone =
    (order as any).teleponPenerima ||
    (order.customer as any)?.teleponPenerima ||
    accountPhone;
  const isDifferent =
    (((order.customer as any)?.penerima &&
      (order.customer as any).penerima !== accountName) ||
      ((order as any).penerima && (order as any).penerima !== accountName)) ===
    true;

  const orderItems = order.item || order.items || [];
  const shipping = order.shipping || order.pengiriman;
  const history = Array.isArray(shipping?.trackingHistory)
    ? shipping.trackingHistory
    : [];

  const isPaidOrder = ["DIPROSES", "DIKIRIM", "SELESAI", "DITUTUP"].includes(
    order.status?.toUpperCase() || "",
  );
  const baseReferenceDate = new Date(
    isPaidOrder && order.updatedAt ? order.updatedAt : order.createdAt,
  );
  const estimasiMinDate = new Date(baseReferenceDate);
  estimasiMinDate.setDate(estimasiMinDate.getDate() + 2);
  const estimasiMaxDate = new Date(baseReferenceDate);
  estimasiMaxDate.setDate(estimasiMaxDate.getDate() + 5);

  const dateOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const estimasiTanggalTeks = `${estimasiMinDate.toLocaleDateString("id-ID", dateOpts)} – ${estimasiMaxDate.toLocaleDateString("id-ID", dateOpts)}`;

  const calculateTotalProfit = (orderData: OrderDetail) => {
    const itemsList = orderData.item || orderData.items || [];
    return itemsList.reduce((acc: number, it: any) => {
      const prod = it.produk || it.product;
      const hpp = prod?.hargaBeli || 0;
      if (hpp <= 0) return acc;
      const price = Number(it.harga) || 0;
      return acc + (price - hpp) * it.jumlah;
    }, 0);
  };

  const totalProfit = calculateTotalProfit(order);

  return (
    <div className="w-full space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/seller/pesanan-grosir")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shrink-0 active:scale-[0.98]"
          >
            <ArrowLeft size={14} className="text-slate-500" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowSuratJalanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-600 border border-emerald-600 text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-all active:scale-[0.98]"
            title="Cetak Surat Jalan / Delivery Note"
          >
            <FileText size={14} /> Surat Jalan
          </button>

          {order.status === "MENUNGGU_KONFIRMASI_SELLER" && (
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <CheckCircle size={14} /> Terima & Konfirmasi
                </>
              )}
            </button>
          )}
          {order.status === "DIPROSES" && (
            <button
              onClick={handleAjukanGudang}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Building size={14} /> Ajukan ke Gudang Express
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* No Pesanan Banner & Status (Sejajar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-3.5 px-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">
            No. Pesanan:
          </span>
          <span className="font-mono text-sm font-bold text-slate-800">
            #{order.id}
          </span>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors font-medium px-2 py-1 hover:bg-slate-50 rounded-lg"
            title="Salin ID Pesanan"
          >
            {copiedId ? (
              <>
                <CheckCircle size={13} className="text-emerald-500" />
                <span className="text-emerald-600 font-semibold text-[11px]">
                  Tersalin!
                </span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="text-[11px]">Salin ID</span>
              </>
            )}
          </button>
        </div>

        {/* Status Badge (Sejajar No Pesanan) */}
        <span
          className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusColor(order.status)}`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
            <h3 className="font-medium text-slate-800 text-base mb-5 flex items-center gap-2">
              <Package size={16} className="text-emerald-500" />
              Daftar Item Grosir
            </h3>

            <div className="space-y-4">
              {orderItems.map((it: any, idx: number) => {
                const prod = it.produk || it.product;
                const pName = prod?.nama || "Produk";
                const hpp = prod?.hargaBeli || 0;
                const price = Number(it.harga) || 0;
                const subtotal = price * it.jumlah;
                const itemProfit = hpp > 0 ? (price - hpp) * it.jumlah : 0;

                return (
                  <div
                    key={it.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/30 rounded-2xl border border-slate-100 hover:border-emerald-200/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-lg shrink-0 shadow-sm">
                        🥬
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-medium text-slate-800 text-sm sm:text-base leading-tight">
                          {pName}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 font-medium">
                            {it.jumlah} {prod?.satuan || "kg"} ×{" "}
                            {formatRupiah(price)}
                          </span>
                        </div>
                        {hpp > 0 && (
                          <div className="mt-1.5">
                            <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-medium uppercase tracking-wider border border-emerald-100/50">
                              Laba: {formatRupiah(itemProfit)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50 flex sm:flex-col justify-between items-center sm:items-end">
                      <span className="text-xs text-slate-500 font-medium sm:hidden">
                        Subtotal:
                      </span>
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800 text-base leading-none">
                          {formatRupiah(subtotal)}
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase font-medium tracking-widest mt-1 hidden sm:block">
                          Subtotal Item
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Packaging Details */}
            {order.kemasanGrosir &&
              Array.isArray(order.kemasanGrosir) &&
              order.kemasanGrosir.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-800 mb-3 flex items-center gap-1.5">
                    <Package size={14} className="text-emerald-500" />
                    Detail Kemasan (Packaging)
                  </h4>
                  <div className="grid gap-2">
                    {order.kemasanGrosir.map((pack: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100"
                      >
                        <span className="text-xs font-medium text-slate-600">
                          Kemasan {pack.ukuranKg} Kg
                        </span>
                        <span className="text-xs font-semibold text-slate-800 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                          {pack.jumlahBungkus} karung/box
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Estimasi Pengiriman Grosir Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 overflow-hidden space-y-3">
            <h3 className="font-medium text-slate-800 text-base flex items-center gap-2">
              <Truck size={16} className="text-emerald-500" />
              Estimasi Pengiriman Grosir
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              2 – 5 Hari Kerja{" "}
              {isPaidOrder
                ? "dari pembayaran berhasil"
                : "setelah pembayaran berhasil"}
            </p>
            <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600 shrink-0" />
                Estimasi Tanggal Tiba:
              </span>
              <span className="font-semibold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200/60 shadow-sm">
                {estimasiTanggalTeks}
              </span>
            </div>
          </div>

          {/* Address Card (Moved to Left Side to solve empty space on desktop) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 overflow-hidden">
            <h3 className="font-medium text-slate-800 text-base mb-5 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" />
              Alamat Pengiriman
            </h3>
            <div className="flex items-start gap-2 mb-3">
              <p className="text-xs md:text-sm text-slate-655 leading-relaxed flex-1 font-medium">
                {order.alamatKirim || "Default Warehouse"}
              </p>
              <button
                onClick={() => {
                  if (order.alamatKirim) {
                    navigator.clipboard.writeText(order.alamatKirim);
                    toast.success("Alamat berhasil disalin");
                  }
                }}
                className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                title="Salin Alamat"
              >
                <Copy size={13} />
              </button>
            </div>
            {order.catatan && (
              <div className="mb-4 bg-amber-50/50 text-amber-800 p-3.5 rounded-2xl border border-amber-100/60 text-xs font-medium">
                <p className="font-medium text-amber-700 mb-0.5">
                  Catatan Pembeli:
                </p>
                <p className="italic">&ldquo;{order.catatan}&rdquo;</p>
              </div>
            )}

            {/* Map Section */}
            <div className="mt-4 border-t border-slate-50 pt-4 space-y-3">
              {geocodeError ? (
                <div className="h-40 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100">
                  <MapPin size={18} className="text-slate-300 animate-pulse" />
                  <p className="text-xs text-slate-400 text-center px-4 font-medium">
                    {geocodeError}
                    <br />
                    <span className="text-[10px] opacity-70">
                      Gunakan tombol Google Maps di bawah
                    </span>
                  </p>
                </div>
              ) : geocoding ? (
                <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 border border-slate-100">
                  <Loader2
                    size={16}
                    className="animate-spin text-emerald-500/80"
                  />
                  <p className="text-xs text-slate-400 font-medium">
                    Mencari lokasi di peta...
                  </p>
                </div>
              ) : geocoords ? (
                <div className="rounded-2xl overflow-hidden border border-slate-100 relative">
                  <MapView
                    lat={geocoords.lat}
                    lng={geocoords.lng}
                    height="160px"
                  />
                  <div className="px-3 py-1.5 bg-slate-50 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                    <span>OpenStreetMap</span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${geocoords.lat}&mlon=${geocoords.lng}#map=17/${geocoords.lat}/${geocoords.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-medium hover:underline"
                    >
                      Peta Penuh
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Navigation Action */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const lat =
                      geocoords?.lat ||
                      (order.customer as any)?.alamatLat ||
                      (order as any).konsumen?.alamatLat;
                    const lng =
                      geocoords?.lng ||
                      (order.customer as any)?.alamatLng ||
                      (order as any).konsumen?.alamatLng;
                    const url =
                      lat && lng
                        ? `https://www.google.com/maps?q=${lat},${lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.alamatKirim || "")}`;
                    window.open(url, "_blank");
                  }}
                  className="flex-1 py-2.5 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-600 text-xs font-medium rounded-xl transition-all border border-emerald-100/60 flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
                >
                  <ExternalLink size={12} />
                  Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Tracking Card */}
          {shipping && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
              <h3 className="font-medium text-slate-800 text-base mb-5 flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" />
                Status & Riwayat Pengiriman
              </h3>

              {shipping.kurirName && (
                <div className="bg-emerald-50/50 rounded-2xl p-4 mb-6 border border-emerald-100/60 text-xs flex justify-between items-center flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">
                      Kurir yang Bertugas
                    </p>
                    <p className="font-medium text-emerald-800 text-base">
                      {shipping.kurirName}
                    </p>
                  </div>
                  {shipping.kurirPhone && (
                    <a
                      href={`tel:${shipping.kurirPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-medium rounded-xl text-xs transition-all shadow-sm active:scale-[0.98]"
                    >
                      <Phone size={11} /> {shipping.kurirPhone}
                    </a>
                  )}
                </div>
              )}

              {/* History Steps */}
              {history.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
                  {[...history].reverse().map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50 shadow-sm" />
                      <div className="space-y-1">
                        <p className="font-medium text-slate-800 text-sm">
                          {h.label || getShippingStatusLabel(h.status)}
                        </p>
                        {h.note && (
                          <p className="text-slate-500 text-xs mt-0.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100 inline-block font-medium">
                            {h.note}
                          </p>
                        )}
                        <p className="text-slate-400 text-[10px] font-medium">
                          {formatTanggal(h.timestamp || h.createdAt || "")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Belum ada riwayat pengiriman untuk pesanan ini.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Payment breakdown card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-medium text-slate-800 text-base border-b border-slate-50 pb-3">
              Ringkasan Transaksi
            </h3>
            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Pesanan</span>
                <span className="font-medium text-slate-700">
                  {formatTanggal(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Pembayaran</span>
                <span className="font-medium text-slate-700">
                  {order.metodeBayar || "Bank Transfer"}
                </span>
              </div>

              {totalProfit > 0 && (
                <div className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100/60 p-2.5 rounded-xl">
                  <span className="text-emerald-600 font-medium text-[11px]">
                    Estimasi Laba Bersih
                  </span>
                  <span className="font-medium text-emerald-600 text-sm">
                    {formatRupiah(totalProfit)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block">
                    Total Harga
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sudah termasuk PPN
                  </span>
                </div>
                <span className="font-medium text-xl md:text-2xl text-emerald-600">
                  {formatRupiah(order.totalHarga)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer info card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
            <h3 className="font-medium text-slate-800 text-base mb-5 flex items-center gap-2">
              <User size={16} className="text-emerald-500" />
              Penerima & Konsumen
            </h3>
            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Nama Penerima</span>
                <span className="font-medium text-slate-700">
                  {recipientName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">No. Telp Penerima</span>
                <span className="font-medium text-slate-700">
                  {recipientPhone}
                </span>
              </div>

              {isDifferent && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  <p className="font-medium text-slate-400 uppercase tracking-wider text-[9px]">
                    Detail Akun Pemesan:
                  </p>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nama Akun</span>
                    <span className="font-medium text-slate-600">
                      {accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="font-medium text-slate-600">
                      {accountEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Telepon</span>
                    <span className="font-medium text-slate-600">
                      {accountPhone}
                    </span>
                  </div>
                </div>
              )}

              {!isDifferent && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Pemesan</span>
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                    {accountEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GUDANG SELECTION MODAL */}
      {showGudangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Building size={20} className="text-indigo-600" />
                Pilih Gudang Tujuan
              </h3>
              <button
                onClick={() => setShowGudangModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4 font-medium">
                Pilih gudang Express tempat pengajuan stok ini akan diteruskan:
              </p>

              {loadingGudang ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : gudangList.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">
                    Tidak ada gudang tersedia.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {gudangList.map((g) => (
                    <label
                      key={g.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedGudangId === g.id
                          ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gudang"
                        value={g.id}
                        checked={selectedGudangId === g.id}
                        onChange={(e) => setSelectedGudangId(e.target.value)}
                        className="mt-1 flex-shrink-0 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {g.nama}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {g.alamat || "-"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowGudangModal(false)}
                className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={submitAjukanGudang}
                disabled={!selectedGudangId || loadingGudang}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
              >
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CETAK SURAT JALAN MODAL */}
      {showSuratJalanModal && (
        <CetakSuratJalanModal
          order={order as any}
          storeInfo={myStore}
          onClose={() => setShowSuratJalanModal(false)}
        />
      )}
    </div>
  );
}
