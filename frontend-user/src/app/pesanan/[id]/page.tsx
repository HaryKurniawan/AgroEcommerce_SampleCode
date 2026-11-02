"use client";

import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Modal, ConfigProvider } from "antd";
import {
  ArrowLeft,
  Store,
  Loader2,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  Star,
  MessageCircle,
  ShoppingBag,
  Wallet,
  ChevronRight,
  Camera,
  Package,
  Tag,
  TrendingUp,
  Truck,
} from "lucide-react";
import Image from "next/image";

import { formatRupiah, formatTanggal } from "@/lib/ecommerce-api";
import type { ApiOrderItem } from "@/types";
import { useOrderEvents } from "@/src/hooks/order/useOrderEvents";
import { OrderDetailSkeleton } from "@/src/components/ecommerce/Skeleton";
import EmptyState from "@/src/components/ecommerce/EmptyState";
import { useOrderDetail, useCountdown } from "@/hooks";

import ShippingTrackingSection from "../../../components/pesanan/ShippingTrackingSection";
import PaymentCountdown from "../../../components/pesanan/PaymentCountdown";
import OrderIdStrip from "../../../components/pesanan/OrderIdStrip";
import {
  ORDER_ROADMAP,
  ORDER_STATUS_COLORS,
} from "../../../components/pesanan/order-status.constants";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BCA_VA: "BCA Virtual Account",
  MANDIRI_VA: "Mandiri Virtual Account",
  BNI_VA: "BNI Virtual Account",
  BRI_VA: "BRI Virtual Account",
  PERMATA_VA: "Permata Virtual Account",
  GOPAY: "GoPay",
  SHOPEEPAY: "ShopeePay",
  OVO: "OVO",
  DANA: "DANA",
  QRIS: "QRIS",
  MANUAL_TRANSFER: "Transfer Bank Manual",
  TUNAI: "Tunai",
  KREDIT: "Kredit (Tempo)",
};

