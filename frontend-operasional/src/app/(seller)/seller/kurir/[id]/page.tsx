"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  ChevronRight,
  Inbox,
  User,
  Package,
  CheckCheck,
  Truck,
  Activity,
} from "lucide-react";

import {
  formatRupiah,
  formatTanggal,
  storesApi,
  ordersApi,
  chatApi,
} from "@/lib/ecommerce-api";

interface CourierData {
  id?: string;
  id_pengguna?: string;
  name?: string | null;
  nama?: string | null;
  email: string;
  noTelepon?: string | null;
  phoneNumber?: string | null;
}

interface OrderItem {
  id?: string;
  id_pesanan?: string;
  status: string;
  totalHarga: number;
  metodeBayar: string;
  createdAt: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  konsumen?: { nama?: string; email?: string };
  alamatKirim?: string;
  items?: Array<{
    product?: { nama: string; namaEtalase?: string; gambarUrl?: string };
    produk?: { nama: string; namaEtalase?: string; gambarUrl?: string };
    jumlah: number;
    harga: number;
  }>;
  item?: Array<{
    product?: { nama: string; namaEtalase?: string; gambarUrl?: string };
    produk?: { nama: string; namaEtalase?: string; gambarUrl?: string };
    jumlah: number;
    harga: number;
  }>;
  shipping?: {
    id?: string;
    status: string;
    kurirPenggunaId?: string | null;
    catatan?: string;
    updatedAt?: string;
  };
  pengiriman?: {
    id_pengiriman?: string;
    status: string;
    kurirPenggunaId?: string | null;
  };
}

