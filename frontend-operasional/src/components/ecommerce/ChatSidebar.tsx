"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  User,
  Loader2,
  Search,
  Headphones,
  Users as UsersIcon,
} from "lucide-react";

import { chatApi } from "@/lib/ecommerce-api";

import ContactListModal from "./ContactListModal";

interface AdminConvData {
  id: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string;
    peran?: string;
  } | null;
  unreadCount: number;
}

const ChatSidebar: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const activeId = params.id as string | undefined;

  const [conversations, setConversations] = useState<AdminConvData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [draftTrigger, setDraftTrigger] = useState(0);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.adminGetConversations({ limit: 50 });
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      const convs = Array.isArray(data) ? data : [];

      // Ensure uniqueness and filter by route
      const basePath =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/cs")
          ? "/cs/chat"
          : "/admin/chat";

      const isCsPage = basePath === "/cs/chat";

      const uniqueConvs = convs.filter((c: any, index: number, self: any[]) => {
        const isUnique = index === self.findIndex((t) => t.id === c.id);
        if (!isUnique) return false;

        if (isCsPage) {
          // CS handles everything or primarily consumers
          return true;
        } else {
          // Admin handles operasional only, exclude consumers
          return c.customer?.peran !== "KONSUMEN";
        }
      });
      setConversations(uniqueConvs);
    } catch (error) {
      console.error("Failed to fetch CS conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchConversations();

    // SSE Real-time Updates for Conversation List
    // We listen to a general stream (or could be specific to user)
    // For now, any 'chat.sent' event will trigger a refresh of the list
    const eventSource = new EventSource("/api/proxy/chat/stream", {
      withCredentials: true,
    }); // We'll need this endpoint or reuse one

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        if (
          rawData?.type === "heartbeat" ||
          rawData?.data?.type === "heartbeat"
        )
          return;

        // Whenever ANY REAL chat activity happens, refresh our list
        fetchConversations();
      } catch (err) {
        // If it's not JSON or fails to parse, still refresh as a fallback for plain events
        fetchConversations();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE sidebar connection error:", err);
    };

    const handleDraft = () => setDraftTrigger((t) => t + 1);
    window.addEventListener("chat_draft_changed", handleDraft);

    return () => {
      eventSource.close();
      window.removeEventListener("chat_draft_changed", handleDraft);
    };
  }, []);

  const handleSelectContact = async (userId: string) => {
    setIsContactModalOpen(false);
    try {
      const res = await chatApi.createConversation({
        type: "ADMIN_CS",
        targetUserId: userId,
      });
      const convData = res.data?.data || res.data;
      if (convData?.id) {
        // Refresh conversations to ensure it's in the list
        await fetchConversations();
        const basePath =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/cs")
            ? "/cs/chat"
            : "/admin/chat";
        router.push(`${basePath}/${convData.id}`);
      }
    } catch (err) {
      console.error("Failed to initiate chat with contact", err);
      alert("Gagal memulai obrolan dengan kontak terpilih.");
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = conv.customer?.name || conv.customer?.email || "";
      if (!name.toLowerCase().includes(q)) return false;
    }

    // Draft / Empty filter (exclude empty conversations without a draft)
    const draft =
      typeof window !== "undefined"
        ? localStorage.getItem(`chat_draft_${conv.id}`)
        : null;
    if (!conv.lastMessage && conv.unreadCount === 0 && !draft) {
      return false;
    }

    return true;
  });

  const formatTime = (dateStr: string | null) => {
    if (!dateStr || !isMounted) return "";
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
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  if (!isMounted)
    return (
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0" />
    );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
            <Headphones size={24} className="text-primary-600" />
            Pusat Bantuan
          </h1>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all shadow-xs"
            title="Daftar Kontak Operasional"
          >
            <UsersIcon size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 focus:bg-white transition-all"
          />
        </div>

        {/* Menu Khusus Admin: Kirim Broadcast */}
        {typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin/chat") && (
            <div className="mt-4">
              <button
                onClick={() => router.push("/admin/chat/broadcast")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                ${
                  window.location.pathname === "/admin/chat/broadcast"
                    ? "bg-primary-50/50 border-primary-200"
                    : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-50 text-primary-600 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 11 18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-display text-sm font-medium ${window.location.pathname === "/admin/chat/broadcast" ? "text-primary-900" : "text-gray-800"}`}
                  >
                    Kirim Broadcast
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    Pesan massal ke pengguna
                  </p>
                </div>
              </button>
            </div>
          )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conv) => {
              const customerName =
                conv.customer?.name || conv.customer?.email || "Customer";
              const isActive = activeId === conv.id;

              const basePath =
                typeof window !== "undefined" &&
                window.location.pathname.startsWith("/cs")
                  ? "/cs/chat"
                  : "/admin/chat";
              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`${basePath}/${conv.id}`)}
                  className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${
                    isActive ? "bg-primary-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-primary-200" : "bg-primary-100"
                      }`}
                    >
                      <User size={18} className="text-primary-600" />
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`font-display text-sm truncate ${isActive ? "font-bold text-primary-900" : "font-semibold text-gray-900"}`}
                      >
                        {customerName}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    {typeof window !== "undefined" &&
                    localStorage.getItem(`chat_draft_${conv.id}`) ? (
                      <p className="text-xs truncate mt-0.5 text-gray-600">
                        <span className="text-red-500 font-semibold">
                          Draf:{" "}
                        </span>
                        {localStorage.getItem(`chat_draft_${conv.id}`)}
                      </p>
                    ) : (
                      <p
                        className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}
                      >
                        {conv.lastMessage || "Belum ada pesan"}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={20} className="text-gray-300" />
            </div>
            <p className="font-display font-medium text-sm text-gray-500">
              Belum Ada Chat
            </p>
          </div>
        )}
      </div>

      <ContactListModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default ChatSidebar;
