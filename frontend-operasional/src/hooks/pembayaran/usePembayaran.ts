import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { ordersApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiOrderData } from "@/types";

export const usePembayaran = (orderId: string | null) => {
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const vaNumber = "8806 1234 5678 9012";

  const orderQuery = useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ""),
    queryFn: () => ordersApi.getById(orderId!),
    select: (res): ApiOrderData => res.data?.data || res.data,
    enabled: !!orderId && orderId !== "ORD00000001",
  });

  const order = orderQuery.data ?? null;

  useEffect(() => {
    if (!order?.createdAt) return;
    const timer = setInterval(() => {
      const orderDate = new Date(order.createdAt).getTime();
      const expiryDate = orderDate + 24 * 60 * 60 * 1000;
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
        await ordersApi.updateStatus(orderId, { status: "DIPROSES" });
        setIsPaid(true);
      } catch (error) {
        console.error("Failed to simulate payment", error);
        alert("Gagal memproses pembayaran mockup.");
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
    handleCopy,
    handleSimulatePayment,
  };
};
