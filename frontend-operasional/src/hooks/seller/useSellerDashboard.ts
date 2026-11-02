import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Package,
  ClipboardList,
  CalendarCheck,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";

import { storesApi, ordersApi, formatRupiah } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiOrderItem, ApiStoreData } from "@/types";

export const useSellerDashboard = () => {
  const storeQuery = useQuery({
    queryKey: queryKeys.stores.myStore(),
    queryFn: () => storesApi.getMyStore(),
    select: (res): ApiStoreData => res?.data?.data || res?.data,
    staleTime: 5 * 60 * 1000,
  });

  const store = storeQuery.data ?? null;

  const statsQuery = useQuery({
    queryKey: queryKeys.sellerDashboard.stats(store?.id ?? ""),
    queryFn: () => ordersApi.getDashboardStats(store?.id as string),
    select: (res) => res?.data?.data || res?.data,
    enabled: !!store?.id,
    staleTime: 2 * 60 * 1000,
  });

  const dashboardStats = statsQuery.data || {
    statusCounts: {},
    revenue: 0,
    recentOrders: [],
    latestOrders: [],
    totalOrders: 0,
  };

  const bookingsQuery = { isLoading: false, data: [] }; // Mock hook to avoid breaking existing usages until full removal

  const bookings: any[] = [];

  const stats = useMemo(() => {
    if (!store) return [];

    const pesananBaru =
      (dashboardStats.statusCounts["MENUNGGU_BAYAR"] || 0) +
      (dashboardStats.statusCounts["DIPROSES"] || 0);
    const bookingBaru = 0; // bookings not used anymore

    return [
      {
        label: "Total Produk",
        value: store.totalProduk || 0,
        icon: Package,
        color: "bg-emerald-100 text-emerald-600",
        path: "/seller/produk",
      },
      {
        label: "Pesanan Baru",
        value: pesananBaru,
        icon: ClipboardList,
        color: "bg-amber-100 text-amber-600",
        path: "/seller/pesanan",
      },
      {
        label: "Booking Masuk",
        value: bookingBaru,
        icon: CalendarCheck,
        color: "bg-purple-100 text-purple-600",
        path: "/seller/booking",
      },
      {
        label: "Rating Toko",
        value: store.rating || 0,
        icon: Star,
        color: "bg-yellow-100 text-yellow-600",
        path: "/seller/profil-toko",
      },
      {
        label: "Total Penjualan",
        value: store.totalPenjualan || 0,
        icon: TrendingUp,
        color: "bg-blue-100 text-blue-600",
        path: "/seller/pesanan",
      },
      {
        label: "Pendapatan",
        value: formatRupiah(dashboardStats.revenue || 0),
        icon: DollarSign,
        color: "bg-green-100 text-green-600",
        path: "/seller/pesanan",
      },
    ];
  }, [store, dashboardStats]);

  return {
    store,
    orders: dashboardStats.latestOrders, // Keep exporting orders for backwards compat, but it's latest now
    dashboardStats,
    bookings,
    loading:
      storeQuery.isLoading || statsQuery.isLoading || bookingsQuery.isLoading,
    stats,

    refetch: () => {
      storeQuery.refetch();
      statsQuery.refetch();
    },
  };
};
