"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MessageCircle,
  User,
  Loader2,
  Search,
  Shield,
  ChevronRight,
  Truck,
  Users as UsersIcon,
  ArrowUpDown,
  Check,
  X,
  Headphones,
} from "lucide-react";

import { chatApi, storesApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";

interface ConvData {
  id: string;
  // Backend returns 'tipe', normalise to both
  type?: string;
  tipe?: string;
  // Backend fields
  otherParticipantId?: string;
  otherParticipantName?: string;
  pesanTerakhir?: string | null;
  waktuPesanTerakhir?: string | null;
  // Normalised fields (populated after mapping)
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  otherUser?: {
    id: string;
    name: string | null;
    nama?: string | null;
    email?: string;
    role?: string;
  } | null;
  unreadCount: number;
}

const SellerChatSidebar: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const activeId = params.id as string | undefined;

  const [conversations, setConversations] = useState<ConvData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminConvId, setAdminConvId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"user" | "operasional">("user");
  // Track draft conv IDs so useMemo re-runs when drafts change
  const [draftConvIds, setDraftConvIds] = useState<Set<string>>(new Set());

  // Courier Info
  const [courierStaff, setCourierStaff] = useState<any>(null);
  const [courierList, setCourierList] = useState<any[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const unreadUserCount = useMemo(() => {
    return conversations
      .filter((c) => (c.tipe || c.type) !== "ADMIN_CS")
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const unreadOperasionalCount = useMemo(() => {
    return conversations
      .filter((c) => (c.tipe || c.type) === "ADMIN_CS")
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const updateDrafts = useCallback(() => {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("chat_draft_"),
    );
    const ids = new Set(keys.map((k) => k.replace("chat_draft_", "")));
    setDraftConvIds(ids);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    updateDrafts();

    window.addEventListener("chat_draft_updated", updateDrafts);
    window.addEventListener("chat_draft_changed", updateDrafts);
    window.addEventListener("storage", updateDrafts);
    return () => {
      window.removeEventListener("chat_draft_updated", updateDrafts);
      window.removeEventListener("chat_draft_changed", updateDrafts);
      window.removeEventListener("storage", updateDrafts);
    };
  }, [updateDrafts]);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      const data = res.data?.data || res.data || [];
      const rawConvs: any[] = Array.isArray(data) ? data : [];

      // Normalise backend fields → uniform ConvData shape
      const convs: ConvData[] = rawConvs
        .filter((c, i, self) => self.findIndex((t) => t.id === c.id) === i) // unique
        .map((c: any) => {
          const rawName =
            c.otherUser?.name ||
            c.otherUser?.nama ||
            c.pembeli?.name ||
            c.pembeli?.nama ||
            c.customer?.name ||
            c.customer?.nama ||
            c.user?.name ||
            c.user?.nama ||
            c.otherParticipantName ||
            c.nama ||
            c.name ||
            (c.otherUser?.email ? c.otherUser.email.split("@")[0] : null) ||
            (c.pembeli?.email ? c.pembeli.email.split("@")[0] : null) ||
            (c.customer?.email ? c.customer.email.split("@")[0] : null);

          const cleanName =
            rawName && rawName !== "Unknown" && rawName !== "Unknown Pengguna"
              ? rawName.trim()
              : c.otherUser?.email
                ? c.otherUser.email.split("@")[0]
                : "Pelanggan";

          const otherObj = c.otherUser || c.pembeli || c.customer || c.user;

          return {
            ...c,
            tipe: c.tipe || c.type,
            lastMessage: c.lastMessage ?? c.pesanTerakhir ?? null,
            lastMessageAt: c.lastMessageAt ?? c.waktuPesanTerakhir ?? null,
            otherUser: {
              id: otherObj?.id || c.otherParticipantId || "",
              name: cleanName,
              nama: cleanName,
              email: otherObj?.email || "",
              role:
                otherObj?.role ||
                otherObj?.peran ||
                c.otherParticipantRole ||
                null,
            },
          };
        });

      setConversations(convs);
    } catch (error) {
      console.error("Failed to fetch seller conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const res = await storesApi.getMyStore();
      const data = res.data?.data || res.data;
      const rawList =
        data?.kurirStaffs &&
        Array.isArray(data.kurirStaffs) &&
        data.kurirStaffs.length > 0
          ? data.kurirStaffs
          : data?.courierStaff
            ? [data.courierStaff]
            : [];
      const normalizedList = rawList.map((k: any) => ({
        ...k,
        id: k.id_pengguna || k.id,
        name: k.name || k.nama || null,
      }));
      setCourierList(normalizedList);
      if (normalizedList.length > 0) {
        setCourierStaff(normalizedList[0]);
      }
    } catch (err) {
      console.error("Failed to fetch store courier info", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStoreInfo();

    // SSE Real-time Updates for Seller Conversation List
    const eventSource = new EventSource("/api/proxy/chat/stream", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        if (
          rawData?.type === "heartbeat" ||
          rawData?.data?.type === "heartbeat"
        )
          return;
        fetchConversations();
      } catch (err) {
        fetchConversations();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE seller sidebar connection error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleContactAdmin = async () => {
    const courierId = courierStaff?.id || courierStaff?.id_pengguna;
    const existingAdminConv = conversations.find((c) => {
      const isAdminType = c.tipe === "ADMIN_CS" || c.type === "ADMIN_CS";
      const isCourier =
        courierId &&
        (c.otherParticipantId === courierId || c.otherUser?.id === courierId);
      return isAdminType && !isCourier;
    });

    if (existingAdminConv) {
      router.push(`/seller/chat/${existingAdminConv.id}`);
      return;
    }

    try {
      setLoading(true);
      const res = await chatApi.createConversation({ type: "ADMIN_CS" });
      const data = res.data?.data || res.data;
      if (data?.id) {
        router.push(`/seller/chat/${data.id}`);
      }
    } catch (err) {
      console.error("Failed to initiate chat with admin", err);
      alert("Gagal memulai obrolan dengan admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactCourier = async (targetCourier?: any) => {
    const kurir = targetCourier || courierStaff;
    if (!kurir) {
      alert("Toko Anda belum memiliki kurir afiliasi.");
      return;
    }
    const targetId = kurir.id || kurir.id_pengguna;
    if (!targetId) {
      alert("ID kurir tidak ditemukan.");
      return;
    }

    const existingCourierConv = conversations.find(
      (c) =>
        (c.otherParticipantId === targetId || c.otherUser?.id === targetId) &&
        (c.tipe === "ADMIN_CS" || c.type === "ADMIN_CS"),
    );

    if (existingCourierConv) {
      router.push(`/seller/chat/${existingCourierConv.id}`);
      setIsContactModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      const res = await chatApi.createConversation({
        type: "ADMIN_CS",
        targetUserId: targetId,
      });
      const data = res.data?.data || res.data;
      if (data?.id) {
        router.push(`/seller/chat/${data.id}`);
        setIsContactModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to initiate chat with courier", err);
      alert("Gagal memulai obrolan dengan kurir.");
    } finally {
      setLoading(false);
    }
  };

  const sortedAndFilteredConversations = useMemo(() => {
    const filtered = conversations.filter((conv) => {
      const convType = conv.tipe || conv.type || "";
      const isAdminOrStaff = convType === "ADMIN_CS";

      if (activeTab === "user" && isAdminOrStaff) return false;
      if (activeTab === "operasional" && !isAdminOrStaff) return false;

      // Hide conversations with no messages AND no draft
      const hasDraft = draftConvIds.has(conv.id);
      const hasMessage = !!(conv.lastMessage || conv.pesanTerakhir);
      if (!hasMessage && !hasDraft) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const name =
        conv.otherUser?.name ||
        conv.otherParticipantName ||
        conv.otherUser?.email ||
        "";
      return name.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(
        a.lastMessageAt || a.waktuPesanTerakhir || 0,
      ).getTime();
      const timeB = new Date(
        b.lastMessageAt || b.waktuPesanTerakhir || 0,
      ).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [conversations, searchQuery, sortOrder, draftConvIds, activeTab]);

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
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  if (!isMounted)
    return (
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex-shrink-0" />
    );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0 relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
            <MessageCircle size={22} className="text-primary-600" />
            Percakapan
          </h1>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all shadow-xs"
            title="Daftar Kontak Operasional"
          >
            <UsersIcon size={15} />
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={
                activeTab === "user"
                  ? "Cari pelanggan..."
                  : "Cari operasional..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`p-2 rounded-lg border transition-all ${showSortMenu ? "bg-primary-50 border-primary-200 text-primary-600" : "bg-white border-gray-200 text-gray-400"}`}
            >
              <ArrowUpDown size={16} />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 z-20 animate-in fade-in zoom-in duration-150">
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setShowSortMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${sortOrder === "newest" ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Terbaru ke Lama
                    {sortOrder === "newest" && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setShowSortMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${sortOrder === "oldest" ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Lama ke Terbaru
                    {sortOrder === "oldest" && <Check size={14} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher: Pelanggan vs Operasional */}
        <div className="flex border border-gray-200/80 bg-gray-100/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("user")}
            className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "user"
                ? "bg-white text-primary-600 font-semibold shadow-sm"
                : "text-gray-500 hover:text-gray-800 font-medium"
            }`}
          >
            <span>Pelanggan</span>
            {unreadUserCount > 0 && (
              <span className="px-1.5 py-0.5 bg-primary-600 text-white text-[10px] rounded-full font-semibold">
                {unreadUserCount > 9 ? "9+" : unreadUserCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("operasional")}
            className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "operasional"
                ? "bg-white text-primary-600 font-semibold shadow-sm"
                : "text-gray-500 hover:text-gray-800 font-medium"
            }`}
          >
            <span>Operasional</span>
            {unreadOperasionalCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-semibold">
                {unreadOperasionalCount > 9 ? "9+" : unreadOperasionalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : sortedAndFilteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedAndFilteredConversations.map((conv) => {
              const convType = conv.tipe || conv.type || "";
              const rawCustomerName =
                conv.otherUser?.name ||
                conv.otherUser?.nama ||
                (conv as any).pembeli?.nama ||
                (conv as any).pembeli?.name ||
                (conv as any).customer?.nama ||
                (conv as any).customer?.name ||
                (conv as any).user?.nama ||
                (conv as any).user?.name ||
                conv.otherParticipantName ||
                (conv.otherUser?.email
                  ? conv.otherUser.email.split("@")[0]
                  : null);

              const name =
                rawCustomerName &&
                rawCustomerName !== "Unknown" &&
                rawCustomerName !== "Unknown Pengguna" &&
                rawCustomerName !== "Pelanggan"
                  ? rawCustomerName
                  : "Pelanggan";

              const formatCustomerName = (raw: string | null | undefined) => {
                if (
                  !raw ||
                  raw === "Unknown" ||
                  raw === "Unknown Pengguna" ||
                  raw === "Pelanggan" ||
                  raw === "Pengguna"
                ) {
                  return "Pelanggan";
                }
                const trimmed = raw.trim();
                if (trimmed.startsWith("Pelanggan - ")) {
                  return trimmed;
                }
                return `Pelanggan - ${trimmed}`;
              };

              const isActive = activeId === conv.id;
              const isAdminChat = convType === "ADMIN_CS";

              // Determine if courier: match against courierStaff ID
              const courierId = courierStaff?.id || courierStaff?.id_pengguna;
              const isCourierChat =
                isAdminChat &&
                !!courierId &&
                (conv.otherParticipantId === courierId ||
                  conv.otherUser?.id === courierId);

              // Draft support (WhatsApp-style)
              const draft =
                typeof window !== "undefined"
                  ? localStorage.getItem(`chat_draft_${conv.id}`) || ""
                  : "";

              const lastMsg = conv.lastMessage ?? conv.pesanTerakhir;
              const lastTime = conv.lastMessageAt ?? conv.waktuPesanTerakhir;

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/seller/chat/${conv.id}`)}
                  className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${
                    isActive ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                      {isCourierChat ? (
                        <Truck size={18} />
                      ) : isAdminChat ? (
                        <Shield size={18} />
                      ) : (
                        <User size={18} />
                      )}
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
                        className={`text-sm truncate ${
                          isActive
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {isCourierChat
                          ? courierStaff?.name ||
                            (name !== "Customer Support" &&
                            name !== "Pengguna" &&
                            name !== "Unknown Pengguna"
                              ? name
                              : "Kurir Afiliasi")
                          : isAdminChat
                            ? "Admin Operasional"
                            : formatCustomerName(rawCustomerName)}
                      </p>
                      {lastTime && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTime(lastTime)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        conv.unreadCount > 0
                          ? "text-gray-800 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {draft ? (
                        <span>
                          <span className="text-red-500 font-semibold">
                            Draf:{" "}
                          </span>
                          <span className="text-gray-600">{draft}</span>
                        </span>
                      ) : lastMsg ? (
                        lastMsg
                      ) : (
                        "Belum ada pesan"
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 select-none">
            <Image
              src="/images/chat.svg"
              alt="Mulai percakapan"
              width={160}
              height={160}
              className="mb-3 opacity-90 mix-blend-multiply"
            />
            <p className="text-sm font-bold text-gray-800 mb-1">
              {activeTab === "user"
                ? "Belum Ada Chat Pelanggan"
                : "Belum Ada Chat Operasional"}
            </p>
            <p className="text-xs text-gray-400 font-normal leading-relaxed max-w-[200px]">
              {activeTab === "user"
                ? "Pesan dari pembeli produk Anda akan tampil di sini."
                : "Klik tombol kontak di kanan atas untuk menghubungi Admin Bantuan atau Kurir Afiliasi."}
            </p>
          </div>
        )}
      </div>

      {/* Operational Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-150">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                <UsersIcon size={18} className="text-primary-600" />
                Daftar Kontak Operasional
              </h2>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Kurir Afiliasi Toko */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Kurir Afiliasi Toko
                </p>
                {courierList.length > 0 ? (
                  <div className="space-y-2">
                    {courierList.map((kurir, index) => (
                      <button
                        key={kurir.id || index}
                        onClick={() => {
                          setIsContactModalOpen(false);
                          handleContactCourier(kurir);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50/70 hover:bg-gray-100/80 rounded-xl transition-all border border-gray-100 group text-left"
                      >
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {kurir.name ||
                                kurir.nama ||
                                kurir.email?.split("@")[0] ||
                                "Kurir"}
                            </p>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[10px] font-medium">
                              Kurir
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                            {kurir.email || "Kurir Afiliasi Toko"}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-xs font-medium text-gray-500">
                      Belum Ada Kurir Afiliasi
                    </p>
                  </div>
                )}
              </div>

              {/* Dukungan & Tim Sistem */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Dukungan & Tim Sistem
                </p>
                <div className="space-y-2">
                  {/* Admin Operasional */}
                  <button
                    onClick={() => {
                      setIsContactModalOpen(false);
                      handleContactAdmin();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50/70 hover:bg-gray-100/80 rounded-xl transition-all border border-gray-100 group text-left"
                  >
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        Admin Operasional
                      </p>
                      <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                        Pengaturan akun, toko & sistem
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                    />
                  </button>

                  {/* Customer Service (CS) */}
                  <button
                    onClick={() => {
                      setIsContactModalOpen(false);
                      handleContactAdmin();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50/70 hover:bg-gray-100/80 rounded-xl transition-all border border-gray-100 group text-left"
                  >
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Headphones size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        Customer Service (CS)
                      </p>
                      <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                        Bantuan transaksi & kendala pesanan
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerChatSidebar;
