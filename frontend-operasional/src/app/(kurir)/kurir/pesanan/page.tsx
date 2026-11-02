"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Truck,
  MapPin,
  Loader2,
  AlertCircle,
  Box,
  CheckCircle2,
  MessageCircle,
  Package,
  ArrowRight,
  Phone,
  ClipboardCheck,
  Navigation2,
  Clock,
  TrendingUp,
  CheckCheck,
  PackageCheck,
  Bell,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { formatRupiah, ordersApi, deliveryBatchApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { useNotifStore } from "@/store/notifikasi-store";

function MobileSegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: React.ReactNode }[];
  value: string;
  onChange: (val: string) => void;
}) {
  const activeIndex = options.findIndex((opt) => opt.value === value) || 0;
  const pillWidth = 100 / options.length;
  const pillLeft = activeIndex * pillWidth;

  return (
    <div className="relative flex p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto w-full hide-scrollbar">
      {/* Animated Pill */}
      <div
        className="absolute top-1 bottom-1 bg-primary-600 rounded-lg transition-all duration-300 ease-out"
        style={{
          width: `calc(${pillWidth}% - 4px)`, // -4px accounts for the 2px padding on each side (p-1 is 4px total)
          left: `calc(${pillLeft}% + 2px)`, // +2px for the p-1 offset
        }}
      />

      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
              isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CustomSortDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative h-[42px] group shrink-0" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[42px] h-[42px] flex items-center justify-center bg-white border shadow-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer ${
          isOpen
            ? "border-primary-500 ring-4 ring-primary-500/10"
            : "border-slate-200 hover:border-primary-300"
        }`}
        title={selectedOption?.label}
      >
        <ArrowUpDown
          size={16}
          className={`transition-colors ${
            isOpen
              ? "text-primary-600"
              : "text-slate-500 group-hover:text-primary-600"
          }`}
          strokeWidth={2.5}
        />
      </button>

      <div
        className={`absolute z-50 mt-1.5 w-40 right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-between ${
                value === opt.value
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {opt.label}
              {value === opt.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Types ─── */
interface TrackingItem {
  status: string;
  label?: string;
  timestamp?: string;
  note?: string;
}

interface OrderItem {
  id: string;
  status: string;
  totalHarga: number;
  metodeBayar: string;
  createdAt: string;
  updatedAt?: string;
  tokoNama?: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  alamatKirim?: string;
  items?: Array<{
    product?: { nama: string; gambarUrl?: string };
    jumlah: number;
    harga: number;
  }>;
  shipping?: {
    id?: string;
    status: string;
    kurirName?: string;
    kurirPhone?: string;
    catatan?: string;
    trackingHistory?: TrackingItem[];
    updatedAt?: string;
  };
}

/* ─── Constants ─── */
const STEPS = [
  { key: "PREPARING", label: "Disiapkan", icon: "📦" },
  { key: "PICKUP_CONFIRMATION", label: "Siap Diambil", icon: "🤝" },
  { key: "PICKED_UP", label: "Diambil Kurir", icon: "✅" },
  { key: "IN_TRANSIT", label: "Dikirim", icon: "🚚" },
  { key: "ARRIVED", label: "Terkirim", icon: "📍" },
  { key: "SELESAI", label: "Selesai (Dikonfirmasi)", icon: "✔️" },
] as const;

const ACTIVE_STATUSES = [
  "PREPARING",
  "PICKUP_CONFIRMATION",
  "PICKED_UP",
  "IN_TRANSIT",
];

function getStepIdx(status: string) {
  return STEPS.findIndex((s) => s.key === status);
}

function getActionConfig(status: string) {
  switch (status) {
    case "PICKUP_CONFIRMATION":
      return { label: "Konfirmasi Ambil Paket", icon: ClipboardCheck };
    case "PICKED_UP":
      return { label: "Mulai Pengiriman", icon: Navigation2 };
    case "IN_TRANSIT":
      return { label: "Tandai Sudah Tiba", icon: MapPin };
    default:
      return null;
  }
}

function toResiId(orderId: string) {
  return `AGJ${orderId.slice(0, 8).toUpperCase()}`;
}

/* ─── Main Page ─── */
export default function KurirTasksPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "done">("active");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);

  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [resOrders, resBatches] = await Promise.all([
        ordersApi.getCourierTasks({ limit: 100 }),
        deliveryBatchApi.getCourierBatches(),
      ]);

      let all =
        resOrders?.data?.data?.data?.data ||
        resOrders?.data?.data?.data ||
        resOrders?.data?.data ||
        [];
      all = Array.isArray(all) ? all : [];
      all.sort(
        (a: OrderItem, b: OrderItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(all);

      const b = resBatches?.data?.data || [];
      setBatches(Array.isArray(b) ? b : []);

      setErrorText("");
    } catch {
      setErrorText("Gagal memuat daftar pesanan atau batch.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !user || user.role !== "KURIR") return;
    fetchOrders(true);
    const es = new EventSource("/api/proxy/ecom/pesanan-events/stream", {
      withCredentials: true,
    });
    es.onmessage = (ev) => {
      try {
        const p = JSON.parse(ev.data);
        if (p?.type === "heartbeat") return;
        fetchOrders(false);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [user, _hasHydrated, fetchOrders]);

  const handleAction = async (id: string) => {
    setActionLoading(id);
    try {
      await ordersApi.advanceShippingStatus(id, {
        note: `Di-update oleh Kurir ${user?.name || ""}`,
      });
      await fetchOrders(false);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal update status");
    } finally {
      setActionLoading(null);
    }
  };

  const today = useMemo(() => new Date().toDateString(), []);
  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.shipping?.status || ""),
  );
  const doneOrders = orders.filter((o) => {
    const isCompletedStatus =
      o.shipping?.status === "ARRIVED" ||
      o.status === "SELESAI" ||
      o.status === "DITUTUP";
    const completedDate = new Date(
      o.shipping?.updatedAt || o.updatedAt || o.createdAt,
    );
    return isCompletedStatus && completedDate.toDateString() === today;
  });
  const displayed = (activeTab === "active" ? activeOrders : doneOrders).sort(
    (a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    },
  );

  const stats = {
    pending: orders.filter((o) =>
      ["PREPARING", "PICKUP_CONFIRMATION"].includes(o.shipping?.status || ""),
    ).length,
    ongoing: orders.filter((o) =>
      ["PICKED_UP", "IN_TRANSIT"].includes(o.shipping?.status || ""),
    ).length,
    done: doneOrders.length,
  };

  if (!_hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Clean Minimalist Header (Sticky) ── */}
      <div className="sticky top-0 z-20 bg-primary-700 text-white shadow-sm rounded-b-2xl">
        {/* Top Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/50 rounded-xl flex items-center justify-center border border-primary-400/30">
                <Truck size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-50 tracking-wider">
                  KURIR INTERNAL
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/kurir/notifikasi")}
              className="w-10 h-10 bg-primary-500/50 border border-primary-400/30 rounded-xl flex items-center justify-center text-white hover:bg-primary-500/70 transition-colors relative"
            >
              <Bell size={18} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-primary-600 text-[9px] font-bold flex items-center justify-center text-white shadow-sm leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Clean Stats Grid */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Menunggu", val: stats.pending },
              { label: "Dikirim", val: stats.ongoing },
              { label: "Selesai", val: stats.done },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-primary-500/30 rounded-xl p-3 flex flex-col justify-center items-center border border-white/25 shadow-sm"
              >
                <p className="text-2xl font-bold text-white mb-0.5">{s.val}</p>
                <p className="text-xs font-medium text-primary-50 tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content (Scrollable) ── */}
      <div className="px-5 pt-5 pb-28">
        <div className="flex flex-row items-center justify-between gap-3 mb-5">
          <MobileSegmentedControl
            value={activeTab}
            onChange={(val) => setActiveTab(val as "active" | "done")}
            options={[
              {
                value: "active",
                label: (
                  <div className="flex items-center gap-2">
                    <PackageCheck size={14} />
                    <span>Tugas Aktif</span>
                    {activeOrders.length > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                          activeTab === "active"
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {activeOrders.length}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                value: "done",
                label: (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Selesai Hari Ini</span>
                    {doneOrders.length > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                          activeTab === "done"
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {doneOrders.length}
                      </span>
                    )}
                  </div>
                ),
              },
            ]}
          />

          <CustomSortDropdown
            value={sortOrder}
            onChange={(val) => setSortOrder(val as "desc" | "asc")}
            options={[
              { value: "desc", label: "Urutkan: Terbaru" },
              { value: "asc", label: "Urutkan: Terlama" },
            ]}
          />
        </div>

        {errorText && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-3 mb-4 border border-red-200">
            <AlertCircle
              size={18}
              className="flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-sm font-medium">{errorText}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2
              className="w-10 h-10 animate-spin text-primary-600 mb-4"
              strokeWidth={2}
            />
            <p className="text-sm text-gray-500 font-medium">
              Memuat tugas pengiriman...
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Box
              size={48}
              className="text-gray-300 mx-auto mb-4"
              strokeWidth={1.5}
            />
            <h3 className="font-bold text-gray-800 text-base mb-2">
              {activeTab === "active"
                ? "Tidak Ada Tugas Aktif"
                : "Belum Ada Selesai Hari Ini"}
            </h3>
            <p className="text-sm text-gray-500 max-w-[240px] mx-auto">
              {activeTab === "active"
                ? "Pesanan baru akan muncul setelah seller memproses paket."
                : "Pesanan yang berhasil diantar hari ini akan tampil di sini."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "active" &&
              batches.length > 0 &&
              batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onAction={async () => {
                    await fetchOrders(false);
                  }}
                />
              ))}

            {activeTab === "active" &&
              batches.length > 0 &&
              displayed.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Atau Kirim Individual
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              )}

            <div className="space-y-3">
              {displayed.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actionLoading={actionLoading}
                  onAction={handleAction}
                  isCompleted={activeTab === "done"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Order Card ─── */
function OrderCard({
  order,
  actionLoading,
  onAction,
  isCompleted,
}: {
  order: OrderItem;
  actionLoading: string | null;
  onAction: (id: string) => void;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const status =
    order.status === "SELESAI" || order.status === "DITUTUP"
      ? "SELESAI"
      : order.shipping?.status || "UNKNOWN";
  const stepIdx = getStepIdx(status);
  const action = getActionConfig(status);
  const resiId = toResiId(order.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-200 transition-colors shadow-sm">
      {/* Card Header - Nama Penerima + Status (Clickable) */}
      <div
        role="button"
        onClick={() => router.push(`/kurir/pesanan/${order.id}`)}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {order.customer?.name || "Pelanggan"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">
            Resi: {resiId}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div
        role="button"
        onClick={() => router.push(`/kurir/pesanan/${order.id}`)}
        className="px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        {/* Items Summary */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-1">
            {order.items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-700 truncate mr-3 flex-1">
                  {item.product?.nama?.replace(" - ", " ")}
                </span>
                <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                  {formatRupiah(item.harga * item.jumlah)}
                </span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-[10px] text-gray-500 mt-1">
                +{order.items.length - 2} item lainnya
              </p>
            )}
            <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2 pt-2">
              <span className="text-xs font-semibold text-gray-700">Total</span>
              <span className="text-sm font-bold text-primary-600">
                {formatRupiah(order.totalHarga || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="px-4 pb-4 space-y-2 relative z-10">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/kurir/pesanan/${order.id}`);
            }}
            className="flex-1 py-2.5 rounded-lg font-semibold text-slate-700 text-sm flex items-center justify-center gap-2 transition-colors bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm"
          >
            Lihat Detail
          </button>

          {order.customer?.phoneNumber ? (
            <a
              href={`tel:${order.customer.phoneNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="w-[42px] shrink-0 rounded-lg flex items-center justify-center transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm"
              title="Hubungi"
            >
              <Phone size={16} strokeWidth={2.5} />
            </a>
          ) : (
            <div
              className="w-[42px] shrink-0 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed shadow-sm"
              title="Nomor Tidak Tersedia"
            >
              <Phone size={16} strokeWidth={2.5} />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/kurir/pesanan/${order.id}/peta`);
            }}
            className="w-[42px] shrink-0 rounded-lg flex items-center justify-center transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm"
            title="Buka Peta & Rute"
          >
            <MapPin size={16} strokeWidth={2.5} />
          </button>
        </div>

        {!isCompleted && status === "PREPARING" && (
          <div className="flex items-center justify-center gap-2 py-3 mt-2 bg-amber-50 rounded-lg text-amber-700 text-sm font-semibold border border-amber-200">
            <Clock size={14} strokeWidth={2} />
            Menunggu Seller Menyiapkan Paket
          </div>
        )}

        {(isCompleted || status === "ARRIVED" || status === "SELESAI") && (
          <div className="flex items-center justify-center gap-2 py-3 mt-2 bg-primary-50 rounded-lg text-primary-700 text-sm font-semibold border border-primary-200">
            <CheckCircle2 size={15} strokeWidth={2} />
            {status === "SELESAI" ? "Pesanan Selesai" : "Paket Telah Terkirim"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Batch Card ─── */
function BatchCard({ batch, onAction }: { batch: any; onAction: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPagi = batch.tipeBatch === "PAGI";

  const handleStart = async () => {
    try {
      setLoading(true);
      await deliveryBatchApi.startBatch(batch.id);
      onAction();
    } catch (err: any) {
      alert(err.message || "Gagal memulai batch");
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    MENUNGGU: { label: "Menunggu Kurir", color: "bg-amber-100 text-amber-800" },
    SIAP_KIRIM: { label: "Siap Dikirim", color: "bg-blue-100 text-blue-800" },
    DALAM_PERJALANAN: {
      label: "Dalam Perjalanan",
      color: "bg-primary-100 text-primary-800",
    },
    SELESAI: { label: "Selesai", color: "bg-gray-100 text-gray-800" },
  };

  const statusObj = statusMap[batch.status] || statusMap.MENUNGGU;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden ${isPagi ? "border-primary-500 shadow-primary-100" : "border-blue-500 shadow-blue-100"} shadow-sm bg-white relative`}
    >
      {/* Ribbon */}
      <div
        className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg
        ${isPagi ? "bg-primary-500" : "bg-blue-500"}`}
      >
        REKOMENDASI {batch.tipeBatch}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${isPagi ? "bg-primary-100 text-primary-600" : "bg-blue-100 text-blue-600"}`}
          >
            <Package size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">
              Batch Pengiriman
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {batch.kodeResi}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
              TOTAL PESANAN
            </span>
            <span className="font-bold text-gray-800">
              {batch.totalPesanan} Paket
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
              ESTIMASI JARAK
            </span>
            <span className="font-bold text-gray-800">
              {batch.estimasiJarakKm ? `${batch.estimasiJarakKm} km` : "-"}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
              BERAT TOTAL
            </span>
            <span className="font-bold text-gray-800">
              {batch.totalBeratKg} kg
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
              STATUS BATCH
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusObj.color}`}
            >
              {statusObj.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {batch.status === "DALAM_PERJALANAN" ? (
            <button
              onClick={() => router.push(`/kurir/batch/${batch.id}`)}
              className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors
                ${isPagi ? "bg-primary-600 hover:bg-primary-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Navigation2 size={18} strokeWidth={2.5} />
              Buka Peta Rute
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors
                ${isPagi ? "bg-primary-600 hover:bg-primary-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-70`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <>
                  <Truck size={18} strokeWidth={2.5} />
                  Mulai Pengiriman Batch
                </>
              )}
            </button>
          )}

          <button
            onClick={() => router.push(`/kurir/batch/${batch.id}`)}
            className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center transition-colors hover:bg-gray-200"
          >
            Lihat Daftar Pesanan ({batch.totalPesanan})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const step = STEPS.find((s) => s.key === status);
  const label = step?.label || status;

  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-md border border-primary-200 bg-white text-primary-600 shadow-sm">
      {label}
    </span>
  );
}
