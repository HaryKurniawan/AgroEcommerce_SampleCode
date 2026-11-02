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
import { queryKeys } from "@/src/hooks/query-keys";
import type { ApiOrderItem, ApiStoreData } from "@/types";

export const useSellerDashboard = () => {
  const storeQuery = useQuery({
    queryKey: queryKeys.stores.myStore(),
    queryFn: () => storesApi.getMyStore(),
    select: (res): ApiStoreData => res?.data?.data || res?.data,
    staleTime: 5 * 60 * 1000,
  });

  const store = storeQuery.data ?? null;

  const ordersQuery = useQuery({
    queryKey: queryKeys.sellerDashboard.orders(store?.id_toko ?? ""),
    queryFn: () => ordersApi.sellerGetOrders(store?.id_toko as string),
    select: (res): ApiOrderItem[] => {
      const inner = res?.data?.data;
      if (inner && Array.isArray(inner.data)) return inner.data;
      if (Array.isArray(inner)) return inner;
      return [];
    },
    enabled: !!store?.id_toko,
    staleTime: 2 * 60 * 1000,
  });

  const orders = ordersQuery.data ?? [];

  const bookingsQuery = { isLoading: false, data: [] }; // Mock hook to avoid breaking existing usages until full removal

  const bookings: any[] = [];

  const stats = useMemo(() => {
    if (!store) return [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    const pesananBaru = safeOrders.filter(
      (p) => p.status === "MENUNGGU_BAYAR" || p.status === "DIPROSES",
    ).length;
    const bookingBaru = bookings.filter((b) => b.status === "DIAJUKAN").length;
    const pendapatanBulan = safeOrders
      .filter((p) => p.status === "SELESAI" || p.status === "DIKIRIM")
      .reduce((sum, p) => sum + (Number(p.totalHarga) || 0), 0);

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
        value: formatRupiah(pendapatanBulan),
        icon: DollarSign,
        color: "bg-green-100 text-green-600",
        path: "/seller/pesanan",
      },
    ];
  }, [store, orders, bookings]);

  return {
    store,
    orders,
    bookings,
    loading:
      storeQuery.isLoading || ordersQuery.isLoading || bookingsQuery.isLoading,
    stats,
  };
};
