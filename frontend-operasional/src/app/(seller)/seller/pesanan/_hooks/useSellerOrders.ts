import { useState, useCallback, useRef } from "react";

import { storesApi, ordersApi, shippingApi } from "@/lib/ecommerce-api";

export interface OrderItem {
  id: string;
  status: string;
  totalHarga: number | string;
  metodeBayar: string;
  createdAt: string;
  customer?: { name?: string; email?: string; phone?: string };
  penerima?: string;
  pembeli?: string;
  alamatKirim?: string;
  items?: Array<{
    product?: {
      nama: string;
      gambarUrl?: string;
      namaEtalase?: string;
      satuan?: string;
    };
    jumlah: number | string;
    harga: number | string;
  }>;
  shipping?: {
    status: string;
    trackingHistory?: Array<{ status: string }>;
    kurirName?: string;
    kurirPhone?: string;
    kurirPenggunaId?: string;
  };
}

export const useSellerOrders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [myStore, setMyStore] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const lastParamsRef = useRef<{
    page: number;
    limit: number;
    status?: string;
  }>({
    page: 1,
    limit: 10,
    status: "semua",
  });

  const fetchOrders = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      status?: string,
      showLoading = true,
    ) => {
      try {
        if (showLoading) setLoading(true);

        lastParamsRef.current = { page, limit, status };

        const storeRes = await storesApi.getMyStore();
        const storeData = storeRes?.data?.data || storeRes?.data;
        if (!storeData?.id) {
          setErrorText("Toko tidak ditemukan.");
          return;
        }
        setMyStore(storeData);

        const queryParams: any = { isGrosir: false, page, limit };
        if (status) {
          queryParams.status = status;
        }

        const [ordersRes, statsRes] = await Promise.all([
          ordersApi.sellerGetOrders(storeData.id, queryParams),
          ordersApi.getDashboardStats(storeData.id),
        ]);

        const responseData = ordersRes?.data?.data || ordersRes?.data;
        const rawList = responseData?.data || responseData || [];

        if (responseData?.totalPages) {
          setTotalPages(responseData.totalPages);
          setTotalItems(responseData.total || 0);
        }

        const statsData = statsRes?.data?.data || statsRes?.data;
        if (statsData?.statusCounts) {
          setStatusCounts(statsData.statusCounts);
        }

        const list = Array.isArray(rawList)
          ? rawList
              .filter((o: any) => !o.isGrosir)
              .map((o: any) => ({
                ...o,
                shipping: o.shipping || o.pengiriman,
                customer: o.customer
                  ? {
                      ...o.customer,
                      phone:
                        o.customer.phone ||
                        o.customer.noTelepon ||
                        o.konsumen?.noTelepon ||
                        o.konsumen?.addresses?.[0]?.telepon,
                    }
                  : o.konsumen
                    ? {
                        name: o.konsumen.nama,
                        email: o.konsumen.email,
                        phone:
                          o.konsumen.noTelepon ||
                          o.konsumen.addresses?.[0]?.telepon,
                      }
                    : undefined,
                items: (o.items || o.item || []).map((it: any) => ({
                  ...it,
                  product: it.product || it.produk,
                })),
              }))
          : [];

        setOrders(list);
      } catch (err) {
        console.error(err);
        setErrorText("Gagal memuat pesanan.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshCurrentOrders = useCallback(async () => {
    const { page, limit, status } = lastParamsRef.current;
    await fetchOrders(page, limit, status, false);
  }, [fetchOrders]);

  const handleInitShipping = async (orderId: string) => {
    if (!myStore?.courierStaff) {
      throw new Error(
        "Gudang Anda belum didaftarkan Kurir oleh Admin. Hubungi Admin Pusat untuk menugaskan kurir ke gudang Anda.",
      );
    }
    setActionLoading("init");
    try {
      await shippingApi.init(orderId);
      await refreshCurrentOrders();
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvanceStatus = async (
    orderId: string,
    note: string,
    kurirId?: string,
    sendEmailNotification?: boolean,
  ) => {
    setActionLoading("advance");
    try {
      const payload: any = { note, sendEmailNotification };
      if (kurirId) {
        const selectedCourier =
          myStore?.kurirStaffs?.find((c: any) => c.id === kurirId) ||
          (myStore?.courierStaff?.id === kurirId ? myStore.courierStaff : null);
        if (selectedCourier) {
          payload.kurirPenggunaId = selectedCourier.id;
          payload.kurirName =
            selectedCourier.nama || selectedCourier.name || "Kurir Toko";
          payload.kurirPhone =
            selectedCourier.noTelepon ||
            selectedCourier.phoneNumber ||
            undefined;
        }
      }
      await shippingApi.advance(orderId, payload);
      await refreshCurrentOrders();
    } finally {
      setActionLoading(null);
    }
  };

  return {
    orders,
    loading,
    errorText,
    myStore,
    actionLoading,
    fetchOrders,
    refreshCurrentOrders,
    handleInitShipping,
    handleAdvanceStatus,
    totalPages,
    totalItems,
    statusCounts,
  };
};
