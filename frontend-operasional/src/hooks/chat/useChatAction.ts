import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { chatApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";

export const useChatAction = () => {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();
  const [chatLoading, setChatLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChatSeller = async (produkId: string, tokoId: string) => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setChatLoading(true);
    try {
      if (!tokoId) throw new Error("Store ID not found");

      const res = await chatApi.createConversation({
        type: "SELLER_CHAT",
        tokoId,
      });
      const conv = res.data?.data || res.data;
      if (conv?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.all,
        });
        // Navigasi ke room chat dan bawa ID produk sebagai konteks
        router.push(`/chat/${conv.id}?produkId=${produkId}`);
      }
    } catch (error) {
      console.error("Failed to start chat with seller:", error);
      alert("Gagal memulai chat dengan seller");
    } finally {
      setChatLoading(false);
    }
  };

  const handleStartAdminCS = async (bookingId?: string) => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setChatLoading(true);
    try {
      const res = await chatApi.createConversation({ type: "ADMIN_CS" });
      const conv = res.data?.data || res.data;
      if (conv?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.all,
        });
        const url = bookingId
          ? `/chat/${conv.id}?bookingId=${bookingId}`
          : `/chat/${conv.id}`;
        router.push(url);
      }
    } catch (error) {
      console.error("Failed to create CS conversation:", error);
      alert("Gagal memulai chat Customer Service");
    } finally {
      setChatLoading(false);
    }
  };

  return { handleChatSeller, handleStartAdminCS, chatLoading };
};
