import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { ordersApi, chatApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import type { ApiOrderData } from "@/types";

export const useOrderDetail = (id: string) => {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<ApiOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [chattingLoading, setChattingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await ordersApi.getById(id);
      let orderData = res?.data?.data || res?.data;
      if (orderData) {
        orderData = {
          ...orderData,
          id: orderData.id_pesanan || orderData.id || id,
        };
      }
      setOrder(orderData);
    } catch (e) {
      console.error("fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    Promise.resolve().then(() => fetchOrder());
  }, [_hasHydrated, isAuthenticated, fetchOrder, router]);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    try {
      await ordersApi.confirmReceived(id);
      router.push(`/pesanan/${id}/success`);
    } catch (err: any) {
      alert(err.message || "Gagal");
      setConfirming(false);
    }
  }, [id, router]);

  const handleChat = useCallback(async () => {
    if (!order) return;
    setChattingLoading(true);
    try {
      // Backend uses 'item' (singular) as seen in PesananEcom model
      const items = (order as any).item || [];
      const tokoId = (order as any).tokoId || items[0]?.produk?.toko?.id;

      console.warn("Chat debug: starting chat with tokoId", tokoId);

      if (!tokoId) {
        alert("Info toko tidak tersedia.");
        return;
      }
      const res = await chatApi.createConversation({
        type: "SELLER_CHAT",
        tokoId,
      });
      const conv = res.data?.data || res.data;
      if (conv?.id) {
        const p = new URLSearchParams({
          orderId: order.id_pesanan,
          orderStatus: order.status,
        });
        router.push(`/chat/${conv.id}?${p.toString()}`);
      }
    } catch {
      alert("Gagal membuka chat.");
    } finally {
      setChattingLoading(false);
    }
  }, [order, router]);

  const handleCopy = useCallback(() => {
    if (!order) return;
    navigator.clipboard.writeText(order.id_pesanan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [order]);

  return {
    order,
    loading,
    confirming,
    chattingLoading,
    copied,
    handleConfirm,
    handleChat,
    handleCopy,
  };
};
