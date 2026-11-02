"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Building2,
  MessageCircle,
  ChevronRight,
  LogOut,
  Store,
  Loader2,
  User,
  Mail,
  TrendingUp,
  CheckCircle2,
  Bell,
} from "lucide-react";

import { ordersApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { useProfile } from "@/hooks/profil/useProfile";
import { useNotifStore } from "@/store/notifikasi-store";

interface OrderItem {
  id: string;
  status: string;
  createdAt: string;
  tokoNama?: string;
  shipping?: {
    status: string;
    updatedAt?: string;
  };
  updatedAt?: string;
}

export default function KurirProfilPage() {
  const router = useRouter();
  const { user, _hasHydrated, clearAuth } = useAuthStore();
  const { profile } = useProfile(!!user, _hasHydrated);
  const { unreadCount } = useNotifStore();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getCourierTasks({ limit: 100 });
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
    if (_hasHydrated && user && user.role === "KURIR") {
      fetchOrders();
    }
  }, [user, _hasHydrated, fetchOrders]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  const today = new Date().toDateString();
  const todayDelivered = orders.filter((o) => {
    const isCompletedStatus =
      o.shipping?.status === "ARRIVED" ||
      o.status === "SELESAI" ||
      o.status === "DITUTUP";
    const completedDate = new Date(
      o.shipping?.updatedAt || o.updatedAt || o.createdAt,
    );
    return isCompletedStatus && completedDate.toDateString() === today;
  }).length;

  const totalLifetime = orders.filter(
    (o) =>
      o.shipping?.status === "ARRIVED" ||
      o.status === "SELESAI" ||
      o.status === "DITUTUP",
  ).length;

  const mitraSellerName =
    profile?.kurirToko?.nama ||
    (user as any)?.kurirToko?.nama ||
    (user as any)?.toko?.nama ||
    orders.find((o) => o.tokoNama)?.tokoNama ||
    "Belum Terafiliasi Seller";

  const menuLogistik = [
    {
      label: "Detail Tugas",
      icon: Package,
      desc: "Lihat riwayat pengiriman Anda",
      path: "#",
    },
    {
      label: "Unit Kerja",
      icon: Building2,
      desc: "Informasi penugasan gudang",
      path: "#",
    },
    {
      label: "Pusat Bantuan",
      icon: MessageCircle,
      desc: "Hubungi admin operasional",
      path: "#",
    },
  ];

  if (!_hasHydrated || !user) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">Profil</h1>
          <button
            onClick={() => router.push("/kurir/notifikasi")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={18} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center text-white shadow-sm leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 pt-5 max-w-2xl mx-auto">
        <div className="bg-primary-600 rounded-2xl p-5 mb-4 shadow-md shadow-primary-600/20 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 shadow-sm backdrop-blur-sm">
              <User size={28} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white truncate">
                {user.name}
              </h3>
              <p className="text-sm text-primary-100 truncate flex items-center gap-1.5 mt-0.5">
                <Mail size={12} strokeWidth={2} />
                {user.email}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/20">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/30 backdrop-blur-sm">
              <CheckCircle2 size={13} strokeWidth={2.5} />
              KURIR INTERNAL
            </span>
          </div>
        </div>

        {/* Mitra Seller Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
              <Store size={20} className="text-emerald-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Mitra Seller
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {mitraSellerName}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                <TrendingUp
                  size={14}
                  className="text-gray-600"
                  strokeWidth={2}
                />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                Hari Ini
              </p>
            </div>
            {loading ? (
              <div className="h-8 flex items-center">
                <Loader2
                  size={18}
                  className="animate-spin text-gray-300"
                  strokeWidth={2}
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {todayDelivered}
              </p>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg border border-primary-200 bg-primary-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-primary-200">
                <CheckCircle2
                  size={14}
                  className="text-primary-600"
                  strokeWidth={2}
                />
              </div>
              <p className="text-[10px] font-semibold text-primary-700 uppercase tracking-wide">
                Total
              </p>
            </div>
            {loading ? (
              <div className="h-8 flex items-center">
                <Loader2
                  size={18}
                  className="animate-spin text-primary-300"
                  strokeWidth={2}
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary-700">
                {totalLifetime}
              </p>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
          {menuLogistik.map((menu, i) => (
            <button
              key={menu.label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i !== menuLogistik.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                <menu.icon
                  size={18}
                  className="text-gray-600"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 text-sm">
                  {menu.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{menu.desc}</p>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400"
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-200 group-hover:bg-red-100 transition-colors">
              <LogOut size={18} className="text-red-600" strokeWidth={2} />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-red-600 text-sm transition-colors">
              Keluar Sesi
            </span>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-red-400 transition-colors"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