const ACTIVE_SHIPPING_STATUSES = [
  "PREPARING",
  "PICKUP_CONFIRMATION",
  "PICKED_UP",
  "IN_TRANSIT",
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  ARRIVED: {
    label: "Terkirim",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  IN_TRANSIT: {
    label: "Dalam Perjalanan",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  PICKED_UP: {
    label: "Diambil Kurir",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  PICKUP_CONFIRMATION: {
    label: "Konfirmasi",
    color: "text-violet-600 bg-violet-50 border-violet-200",
    dot: "bg-violet-400",
  },
  PREPARING: {
    label: "Dipersiapkan",
    color: "text-slate-600 bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function CourierActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courierId = params.id as string;

  const [courier, setCourier] = useState<CourierData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "done">("all");
  const [dateFilter, setDateFilter] = useState<
    "today" | "week" | "month" | "year" | "all"
  >("all");
  const [redirecting, setRedirecting] = useState(false);

  const courierName = courier?.name || courier?.nama || "Kurir Agrojabar";
  const courierInitial = courierName.charAt(0).toUpperCase();

  const handleHubungiKurir = async () => {
    if (!courier) return;
    try {
      setRedirecting(true);
      const res = await chatApi.createConversation({
        type: "ADMIN_CS",
        targetUserId: (courier.id_pengguna || courier.id)!,
      });
      const data = res?.data?.data || res?.data;
      if (data?.id) {
        router.push(`/seller/chat/${data.id}`);
      } else {
        alert("Gagal memulai obrolan dengan kurir.");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Gagal memulai obrolan dengan kurir.");
    } finally {
      setRedirecting(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!courierId) return;
    try {
      setLoading(true);
      setError("");

      const storeRes = await storesApi.getMyStore();
      const storeData = storeRes?.data?.data || storeRes?.data;
      if (!storeData) throw new Error("Toko tidak ditemukan");

      const staffList: CourierData[] = storeData.kurirStaffs || [];
      let foundCourier = staffList.find(
        (c: any) => (c.id_pengguna || c.id) === courierId,
      );

      if (
        !foundCourier &&
        storeData.courierStaff &&
        (storeData.courierStaff.id_pengguna || storeData.courierStaff.id) ===
          courierId
      ) {
        foundCourier = storeData.courierStaff;
      }

      if (!foundCourier) {
        throw new Error(
          "Kurir tidak terdaftar atau tidak terafiliasi dengan toko Anda",
        );
      }
      setCourier(foundCourier);

      const ordersRes = await ordersApi.sellerGetOrders(storeData.id, {
        limit: 100,
      });
      const ordersList: OrderItem[] =
        ordersRes?.data?.data?.data ||
        ordersRes?.data?.data ||
        ordersRes?.data ||
        [];

      const courierOrders = ordersList.filter(
        (order) =>
          (order.shipping?.kurirPenggunaId ||
            order.pengiriman?.kurirPenggunaId) === courierId,
      );
      setOrders(courierOrders);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data aktivitas kurir",
      );
    } finally {
      setLoading(false);
    }
  }, [courierId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper: filter orders by date range
  const filterByDate = useCallback(
    (list: OrderItem[]) => {
      if (dateFilter === "all") return list;
      const now = new Date();
      return list.filter((o) => {
        const d = new Date(o.createdAt);
        if (dateFilter === "today") {
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
          );
        }
        if (dateFilter === "week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return d >= startOfWeek;
        }
        if (dateFilter === "month") {
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth()
          );
        }
        if (dateFilter === "year") {
          return d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    },
    [dateFilter],
  );

  const stats = useMemo(() => {
    const filtered = filterByDate(orders);
    const total = filtered.length;
    const active = filtered.filter((o) =>
      ACTIVE_SHIPPING_STATUSES.includes(
        (o.shipping || o.pengiriman)?.status || "",
      ),
    ).length;
    const done = filtered.filter(
      (o) => (o.shipping || o.pengiriman)?.status === "ARRIVED",
    ).length;
    return { total, active, done };
  }, [orders, filterByDate]);

  const displayedOrders = useMemo(() => {
    const dateFiltered = filterByDate(orders);
    switch (activeTab) {
      case "active":
        return dateFiltered.filter((o) =>
          ACTIVE_SHIPPING_STATUSES.includes(
            (o.shipping || o.pengiriman)?.status || "",
          ),
        );
      case "done":
        return dateFiltered.filter(
          (o) => (o.shipping || o.pengiriman)?.status === "ARRIVED",
        );
      default:
        return dateFiltered;
    }
  }, [orders, activeTab, filterByDate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-3">
        <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-400">Memuat aktivitas kurir...</p>
      </div>
    );
  }

  if (error || !courier) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-slate-800">
              Gagal Memuat Halaman
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || "Data kurir tidak ditemukan."}
            </p>
            <button
              onClick={() => router.push("/seller/kurir")}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/seller/kurir")}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Daftar Kurir
      </button>

      {/* ── Courier Profile Banner ─────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 select-none">
            {courierInitial}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-base font-semibold text-slate-800">
                {courierName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {courier.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {courier.noTelepon ||
                  courier.phoneNumber ||
                  "Nomor tidak tersedia"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: hubungi button */}
        <button
          onClick={handleHubungiKurir}
          disabled={redirecting}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          {redirecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
          Hubungi Kurir
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Pengantaran",
            val: stats.total,
            icon: <Package className="w-4 h-4" />,
            accent: "text-slate-700",
            bg: "bg-white border-gray-100",
            iconBg: "bg-gray-50 text-slate-400",
          },
          {
            label: "Sedang Dikirim",
            val: stats.active,
            icon: <Truck className="w-4 h-4" />,
            accent: "text-amber-600",
            bg: "bg-amber-50/60 border-amber-100",
            iconBg: "bg-amber-100/60 text-amber-500",
          },
          {
            label: "Terkirim",
            val: stats.done,
            icon: <CheckCheck className="w-4 h-4" />,
            accent: "text-emerald-600",
            bg: "bg-emerald-50/60 border-emerald-100",
            iconBg: "bg-emerald-100/60 text-emerald-500",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`border rounded-2xl p-4 flex items-center gap-3 ${s.bg}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}
            >
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${s.accent}`}>
                {s.val}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delivery Activities ───────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Section header */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-800">
                Aktivitas Pengiriman
              </h2>
              <span className="text-[10px] font-medium text-slate-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                {displayedOrders.length} pesanan
              </span>
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1 rounded-xl shrink-0">
              {(["all", "active", "done"] as const).map((tab) => {
                const labels = {
                  all: "Semua",
                  active: "Aktif",
                  done: "Selesai",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: "today", label: "Hari Ini" },
                { id: "week", label: "Minggu Ini" },
                { id: "month", label: "Bulan Ini" },
                { id: "year", label: "Tahun Ini" },
                { id: "all", label: "Semua" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  dateFilter === f.id
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order list */}
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-slate-300">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Tidak Ada Aktivitas
            </p>
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Belum ada pesanan yang sesuai dengan filter ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayedOrders.map((order) => {
              const shippingStatus =
                (order.shipping || order.pengiriman)?.status || "UNKNOWN";
              const statusCfg = STATUS_CONFIG[shippingStatus] || {
                label: shippingStatus,
                color: "text-slate-500 bg-gray-50 border-gray-200",
                dot: "bg-gray-400",
              };
              const orderId = order.id_pesanan || order.id || "";
              const allItems = order.items || order.item || [];

              return (
                <div
                  key={orderId || Math.random()}
                  className="px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Row top: resi + status */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                          No. Resi
                        </p>
                        <p className="font-mono text-xs font-semibold text-slate-700 tracking-wide">
                          AGJ-{orderId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${shippingStatus !== "ARRIVED" ? "animate-pulse" : ""}`}
                      />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Row: penerima + alamat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="font-medium">
                        {order.konsumen?.nama ||
                          order.customer?.name ||
                          "Pelanggan"}
                      </span>
                    </div>
                    {order.alamatKirim && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                        <span className="truncate">{order.alamatKirim}</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {allItems.length > 0 && (
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2 mb-3 space-y-1">
                      {allItems.slice(0, 2).map((item, idx) => {
                        const productData = item.product || item.produk;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-500 truncate mr-3">
                              {productData?.nama?.replace(" - ", " ") ||
                                "Produk"}{" "}
                              <span className="text-slate-400">
                                ×{item.jumlah}
                              </span>
                            </span>
                            <span className="font-semibold text-slate-700 shrink-0">
                              {formatRupiah(item.harga * item.jumlah)}
                            </span>
                          </div>
                        );
                      })}
                      {allItems.length > 2 && (
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          +{allItems.length - 2} item lainnya
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatTanggal(order.createdAt)}
                    </span>
                    <button
                      onClick={() => router.push(`/seller/pesanan/${orderId}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Lihat Detail
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
