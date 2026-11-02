"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  ArrowLeft,
  MessageCircle,
  Store,
  Headphones,
  Loader2,
} from "lucide-react";

import { formatTanggal } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import { useConversations } from "@/src/hooks/chat/useConversations";
import { useChatAction } from "@/src/hooks/chat/useChatAction";
import { NotifSkeleton } from "@/src/components/ecommerce/Skeleton";
import EmptyState from "@/src/components/ecommerce/EmptyState";

interface ChatSidebarProps {
  className?: string;
  activeConversationId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  className = "",
  activeConversationId,
}) => {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();
  const isVerifiedB2B = user?.isVerifiedB2B === true;

  const { conversations, loading, refetch } = useConversations(
    isAuthenticated,
    _hasHydrated,
  );

  // SSE Real-time Updates for Conversation List
  React.useEffect(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    const eventSource = new EventSource("/api/proxy/chat/stream", {
      withCredentials: true,
    });

    eventSource.onmessage = () => {
      refetch();
    };

    eventSource.onerror = (err) => {
      console.error("SSE chat list connection error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, _hasHydrated, refetch]);

  const { handleStartAdminCS, chatLoading } = useChatAction();

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Kemarin";
    return formatTanggal(dateStr);
  };

  // Separate CS and seller conversations
  const csConversations = conversations.filter((conv) => {
    const convType = (conv as any).tipe || conv.type;
    return convType !== "CHAT_PENJUAL" && convType !== "SELLER_CHAT";
  });

  const sellerConversations = conversations.filter((conv) => {
    const convType = (conv as any).tipe || conv.type;
    return convType === "CHAT_PENJUAL" || convType === "SELLER_CHAT";
  });

  // Total unread from CS conversations
  const csUnreadCount = csConversations.reduce(
    (sum, conv) => sum + ((conv as any).unreadCount || 0),
    0,
  );

  if (loading) {
    return (
      <div className={`bg-gray-50 h-full flex flex-col ${className}`}>
        <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
          <div className="flex items-center gap-3 w-full">
            <div className="w-32 h-5 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        </div>
        <div className="px-4 py-3 flex-1 overflow-y-auto space-y-3">
          <NotifSkeleton />
          <NotifSkeleton />
          <NotifSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-50 h-full flex flex-col overflow-hidden border-r border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {isVerifiedB2B && (
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors lg:hidden"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h1 className="font-display font-semibold text-base text-gray-900">
              Percakapan
            </h1>
          </div>
          {conversations.length > 0 && (
            <p className="text-gray-400 text-xs hidden lg:block">
              {conversations.length} percakapan
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {/* Chat CS Button */}
        <button
          onClick={() => handleStartAdminCS()}
          disabled={chatLoading}
          className="relative w-full bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.99]"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {chatLoading ? (
              <Loader2 size={20} className="text-primary-600 animate-spin" />
            ) : (
              <Headphones size={20} className="text-primary-600" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-sm text-gray-800">
              Customer Service
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Tanya seputar pesanan, produk, atau keluhan
            </p>
          </div>
          {csUnreadCount > 0 ? (
            <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
              {csUnreadCount > 9 ? "9+" : csUnreadCount}
            </span>
          ) : (
            <MessageCircle size={16} className="text-gray-300 flex-shrink-0" />
          )}
        </button>

        {/* Seller Conversations */}
        {sellerConversations.length > 0 && (
          <div className="pt-3 space-y-2">
            <p className="text-xs text-gray-400 font-medium px-1">
              Riwayat Chat
            </p>
            {sellerConversations.map((conv) => {
              const lastMessageAt =
                (conv as any).waktuPesanTerakhir ||
                (conv as any).pesanTerakhirAt ||
                conv.lastMessageAt;
              const lastMessage =
                (conv as any).pesanTerakhir || conv.lastMessage;
              const unreadCount = (conv as any).unreadCount || 0;
              const displayName = (conv as any).otherParticipantName || "Toko";
              const isActive = conv.id === activeConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className={`w-full rounded-xl border px-4 py-3.5 flex items-center gap-3 transition-all active:scale-[0.99] text-left ${isActive ? "bg-primary-50 border-primary-100 shadow-none" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${unreadCount > 0 || isActive ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        {displayName}
                      </p>
                      <span
                        className={`text-[10px] flex-shrink-0 ${unreadCount > 0 ? "text-primary-600 font-semibold" : "text-gray-400"}`}
                      >
                        {formatTime(lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${unreadCount > 0 || isActive ? "text-gray-700" : "text-gray-400"}`}
                      >
                        {lastMessage || "Belum ada pesan"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {sellerConversations.length === 0 && (
          <div className="pt-4">
            <EmptyState
              icon={<MessageCircle size={48} />}
              title="Belum ada percakapan"
              description="Chat dengan penjual langsung dari halaman produk mereka."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
