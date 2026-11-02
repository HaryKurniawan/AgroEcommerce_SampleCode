"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Truck,
  MapPin,
  User,
  CheckCircle,
  Copy,
  Calendar,
  CreditCard,
  Printer,
  FileText,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  formatRupiah,
  formatTanggal,
  ordersApi,
  storesApi,
  shippingApi,
} from "@/lib/ecommerce-api";

import CetakResiModal from "../_components/CetakResiModal";
import CetakSuratJalanModal from "../_components/CetakSuratJalanModal";
import InitShippingModal from "../_components/InitShippingModal";
import AdvanceStatusModal from "../_components/AdvanceStatusModal";
import {
  getNextStatus,
  getStatusLabel as getShippingStatusLabel,
} from "../../_utils/shipping-status";

const getStatusLabel = (s: string) => {
  switch (s) {
    case "PREPARING":
      return "Disiapkan";
    case "PICKUP_CONFIRMATION":
      return "Diserahkan ke Kurir";
    case "PICKED_UP":
      return "Diterima Kurir";
    case "IN_TRANSIT":
      return "Dalam Perjalanan";
    case "ARRIVED":
      return "Sampai";
    default:
      return s;
  }
};

const TRACKING_STEPS = [
  "PREPARING",
  "PICKUP_CONFIRMATION",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
];

interface OrderDetail {
  id: string;
  status: string;
  totalHarga: number | string;
  metodeBayar: string;
  alamatKirim: string;
  catatan?: string;
  createdAt: string;
  updatedAt?: string;
  customer?: { name?: string; email?: string; phone?: string };
  alamatLat?: number;
  alamatLng?: number;
  items?: Array<{
    id: string;
    jumlah: number;
    harga: number | string;
    grade?: string;
    product?: {
      nama: string;
      namaEtalase?: string;
      gambarUrl?: string;
      satuan?: string;
    };
  }>;
  shipping?: {
    id: string;
    status: string;
    kurirName?: string;
    kurirPhone?: string;
    catatan?: string;
    buktiKirimFoto?: string[];
    buktiKirimCatatan?: string;
    buktiKirimWaktu?: string;
    trackingHistory?: Array<{
      status: string;
      label?: string;
      note?: string;
      timestamp?: string;
      createdAt?: string;
    }>;
  };
}

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  MENUNGGU_BAYAR: {
    label: "Menunggu Bayar",
    color: "text-amber-600 bg-amber-50",
    dot: "bg-amber-400",
  },
  MENUNGGU_KONFIRMASI_SELLER: {
    label: "Menunggu Konfirmasi",
    color: "text-blue-600 bg-blue-50",
    dot: "bg-blue-400",
  },
  DIPROSES: {
    label: "Diproses",
    color: "text-blue-600 bg-blue-50",
    dot: "bg-blue-400",
  },
  DIKIRIM: {
    label: "Dikirim",
    color: "text-emerald-600 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  SELESAI: {
    label: "Selesai",
    color: "text-emerald-600 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  DITUTUP: {
    label: "Ditutup",
    color: "text-gray-500 bg-gray-50",
    dot: "bg-gray-400",
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    color: "text-rose-600 bg-rose-50",
    dot: "bg-rose-400",
  },
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 text-right">{value || "–"}</span>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-gray-300" />
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

