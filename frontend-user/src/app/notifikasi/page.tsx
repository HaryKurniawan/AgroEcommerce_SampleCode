"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  PackageCheck,
  AlertTriangle,
  Truck,
  Megaphone,
  Info,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Image from "next/image";

import EmptyState from "@/src/components/ecommerce/EmptyState";
import type { ApiNotifCategory } from "@/types/api/dto";
import { notificationsApi } from "@/lib/api/notifications";
import { useNotifStore } from "@/store/notifikasi-store";
import { useAuthStore } from "@/src/store/auth-store";

export default function NotifikasiPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ApiNotifCategory>("Semua");

  const {
    notifications,
    setNotifications,
    markAllAsRead,
    markAsRead,
    removeNotification,
  } = useNotifStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications", "all"],
      queryFn: ({ pageParam = 1 }) =>
        notificationsApi.getAll({ limit: 15, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const pageData =
          lastPage?.data?.data?.data || lastPage?.data?.data || [];
        const arr = Array.isArray(pageData) ? pageData : [];
        if (arr.length === 15) return allPages.length + 1;
        return undefined;
      },
    });

  useEffect(() => {
    if (data?.pages) {
      const allNotifs = data.pages.flatMap((page) => {
        const pData = page.data?.data?.data || page.data?.data || [];
        return Array.isArray(pData) ? pData : [];
      });
      const unreadCount =
        data.pages[0]?.data?.data?.unreadCount ||
        data.pages[0]?.data?.unreadCount ||
        0;
      setNotifications(allNotifs, unreadCount);
    }
  }, [data, setNotifications]);

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Transaksi")
      return ["PESANAN", "PESANAN_BARU", "PEMBAYARAN"].includes(n.tipe);
    if (activeTab === "Tugas") return ["TUGAS_BARU", "TUGAS"].includes(n.tipe);
    if (activeTab === "Info")
      return ["BROADCAST", "SISTEM", "PROMO"].includes(n.tipe);
    return true;
  });

  const handleMarkAllRead = async () => {
    markAllAsRead();
    try {
      await notificationsApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications", "all"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    markAsRead(id);
    try {
      await notificationsApi.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications", "all"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
    // You could also hit an API to delete it permanently if available
  };

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case "PESANAN":
        return <ShoppingCart size={22} />;
      case "PESANAN_BARU":
        return <PackageCheck size={22} />;
      case "TUGAS_BARU":
        return <Truck size={22} />;
      case "ESKALASI":
        return <AlertTriangle size={22} />;
      case "BROADCAST":
        return <Megaphone size={22} />;
      default:
        return <Info size={22} />;
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
        return "bg-primary-100 text-primary-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <h1 className="font-display font-semibold text-base text-gray-900">
            Notifikasi
          </h1>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-primary-600 px-3 py-1.5 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto scroll-hide">
        <div className="flex items-center gap-6 px-4 max-w-2xl mx-auto w-full">
          {(["Semua", "Transaksi", "Info"] as ApiNotifCategory[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-sm font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab ? "text-primary-600" : "text-gray-400"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-3 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
              className={`bg-white rounded-2xl p-4 shadow-sm border flex gap-4 transition-all hover:shadow-md cursor-pointer ${
                !notif.isRead
                  ? "border-primary-200 bg-primary-50/10"
                  : "border-gray-100"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(notif.tipe)}`}
              >
                {getIcon(notif.tipe)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`text-sm truncate pr-4 ${!notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-600"}`}
                  >
                    {notif.judul}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: localeId,
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  {notif.pesan}
                </p>
                <div className="flex items-center justify-between">
                  {!notif.isRead ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary-600">
                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" />{" "}
                      Baru
                    </span>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="p-1.5 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            illustration="/images/notifikasi-sudah-dibaca.svg"
            title="Semua sudah dibaca!"
            description="Kamu sudah up-to-date. Notifikasi tentang pesanan dan info penting akan muncul di sini."
          />
        )}

        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3.5 rounded-xl border border-primary-200 text-primary-600 font-medium text-sm hover:bg-primary-50 active:bg-primary-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isFetchingNextPage
                ? "Memuat..."
                : "Muat Lebih Banyak Notifikasi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
