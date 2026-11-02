import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { ordersApi, chatApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import type { ApiOrderData, ApiOrderItem, ApiOrderShipping } from "@/types";

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
      setOrder(res?.data?.data || res?.data);
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
    if (!confirm("Konfirmasi bahwa Anda sudah menerima barang?")) return;
    setConfirming(true);
    try {
      await ordersApi.confirmReceived(id);
      await fetchOrder();
    } catch (err: any) {
      alert(err.message || "Gagal");
    } finally {
      setConfirming(false);
    }
  }, [id, fetchOrder]);

  const handleChat = useCallback(async () => {
    if (!order) return;
    setChattingLoading(true);
    try {
      // Backend uses 'item' (singular) as seen in PesananEcom model
      const items = (order as any).item || [];
      const tokoId = (order as any).tokoId || items[0]?.produk?.toko?.id;

      console.log("Chat debug: starting chat with tokoId", tokoId);

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
