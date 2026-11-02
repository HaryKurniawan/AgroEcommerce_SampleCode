import { useQueries, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

import { ordersApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/src/hooks/query-keys";
import type { ApiOrderData } from "@/types";

export const usePembayaran = (
  orderId: string | null,
  extraOrderIds: string[] = [],
) => {
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 59,
    seconds: 59,
  });

  // Reset state ketika orderId berubah (agar tidak nyangkut dari checkout sebelumnya)
  useEffect(() => {
    setIsPaid(false);
    setIsProcessing(false);
  }, [orderId]);

  // Fetch primary order
  const orderQuery = useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ""),
    queryFn: () => ordersApi.getById(orderId!),
    select: (res): ApiOrderData => res.data?.data || res.data,
    enabled: !!orderId && orderId !== "ORD00000001",
    // Poll API setiap 3 detik jika status masih MENUNGGU_BAYAR (untuk mendeteksi Webhook Xendit)
    refetchInterval: (query) => {
      // In React Query, query.state.data is the RAW data from queryFn, not the result of `select`.
      // Since queryFn returns an AxiosResponse, we must access .data.data or .data
      const rawRes = query.state?.data as any;
      const orderData = rawRes?.data?.data || rawRes?.data;
      if (
        orderData &&
        typeof orderData.status === "string" &&
        orderData.status.toUpperCase() === "MENUNGGU_BAYAR"
      ) {
        return 3000;
      }
      return false;
    },
  });

  // Fetch all extra orders (from multi-store checkout) to sum the totals
  const otherIds = extraOrderIds.filter((id) => id !== orderId);
  const extraQueries = useQueries({
    queries: otherIds.map((id) => ({
      queryKey: queryKeys.orders.detail(id),
      queryFn: () => ordersApi.getById(id),
      select: (res: any): ApiOrderData => res.data?.data || res.data,
      enabled: !!id,
    })),
  });

  const order = orderQuery.data ?? null;

  // Auto detect if payment is successful via backend webhook
  useEffect(() => {
    if (order?.status === "DIPROSES") {
      setIsPaid(true);
    }
  }, [order?.status]);

  // Jika metodeBayar adalah VA, paymentUrl berisi nomor VA. Jika Invoice, paymentUrl adalah link http.
  const isVaPayment = order?.metodeBayar?.endsWith("_VA") ?? false;
  const vaNumber =
    isVaPayment && order?.paymentUrl ? order.paymentUrl : "8806 1234 5678 9012";

  // Sum totals from all orders in same checkout session
  const totalGabungan = useMemo(() => {
    const primary = Number(order?.totalHarga || 0);
    const extra = extraQueries.reduce(
      (sum, q) =>
        sum + Number((q.data as ApiOrderData | undefined)?.totalHarga || 0),
      0,
    );
    return primary + extra;
  }, [order?.totalHarga, extraQueries]);

  const isMultiOrder = otherIds.length > 0;
  const allOrderIds = orderId ? [orderId, ...otherIds] : otherIds;

  useEffect(() => {
    if (!order?.createdAt) return;
    const timer = setInterval(() => {
      const orderDate = new Date(order.createdAt).getTime();
      const expiryDate = orderDate + 1 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const distance = expiryDate - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.createdAt]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(vaNumber).catch(console.error);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    if (orderId && orderId !== "ORD00000001") {
      try {
        // Konfirmasi semua pesanan dalam satu sesi checkout sekaligus.
        // Backend memvalidasi kepemilikan + status MENUNGGU_BAYAR untuk masing-masing.
        await Promise.all(
          allOrderIds.map((id) => ordersApi.confirmPayment(id)),
        );
        setIsPaid(true);
      } catch (error) {
        console.error("Failed to confirm payment", error);
        alert("Gagal memproses pembayaran. Silakan coba lagi.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      setTimeout(() => {
        setIsPaid(true);
        setIsProcessing(false);
      }, 500);
    }
  };

  return {
    order,
    loading: orderQuery.isLoading,
    isPaid,
    copied,
    isProcessing,
    timeLeft,
    vaNumber,
    totalGabungan,
    isMultiOrder,
    allOrderIds,
    isVaPayment,
    metodeBayar: order?.metodeBayar,
    paymentUrl: order?.paymentUrl,
    handleCopy,
    handleSimulatePayment,
  };
};
