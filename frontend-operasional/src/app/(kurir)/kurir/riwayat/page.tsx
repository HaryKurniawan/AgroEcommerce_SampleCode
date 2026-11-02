"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  MessageCircle,
  Search,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";

import { formatRupiah, formatTanggal, ordersApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";

interface OrderItem {
  id: string;
  status: string;
  totalHarga: number;
  createdAt: string;
  customer?: { name?: string };
  alamatKirim?: string;
  shipping?: {
    status: string;
  };
}

export default function KurirRiwayatPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getCourierTasks({ limit: 200 });
      let allOrders = res?.data?.data?.data || res?.data?.data || [];
      allOrders = Array.isArray(allOrders) ? allOrders : [];
      setOrders(allOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (_hasHydrated && user) {
      fetchHistory();
    }
  }, [user, _hasHydrated, fetchHistory]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch =
          o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter
          ? new Date(o.createdAt).toISOString().split("T")[0] === dateFilter
          : true;
        return matchesSearch && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, searchTerm, dateFilter]);

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.shipping?.status === "ARRIVED");
    return {
      total: delivered.length,
      thisMonth: delivered.filter((o) => {
        const orderMonth = new Date(o.createdAt).getMonth();
        const currentMonth = new Date().getMonth();
        return orderMonth === currentMonth;
      }).length,
    };
  }, [orders]);

  if (!_hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Clean Minimalist Header (Sticky) ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <History size={18} className="text-gray-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">
                  RIWAYAT PENGIRIMAN
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/kurir/chat")}
              className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors relative"
            >
              <MessageCircle size={16} strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center text-white">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Clean Stats Grid */}
        <div className="px-6 py-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total Terkirim",
                val: stats.total,
                icon: CheckCheck,
                bg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                textColor: "text-emerald-700",
              },
              {
                label: "Bulan Ini",
                val: stats.thisMonth,
                icon: Calendar,
                bg: "bg-gray-50",
                iconColor: "text-gray-600",
                textColor: "text-gray-900",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`${s.bg} rounded-lg p-3 border border-gray-200`}
                >
                  <Icon
                    size={14}
                    className={`${s.iconColor} mb-2`}
                    strokeWidth={2}
                  />
                  <p className={`text-lg font-bold mb-0.5 ${s.textColor}`}>
                    {s.val}
                  </p>
                  <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content (Scrollable) ── */}
      <div className="px-5 pt-5 pb-28">
        {/* Search Bar */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 bg-white rounded-lg px-3 py-2.5 flex items-center gap-2 border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              className="bg-transparent border-0 text-xs focus:ring-0 w-full outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <div
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${dateFilter ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"}`}
            >
              <Calendar size={16} strokeWidth={2} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2
              className="w-10 h-10 animate-spin text-emerald-600 mb-4"
              strokeWidth={2}
            />
            <p className="text-sm text-gray-500 font-medium">
              Memuat riwayat pengiriman...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Package
              size={48}
              className="text-gray-300 mx-auto mb-4"
              strokeWidth={1.5}
            />
            <h3 className="font-bold text-gray-800 text-base mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-sm text-gray-500 max-w-[240px] mx-auto">
              Pesanan yang berhasil diantar akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <HistoryCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ order }: { order: OrderItem }) {
  const isDelivered = order.shipping?.status === "ARRIVED";
  const resiId = `AGJ${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-emerald-200 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {order.customer?.name || "Pelanggan"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">
            Resi: {resiId}
          </p>
        </div>
        <div
          className={`text-[10px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap flex-shrink-0 ${isDelivered ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
        >
          {isDelivered ? "Terkirim" : "Proses"}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-2 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          <span>{formatTanggal(order.createdAt)}</span>
        </div>
        <span className="font-semibold text-emerald-600">
          {formatRupiah(order.totalHarga)}
        </span>
      </div>
    </div>
  );
}