function formatMetodeBayar(method: string | undefined | null): string {
  if (!method) return "-";
  return PAYMENT_METHOD_LABELS[method] || method.replace(/_/g, " ");
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

const OrderDetailContent = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Real-time order updates
  useOrderEvents();

  const {
    order,
    loading,
    confirming,
    chattingLoading,
    copied,
    handleConfirm,
    handleChat,
    handleCopy,
  } = useOrderDetail(id);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const timeLeft = useCountdown(order?.createdAt);

  // Auto-konfirmasi ketika scan QR resi — URL ?konfirmasi=1
  const searchParams = useSearchParams();
  const konfirmasiParam = searchParams?.get("konfirmasi");
  const autoConfirmRef = React.useRef(false);
  React.useEffect(() => {
    if (
      konfirmasiParam === "1" &&
      !autoConfirmRef.current &&
      order &&
      (order.status === "DIKIRIM" ||
        (order as any).pengiriman?.status === "ARRIVED") &&
      !confirming
    ) {
      autoConfirmRef.current = true;
      handleConfirm();
    }
  }, [konfirmasiParam, order, confirming, handleConfirm]);

  React.useEffect(() => {
    if (
      order?.status === "MENUNGGU_BAYAR" &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0
    ) {
      const expiry = new Date(order.createdAt).getTime() + 1 * 60 * 60 * 1000;
      if (Date.now() >= expiry) {
        const reloadKey = `reloaded_${order.id_pesanan}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "true");
          window.location.reload();
        }
      }
    }
  }, [order?.status, order?.createdAt, order?.id_pesanan, timeLeft]);

  if (loading) return <OrderDetailSkeleton />;
  if (!order)
    return (
      <div className="min-h-screen bg-white pt-20">
        <EmptyState
          title="Pesanan Tidak Ditemukan"
          description="Pesanan tidak dapat ditemukan."
          illustration="empty-order.svg"
          actionLabel="Kembali"
          onAction={() => router.push("/pesanan")}
        />
      </div>
    );

  let statusKey = order.status?.toUpperCase() || "";
  if (
    statusKey === "DIKIRIM" &&
    (order as any).pengiriman?.status === "ARRIVED"
  ) {
    statusKey = "ARRIVED";
  }
  const colors =
    ORDER_STATUS_COLORS.get(statusKey) || ORDER_STATUS_COLORS.get("DIPROSES")!;

  // Backend uses 'item', each item has 'produk', and 'produk' has 'toko'
  const items = (order as any).item || [];
  const storeName =
    items[0]?.produk?.toko?.nama || (order as any).storeName || "Toko";

  const subtotal =
    items.reduce(
      (a: number, i: any) => a + Number(i.jumlah || 0) * Number(i.harga || 0),
      0,
    ) || 0;

  const isGrosir = !!(order as any).isGrosir;
  const userCatatan = (order as any).catatan || "";
  let packagingSpecsRaw = [];
  try {
    const raw = (order as any).kemasanGrosir;
    if (typeof raw === "string") {
      packagingSpecsRaw = JSON.parse(raw);
    } else if (Array.isArray(raw)) {
      packagingSpecsRaw = raw;
    }
  } catch (e) {
    packagingSpecsRaw = [];
  }

  const packagingSpecs = isGrosir
    ? packagingSpecsRaw.map((s: any) => {
        const jumlah =
          (order as any).item?.reduce(
            (sum: number, i: any) => sum + Number(i.jumlah || 0),
            0,
          ) || 0;
        const sisa = jumlah % (s.ukuranKg || 1);
        return { ...s, sisa };
      })
    : [];

  const diskonGrosirPersen: number = (order as any).diskonGrosirPersen || 0;
  const diskonNominal =
    diskonGrosirPersen > 0
      ? Math.round((subtotal * diskonGrosirPersen) / 100)
      : 0;

  const isPaidOrder = ["DIPROSES", "DIKIRIM", "SELESAI", "DITUTUP"].includes(
    order.status?.toUpperCase() || "",
  );

  let estimasiTanggalTeks = "Menunggu Pembayaran";
  if (order.status?.toUpperCase() === "MENUNGGU_KONFIRMASI_SELLER") {
    estimasiTanggalTeks = "Menunggu Konfirmasi Seller";
  } else if (isGrosir && !isPaidOrder) {
    estimasiTanggalTeks = "Menunggu Konfirmasi Seller";
  } else if (isGrosir && isPaidOrder && order.updatedAt) {
    const baseReferenceDate = new Date(order.updatedAt);
    const estimasiMinDate = new Date(baseReferenceDate);
    estimasiMinDate.setDate(estimasiMinDate.getDate() + 2);
    const estimasiMaxDate = new Date(baseReferenceDate);
    estimasiMaxDate.setDate(estimasiMaxDate.getDate() + 5);

    const dateOpts: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    estimasiTanggalTeks = `${estimasiMinDate.toLocaleDateString("id-ID", dateOpts)} – ${estimasiMaxDate.toLocaleDateString("id-ID", dateOpts)}`;
  } else {
    // Estimasi reguler (bukan grosir atau belum bayar)
    const baseReferenceDate = order.createdAt
      ? new Date(order.createdAt)
      : new Date();
    const estimasiDate = new Date(baseReferenceDate);
    if (estimasiDate.getHours() >= 15) {
      estimasiDate.setDate(estimasiDate.getDate() + 1);
    }
    const dateOpts: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    estimasiTanggalTeks = estimasiDate.toLocaleDateString("id-ID", dateOpts);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100/80">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center relative justify-center">
          <button
            onClick={() => router.push("/pesanan")}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 lg:hidden absolute left-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-semibold text-[15px] text-gray-900 text-center">
            Detail Pesanan
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        {/* Countdown for pending payment (Paling Atas) */}
        {statusKey === "MENUNGGU_BAYAR" && (
          <PaymentCountdown timeLeft={timeLeft} />
        )}

        {/* Order ID Strip */}
        <OrderIdStrip
          orderId={order.id_pesanan}
          statusLabel={
            ORDER_ROADMAP.find((r) => r.key === statusKey)?.label ||
            statusKey
              .split("_")
              .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
              .join(" ")
          }
          statusColorClasses={`${colors.bg} ${colors.text}`}
          copied={copied}
          onCopy={handleCopy}
        />

        {/* Address */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <MapPin size={13} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-sm text-gray-800">
              Alamat Pengiriman
            </h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {order.alamatKirim}
          </p>
          {isGrosir && (
            <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
              <Calendar size={12} />
              <span>
                Jadwal:{" "}
                <span className="font-semibold text-gray-600">
                  {order.jadwalKirim
                    ? formatTanggal(String(order.jadwalKirim))
                    : "Menyesuaikan Pembayaran"}
                </span>
              </span>
            </div>
          )}
        </section>

        {/* Store + Items */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Store header */}
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <Store size={13} className="text-primary-600" />
              </div>
              <span className="font-semibold text-[13px] text-gray-800">
                {storeName}
              </span>
            </div>
            <button
              onClick={handleChat}
              disabled={chattingLoading}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
            >
              {chattingLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <MessageCircle size={12} />
              )}
              Chat Seller
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="px-5 py-4 flex gap-3.5">
                <div className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center text-xl">
                  {item.produk?.gambarUrl ? (
                    <Image
                      src={item.produk.gambarUrl}
                      alt={item.produk.nama?.replace(" - ", " ") || ""}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {item.produk?.nama?.replace(" - ", " ") || "Item"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.jumlah} x {formatRupiah(item.harga)}
                  </p>
                </div>
                <p className="text-[13px] font-semibold text-gray-800 self-center flex-shrink-0">
                  {formatRupiah(
                    Number(item.jumlah || 0) * Number(item.harga || 0),
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Grosir — Kemasan yang Dipesan */}
        {isGrosir && packagingSpecs.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-primary-50/60 border-b border-gray-200 flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <Package size={13} className="text-primary-600" />
              </div>
              <h2 className="font-semibold text-[13px] text-primary-800">
                Kemasan yang Dipesan
              </h2>
              <span className="ml-auto text-[10px] text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <TrendingUp size={9} /> Grosiran
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {packagingSpecs.map((spec: any, idx: number) => {
                const fullBags = spec.jumlahBungkus;
                const hasSisa = spec.sisa > 0;
                return (
                  <div key={idx} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package size={16} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800">
                        Kemasan {spec.ukuranKg} kg
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {fullBags} bungkus @ {spec.ukuranKg} kg
                        {hasSisa && (
                          <span className="ml-1.5 text-amber-500">
                            + 1 kemasan isi {spec.sisa} kg
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-gray-700">
                        {fullBags + (hasSisa ? 1 : 0)} bungkus
                      </p>
                      <p className="text-[10px] text-gray-400">
                        = {spec.ukuranKg * fullBags + (hasSisa ? spec.sisa : 0)}{" "}
                        kg
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {userCatatan && (
              <div className="px-5 py-3 border-t border-dashed border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">
                  Catatan
                </p>
                <p className="text-xs text-gray-600">{userCatatan}</p>
              </div>
            )}
          </section>
        )}

        {/* Shipping Tracking */}
        {(order as any).pengiriman && (
          <ShippingTrackingSection shipping={(order as any).pengiriman} />
        )}

        {/* Estimasi Pengiriman */}
        <section className="bg-primary-50/70 rounded-2xl border border-primary-200/80 p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
              <Truck size={13} className="text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-xs text-primary-900 uppercase tracking-wider">
                {isGrosir
                  ? "Estimasi Pengiriman Grosir"
                  : "Estimasi Pengiriman"}
              </h2>
              <p className="text-[11px] text-primary-700 font-medium">
                {isGrosir
                  ? `2 - 5 Hari Kerja ${isPaidOrder ? "dari pembayaran berhasil" : "setelah pembayaran berhasil"}`
                  : "Operasional s/d pukul 15.00"}
              </p>
            </div>
          </div>
          <div className="bg-white/90 rounded-xl p-3 border border-primary-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-primary-800 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-primary-600 shrink-0" />
              Estimasi Tanggal Tiba:
            </span>
            <span className="font-semibold text-primary-900 bg-primary-100/70 px-2.5 py-1 rounded-lg">
              {estimasiTanggalTeks}
            </span>
          </div>
        </section>

        {/* Foto Sebelum Kirim */}
        {order.fotoSebelumKirimUrl && (
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <Camera size={13} className="text-primary-600" />
              </div>
              <h2 className="font-semibold text-sm text-gray-800">
                Foto Sebelum Kirim (Dari Seller)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Ini adalah kondisi pesanan Anda sebelum dikirimkan oleh Seller.
            </p>
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100">
              <Image
                src={order.fotoSebelumKirimUrl}
                alt="Foto produk sebelum dikirim"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </section>
        )}

        {/* Payment */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <CreditCard size={13} className="text-primary-600" />
              </div>
              <h2 className="font-semibold text-sm text-gray-800">
                Pembayaran
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Subtotal ({items.length || 0} produk)
                </span>
                <span className="text-gray-600 font-medium">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              {isGrosir && diskonNominal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 flex items-center gap-1">
                    <Tag size={10} />
                    Diskon Grosir ({diskonGrosirPersen}%)
                  </span>
                  <span className="text-primary-600 font-semibold">
                    - {formatRupiah(diskonNominal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Ongkos Kirim</span>
                <span className="text-gray-600 font-medium">
                  {formatRupiah(Number(order.ongkir || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-gray-100">
                <span className="text-gray-400">Metode</span>
                <span className="text-gray-600 font-semibold">
                  {formatMetodeBayar(order.metodeBayar)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="font-semibold text-base text-primary-700">
              {formatRupiah(Number(order.totalHarga || 0))}
            </span>
          </div>
        </section>
      </div>

      {/* Bottom Bar */}
      {(statusKey === "MENUNGGU_BAYAR" ||
        statusKey === "DIKIRIM" ||
        statusKey === "ARRIVED" ||
        statusKey === "SELESAI") && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-30">
          <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2.5">
            {statusKey === "MENUNGGU_BAYAR" ? (
              <button
                onClick={() => {
                  router.push(`/pembayaran?orderId=${order.id_pesanan}`);
                }}
                className="flex-1 py-3 bg-primary-600 text-white rounded-2xl font-semibold text-[13px] shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Wallet size={15} /> Bayar Sekarang
              </button>
            ) : (statusKey === "DIKIRIM" || statusKey === "ARRIVED") &&
              order.status !== "SELESAI" ? (
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={confirming}
                className={`flex-1 py-3 rounded-2xl font-semibold text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 ${
                  (order as any).pengiriman?.status === "ARRIVED"
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {confirming ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}
                Konfirmasi Diterima
              </button>
            ) : statusKey === "SELESAI" ? (
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() =>
                    router.push(`/pesanan/${order.id_pesanan}/rating`)
                  }
                  className="flex-1 py-3 border border-amber-300 text-amber-600 rounded-2xl font-semibold text-[13px] hover:bg-amber-50 transition-all flex items-center justify-center gap-1.5 active:scale-[0.97]"
                >
                  <Star size={14} className="fill-amber-400" /> Ulasan
                </button>
                <button
                  onClick={() => router.push("/katalog")}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-2xl font-semibold text-[13px] shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <ShoppingBag size={14} /> Beli Lagi
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {isConfirmModalOpen &&
        (() => {
          const isStillInTransit =
            (order as any).pengiriman?.status !== "ARRIVED";

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsConfirmModalOpen(false)}
              />
              <div className="relative bg-white rounded-3xl w-full max-w-[320px] p-6 flex flex-col items-center text-center shadow-2xl scale-100 transition-transform">
                <div className="w-36 h-36 mb-2 relative">
                  <Image
                    src="/images/barang-diterima.svg"
                    alt="Konfirmasi"
                    fill
                    className="object-contain"
                  />
                </div>

                {isStillInTransit && (
                  <div className="mb-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1.5">
                    <Truck size={12} className="text-amber-600" />
                    <span>Status: Masih Dalam Pengiriman</span>
                  </div>
                )}

                <h3 className="font-semibold text-base text-gray-900 mb-1.5">
                  {isStillInTransit
                    ? "Konfirmasi Barang Diterima?"
                    : "Pesanan Sudah Tiba?"}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6 px-1">
                  {isStillInTransit
                    ? "Status kurir menunjukkan paket masih dalam pengiriman. Pastikan Anda sudah benar-benar menerima fisik paket sebelum mengonfirmasi."
                    : "Pastikan pesanan sudah diterima dengan baik agar dana diteruskan ke penjual."}
                </p>
                <div className="w-full flex gap-2.5">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-xs hover:bg-gray-200 transition-colors"
                  >
                    Belum Terima
                  </button>
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      handleConfirm();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-xs hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20"
                  >
                    Ya, Diterima
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default function OrderDetailPage() {
  return (
    <React.Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent />
    </React.Suspense>
  );
}
