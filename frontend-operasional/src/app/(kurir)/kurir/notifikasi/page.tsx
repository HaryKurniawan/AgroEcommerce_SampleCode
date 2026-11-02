"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ShoppingCart,
  Info,
  PackageCheck,
  AlertTriangle,
  Truck,
  Megaphone,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale/id";
import { useRouter } from "next/navigation";

import { notificationsApi } from "@/lib/api/notifications";
import { queryKeys } from "@/hooks/query-keys";
import { useNotifStore } from "@/store/notifikasi-store";
import { ApiNotification } from "@/types/api/dto";

export default function KurirNotifikasiPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setNotifications, markAllAsRead, markAsRead } = useNotifStore();
  const [activeTab, setActiveTab] = useState<
    "Semua" | "Transaksi" | "Info" | "Tugas"
  >("Semua");

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.notifications.all, activeTab],
    queryFn: () => notificationsApi.getAll({ limit: 50 }),
  });

  const getSafeNotifs = useCallback(() => {
    const d1 = data?.data?.data;
    const d2 = data?.data;
    if (Array.isArray(d1)) return d1;
    if (d1 && Array.isArray(d1.data)) return d1.data;
    if (d1 && Array.isArray(d1.notifications)) return d1.notifications;
    if (Array.isArray(d2)) return d2;
    if (d2 && Array.isArray(d2.data)) return d2.data;
    if (d2 && Array.isArray(d2.notifications)) return d2.notifications;
    return [];
  }, [data]);

  useEffect(() => {
    if (data?.data) {
      setNotifications(getSafeNotifs(), data.data.unreadCount || 0);
    }
  }, [data, setNotifications, getSafeNotifs]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    markAsRead(id);
    try {
      await notificationsApi.markAsRead(id);
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notifications.all],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();
    try {
      await notificationsApi.markAllAsRead();
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notifications.all],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case "PESANAN":
        return <ShoppingCart size={20} />;
      case "PESANAN_BARU":
        return <PackageCheck size={20} />;
      case "TUGAS_BARU":
        return <Truck size={20} />;
      case "ESKALASI":
        return <AlertTriangle size={20} />;
      case "BROADCAST":
        return <Megaphone size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColor = (tipe: string) => {
    switch (tipe) {
      case "PESANAN_BARU":
        return "bg-amber-100 text-amber-600";
      case "TUGAS_BARU":
        return "bg-indigo-100 text-indigo-600";
      case "BROADCAST":
        return "bg-orange-100 text-orange-600";
      case "ESKALASI":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const notifs: ApiNotification[] = getSafeNotifs();

  const filteredNotifs = notifs.filter((n: ApiNotification) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Transaksi")
      return ["PESANAN", "PESANAN_BARU", "PEMBAYARAN"].includes(n.tipe);
    if (activeTab === "Tugas") return ["TUGAS_BARU", "TUGAS"].includes(n.tipe);
    if (activeTab === "Info")
      return ["BROADCAST", "SISTEM", "PROMO"].includes(n.tipe);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bell className="text-emerald-600" size={20} />
              Notifikasi
            </h1>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
          >
            <CheckCircle2 size={16} />
            Tandai Dibaca
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3 overflow-x-auto no-scrollbar">
          {(["Semua", "Transaksi", "Tugas", "Info"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif: ApiNotification) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
              className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                !notif.isRead
                  ? "border-emerald-200 shadow-sm bg-emerald-50/10"
                  : "border-gray-100"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(notif.tipe)}`}
              >
                {getIcon(notif.tipe)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3
                    className={`text-sm truncate pr-4 ${!notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                  >
                    {notif.judul}
                  </h3>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: localeId,
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm ${!notif.isRead ? "text-gray-700" : "text-gray-500"}`}
                >
                  {notif.pesan}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0 shadow-sm" />
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Bell size={28} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">
              Belum ada notifikasi
            </h3>
            <p className="text-gray-500 text-sm">
              Notifikasi {activeTab.toLowerCase()} akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