export default function DetailPesananSellerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showResiModal, setShowResiModal] = useState(false);
  const [showSuratJalanModal, setShowSuratJalanModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [myStore, setMyStore] = useState<any>(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("ID Pesanan disalin!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const fetchOrder = useCallback(
    async (showLoadingState = false) => {
      if (!id) return;
      if (showLoadingState) setLoading(true);
      try {
        const res = await ordersApi.getById(id);
        let data = res?.data?.data || res?.data;
        if (data) {
          data = {
            ...data,
            shipping: data.shipping || data.pengiriman,
            customer: data.customer || {
              name: data.konsumen?.nama,
              email: data.konsumen?.email,
              phone:
                data.konsumen?.noTelepon ||
                data.konsumen?.addresses?.[0]?.telepon,
            },
            items: (data.items || data.item || []).map((it: any) => ({
              ...it,
              product: it.product || it.produk,
            })),
          };
          if (data.konsumen?.addresses?.length > 0) {
            data.alamatLat = data.konsumen.addresses[0].lat;
            data.alamatLng = data.konsumen.addresses[0].lng;
          }
          if (data.isGrosir) {
            router.replace(`/seller/pesanan-grosir/${data.id}`);
            return;
          }
        }
        setOrder(data);
        setError("");
      } catch (err) {
        setError("Gagal memuat detail pesanan.");
      } finally {
        if (showLoadingState) setLoading(false);
      }
    },
    [id, router],
  );

  useEffect(() => {
    fetchOrder(true);
  }, [fetchOrder]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeRes = await storesApi.getMyStore();
        const storeData = storeRes?.data?.data || storeRes?.data;
        if (storeData) {
          setMyStore(storeData);
        }
      } catch (err) {
        console.error("Gagal memuat info toko:", err);
      }
    };
    fetchStore();
  }, []);

  const handleInitShipping = async () => {
    if (!order) return;
    if (
      !myStore?.courierStaff &&
      (!myStore?.kurirStaffs || myStore.kurirStaffs.length === 0)
    ) {
      toast.error(
        "Gudang Anda belum didaftarkan Kurir oleh Admin. Hubungi Admin Pusat untuk menugaskan kurir ke gudang Anda.",
      );
      return;
    }
    setActionLoading("init");
    try {
      const orderId =
        order.id ||
        (order as any).id_pesanan ||
        (order as any).id_pesananEcom ||
        id;
      await shippingApi.init(orderId);
      await fetchOrder();
      setSuccessMessage("Status pesanan berhasil diperbarui!");
      setShowSuccessModal(true);
      setShowInitModal(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pengiriman");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvanceStatus = async (
    note: string,
    kurirId?: string,
    sendEmailNotification?: boolean,
  ) => {
    if (!order) return;
    setActionLoading("advance");
    try {
      const payload: any = { note, sendEmailNotification };
      if (kurirId) {
        const selectedCourier =
          myStore?.kurirStaffs?.find(
            (c: any) => (c.id || c.id_pengguna) === kurirId,
          ) ||
          (myStore?.courierStaff &&
          (myStore.courierStaff.id || myStore.courierStaff.id_pengguna) ===
            kurirId
            ? myStore.courierStaff
            : null);
        if (selectedCourier) {
          payload.kurirPenggunaId =
            selectedCourier.id || selectedCourier.id_pengguna;
          payload.kurirName =
            selectedCourier.nama || selectedCourier.name || "Kurir Toko";
          payload.kurirPhone =
            selectedCourier.noTelepon ||
            selectedCourier.phoneNumber ||
            undefined;
        }
      }
      const orderId =
        order.id ||
        (order as any).id_pesanan ||
        (order as any).id_pesananEcom ||
        id;
      await shippingApi.advance(orderId, payload);
      await fetchOrder();
      setSuccessMessage("Status pesanan berhasil diperbarui!");
      setShowSuccessModal(true);
      setShowAdvanceModal(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status pengiriman");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSellerConfirm = async () => {
    const orderId =
      order?.id ||
      (order as any)?.id_pesananEcom ||
      (order as any)?.id_pesanan ||
      id;
    if (!orderId || confirmLoading) return;
    try {
      setConfirmLoading(true);
      await ordersApi.sellerConfirm(orderId);
      toast.success("Pesanan berhasil dikonfirmasi & ditutup!");
      const res = await ordersApi.getById(orderId);
      const data = res?.data?.data || res?.data;
      if (data) setOrder({ ...order, ...data, status: "DITUTUP" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Gagal mengkonfirmasi pesanan",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        <p className="text-xs text-gray-400">Memuat detail pesanan…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={13} /> Kembali
        </button>
        <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl flex items-center gap-3 border border-rose-100">
          <AlertCircle size={16} />
          <p className="text-sm">{error || "Pesanan tidak ditemukan."}</p>
        </div>
      </div>
    );
  }

  const shipping = order.shipping;
  const history = Array.isArray(shipping?.trackingHistory)
    ? shipping.trackingHistory
    : [];

  const sc = statusConfig[order.status] || {
    label: order.status,
    color: "text-gray-500 bg-gray-50",
    dot: "bg-gray-400",
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/seller/pesanan")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shrink-0 active:scale-[0.98]"
          >
            <ArrowLeft size={14} className="text-slate-500" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cetak Surat Jalan */}
          {(order.status === "DIPROSES" ||
            order.status === "DIKIRIM" ||
            !!order.shipping) && (
            <button
              onClick={() => setShowSuratJalanModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-600 border border-emerald-600 text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-xs active:scale-[0.98]"
              title="Cetak Surat Jalan / Delivery Note"
            >
              <FileText size={14} /> Surat Jalan
            </button>
          )}

          {/* Cetak Resi */}
          {order.status === "DIPROSES" && (
            <button
              onClick={() => setShowResiModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-600 border border-emerald-600 text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-xs active:scale-[0.98]"
              title="Cetak Resi Pengiriman"
            >
              <Printer size={14} /> Cetak Resi
            </button>
          )}

          {/* Aksi Update Status (Pojok Kanan) */}
          {order.status === "DIPROSES" && !order.shipping && (
            <button
              onClick={() => setShowInitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
            >
              <Truck size={14} /> Proses Pengiriman
            </button>
          )}

          {order.shipping && getNextStatus(order.shipping.status) && (
            <button
              onClick={() => setShowAdvanceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
            >
              <Truck size={14} /> Update Status:{" "}
              {getShippingStatusLabel(
                getNextStatus(order.shipping.status) || "",
              )}
            </button>
          )}
        </div>
      </div>

      {/* Banner No Pesanan & Status Pesanan (Sejajar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-3.5 px-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">
            No. Pesanan:
          </span>
          <span className="font-mono text-sm font-bold text-slate-800">
            #{id}
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

        {/* Status Pesanan (Sejajar No Pesanan di Pojok Kanan) */}
        <span
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.color} border border-slate-100/60`}
        >
          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* 1. Customer (Pelanggan) */}
      <SectionCard>
        <SectionLabel icon={User} label="Pelanggan" />
        <InfoRow label="Nama" value={order.customer?.name} />
        <InfoRow label="Email" value={order.customer?.email} />
        <InfoRow label="Telepon" value={order.customer?.phone} />
      </SectionCard>

      {/* 2. Items (Item Pesanan / Daftar Produk - DIATAS Alamat Pengiriman) */}
      <SectionCard>
        <SectionLabel icon={Package} label="Item Pesanan" />
        <div className="space-y-0">
          {order.items?.map((item, i) => (
            <div
              key={item.id || i}
              className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                {item.product?.gambarUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.product.gambarUrl}
                      alt={item.product.nama?.replace(" - ", " ") || "Produk"}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={14} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">
                  {item.product?.namaEtalase ||
                    item.product?.nama?.replace(" - ", " ") ||
                    "Produk"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.jumlah} {item.product?.satuan || "kg"} ×{" "}
                  {formatRupiah(item.harga)}
                  {item.grade && (
                    <span className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Grade {item.grade}
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-700 shrink-0">
                {formatRupiah(item.jumlah * Number(item.harga))}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Address (Alamat Pengiriman - DIBAWAH Item Pesanan) */}
      <SectionCard>
        <SectionLabel icon={MapPin} label="Alamat Pengiriman" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {order.alamatKirim || "–"}
        </p>
        {order.catatan && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
            <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
              Catatan
            </span>
            <p className="text-[11px] text-gray-600">{order.catatan}</p>
          </div>
        )}
        {order.alamatLat && order.alamatLng && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <a
              href={`https://www.google.com/maps?q=${order.alamatLat},${order.alamatLng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <MapPin size={12} /> Buka di Google Maps
            </a>
          </div>
        )}
      </SectionCard>

      {/* Payment */}
      <SectionCard>
        <SectionLabel icon={CreditCard} label="Ringkasan Pembayaran" />
        <InfoRow label="Metode Bayar" value={order.metodeBayar} />
        <InfoRow
          label="Tanggal Pesanan"
          value={formatTanggal(order.createdAt)}
        />
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-base text-gray-900">
            {formatRupiah(order.totalHarga)}
          </span>
        </div>
      </SectionCard>

      {/* Shipping Tracking */}
      {shipping && (
        <SectionCard>
          <SectionLabel icon={Truck} label="Status Pengiriman" />

          {shipping.kurirName && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-6 h-6 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                <Truck size={12} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-700">{shipping.kurirName}</p>
                {shipping.kurirPhone && (
                  <p className="text-[10px] text-gray-400">
                    {shipping.kurirPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step tracker */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            {TRACKING_STEPS.map((st, idx) => {
              const stepIdx = TRACKING_STEPS.indexOf(st);
              const currentIdx = TRACKING_STEPS.indexOf(shipping.status);
              const done = stepIdx < currentIdx;
              const current = shipping.status === st;
              return (
                <div key={st} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        current
                          ? "bg-blue-500"
                          : done
                            ? "bg-emerald-500"
                            : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`text-[9px] whitespace-nowrap ${
                        current
                          ? "text-blue-600"
                          : done
                            ? "text-emerald-600"
                            : "text-gray-400"
                      }`}
                    >
                      {getStatusLabel(st)}
                    </span>
                  </div>
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`w-6 h-px mb-3 ${done || current ? "bg-emerald-200" : "bg-gray-100"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* History timeline */}
          {history.length > 0 && (
            <div className="border-t border-gray-50 pt-4 space-y-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Riwayat
              </p>
              {[...history].reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    {i < history.length - 1 && (
                      <div
                        className="w-px bg-gray-100 flex-1 mt-1 mb-0"
                        style={{ minHeight: 20 }}
                      />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-gray-700">
                      {h.label || getStatusLabel(h.status)}
                    </p>
                    {h.note && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {h.note}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {formatTanggal(h.timestamp || h.createdAt || "")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bukti Pengiriman */}
          {shipping.buktiKirimFoto && shipping.buktiKirimFoto.length > 0 && (
            <div className="border-t border-gray-50 pt-4 mt-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Bukti Pengiriman (Tiba di Tujuan)
              </p>
              <div className="flex gap-2 flex-wrap">
                {shipping.buktiKirimFoto.map((foto, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(foto)}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer">
                      <Image
                        src={foto}
                        alt={`Bukti ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
              {shipping.buktiKirimCatatan && (
                <div className="mt-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-500 block mb-0.5 uppercase tracking-widest">
                    Catatan Kurir:
                  </span>
                  <p className="text-xs text-gray-700">
                    {shipping.buktiKirimCatatan}
                  </p>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      {/* Seller Confirm — SELESAI */}
      {order.status === "SELESAI" && (
        <SectionCard>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle size={15} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-800">
                Pembeli telah mengkonfirmasi penerimaan
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Pesanan telah selesai. Anda dapat menutup pesanan ini.
              </p>
            </div>
          </div>

          <button
            onClick={handleSellerConfirm}
            disabled={confirmLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            {confirmLoading ? "Memproses..." : "Konfirmasi & Tutup Pesanan"}
          </button>
        </SectionCard>
      )}

      {/* Ditutup */}
      {order.status === "DITUTUP" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
          <CheckCircle size={14} className="text-gray-400" />
          <p className="text-xs text-gray-500">
            Pesanan ini sudah ditutup oleh seller.
          </p>
        </div>
      )}

      {/* Cetak Resi Modal */}
      {showResiModal && (
        <CetakResiModal
          order={
            {
              id: order.id,
              status: order.status,
              totalHarga: order.totalHarga,
              metodeBayar: order.metodeBayar,
              createdAt: order.createdAt,
              penerima: order.customer?.name,
              alamatKirim: order.alamatKirim,
              customer: order.customer
                ? {
                    name: order.customer.name,
                    email: order.customer.email,
                    phone: order.customer.phone,
                  }
                : undefined,
              items: order.items?.map((it) => ({
                product: it.product,
                jumlah: it.jumlah,
                harga: it.harga,
              })),
            } as any
          }
          onClose={() => setShowResiModal(false)}
        />
      )}
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] h-full flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 md:-top-6 md:-right-6 text-white/70 hover:text-white z-50 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Foto Full"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* Init Shipping Modal */}
      {showInitModal && (
        <InitShippingModal
          order={order as any}
          onClose={() => setShowInitModal(false)}
          onConfirm={handleInitShipping}
          loading={actionLoading === "init"}
        />
      )}

      {/* Advance Status Modal */}
      {showAdvanceModal && (
        <AdvanceStatusModal
          order={order as any}
          onClose={() => setShowAdvanceModal(false)}
          couriers={(myStore?.kurirStaffs && myStore.kurirStaffs.length > 0
            ? myStore.kurirStaffs
            : myStore?.courierStaff
              ? [myStore.courierStaff]
              : []
          ).map((c: any) => ({ ...c, id: c.id || c.id_pengguna }))}
          onConfirm={handleAdvanceStatus}
          loading={actionLoading === "advance"}
        />
      )}

      {/* Cetak Surat Jalan Modal */}
      {showSuratJalanModal && (
        <CetakSuratJalanModal
          order={order as any}
          storeInfo={myStore}
          onClose={() => setShowSuratJalanModal(false)}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4">
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm overflow-hidden text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Berhasil!</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Oke
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};
