"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";

import { chatApi, formatRupiah } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";

interface MessageData {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ProductMeta {
  id: string;
  nama: string;
  harga: number;
  fotoUrl?: string | null;
  gambarUtama?: string | null;
}

interface OrderMeta {
  orderId: string;
  shortId: string;
  status: string;
  storeName: string;
  totalHarga: number;
  itemCount: number;
  firstItemName: string;
  firstItemImage: string | null;
}

interface ConvDetail {
  id: string;
  type: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

const AdminChatRoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const { user } = useAuthStore();
  const currentUserId = user?.id || "";

  const [conversation, setConversation] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getConversation(conversationId, {
        limit: 100,
      });
      const data = res.data?.data || res.data;
      if (data?.conversation) {
        setConversation(data.conversation);
      }
      // Backend returns data.pesan (Prisma field), not data.messages
      if (data?.pesan && Array.isArray(data.pesan)) {
        const mapped = data.pesan.map((p: any) => ({
          id: p.id || `msg-${p.createdAt || Date.now()}-${Math.random()}`,
          senderId: p.pengirimId || p.senderId,
          content:
            p.isiPesan ||
            p.content ||
            p.text ||
            p.message ||
            p.body ||
            p.pesan ||
            "",
          isRead: p.sudahDibaca === true || p.status === "DIBACA",
          createdAt: p.createdAt || p.tanggalDibuat || new Date().toISOString(),
        }));
        const unique = mapped.filter(
          (msg: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === msg.id),
        );
        setMessages(unique);
      } else if (data?.messages && Array.isArray(data.messages)) {
        // Map fields for data.messages too
        const mapped = data.messages.map((p: any) => ({
          id: p.id || `msg-${p.createdAt || Date.now()}-${Math.random()}`,
          senderId: p.pengirimId || p.senderId,
          content:
            p.isiPesan ||
            p.content ||
            p.text ||
            p.message ||
            p.body ||
            p.pesan ||
            "",
          isRead: p.sudahDibaca === true || p.status === "DIBACA",
          createdAt: p.createdAt || p.tanggalDibuat || new Date().toISOString(),
        }));
        const unique = mapped.filter(
          (msg: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === msg.id),
        );
        setMessages(unique);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [conversationId]);

  useEffect(() => {
    const init = async () => {
      await fetchMessages();
      setLoading(false);
      chatApi.markAsRead(conversationId).catch(() => {});
    };
    init();

    // SSE Real-time Streaming
    const eventSource = new EventSource(
      `/api/proxy/chat/conversations/${conversationId}/stream`,
      { withCredentials: true },
    );

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);

        // Skip heartbeat messages
        if (
          rawData?.type === "heartbeat" ||
          rawData?.data?.type === "heartbeat"
        )
          return;

        const msgObj = rawData.data || rawData;

        // Skip if no real message ID or sender
        if (
          !msgObj.id &&
          !msgObj.pengirimId &&
          !msgObj.senderId &&
          !msgObj.message?.id
        )
          return;

        const newMessage: MessageData = {
          id:
            msgObj.id ||
            msgObj.message?.id ||
            `msg-${Date.now()}-${Math.random()}`,
          senderId:
            msgObj.pengirimId ||
            msgObj.senderId ||
            msgObj.message?.pengirimId ||
            msgObj.message?.senderId,
          content:
            msgObj.isiPesan ||
            msgObj.content ||
            msgObj.text ||
            msgObj.message?.isiPesan ||
            msgObj.message?.content ||
            msgObj.pesan ||
            "",
          isRead:
            msgObj.sudahDibaca || msgObj.isRead || msgObj.status === "DIBACA",
          createdAt:
            msgObj.createdAt ||
            msgObj.tanggalDibuat ||
            new Date().toISOString(),
        };

        // Extra safety check for empty content
        if (!newMessage.content && !newMessage.senderId) return;

        setMessages((prev) => {
          if (newMessage.id && prev.some((m) => m.id === newMessage.id))
            return prev;

          if (String(newMessage.senderId) === String(currentUserId)) {
            const tempIndex = prev.findIndex(
              (m) =>
                m.id &&
                m.id.startsWith("temp-") &&
                m.content === newMessage.content,
            );
            if (tempIndex !== -1) {
              const newArr = [...prev];
              newArr[tempIndex] = newMessage;
              return newArr;
            }
          }

          return [...prev, newMessage];
        });

        // Mark as read if not from us
        if (String(newMessage.senderId) !== String(currentUserId)) {
          chatApi.markAsRead(conversationId).catch(() => {});
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [conversationId, fetchMessages, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    setNewMessage("");

    const optimisticMsg: MessageData = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await chatApi.sendMessage(conversationId, content);
      // Safety net: fetch messages after a short delay
      setTimeout(() => fetchMessages(), 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedMessages: { date: string; messages: MessageData[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  if (loading || !user?.id) {
    return (
      <div className="flex items-center justify-center py-20 h-full">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const customerName =
    conversation?.otherUser?.name ||
    conversation?.otherUser?.email ||
    "Customer";

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/80 px-5 py-4 flex items-center gap-4 z-20 border-b border-slate-200/50 flex-shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
        <button
          onClick={() => router.push("/cs/chat")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-200/50 shadow-sm">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-800 text-[16px] truncate tracking-tight">
            {customerName}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-slate-500 text-[12px] font-medium">
              Online • Customer
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-6 space-y-5 relative z-10 scroll-smooth">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-6 mt-4">
              <div className="backdrop-blur-md bg-white/60 border border-slate-200/50 shadow-sm text-slate-500 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase">
                {formatDateSeparator(group.messages[0].createdAt)}
              </div>
            </div>
            <div className="space-y-2">
              {group.messages.map((msg) => {
                const isMe = String(msg.senderId) === String(currentUserId);

                let actualContent = msg.content || "";
                let productMeta: ProductMeta | null = null;
                let orderMeta: OrderMeta | null = null;

                // Parse PRODUCT_META
                const metaIndex = actualContent.indexOf("---PRODUCT_META---");
                if (metaIndex !== -1) {
                  try {
                    const jsonStr = actualContent
                      .substring(metaIndex + "---PRODUCT_META---".length)
                      .trim();
                    productMeta = JSON.parse(jsonStr);
                    actualContent = actualContent
                      .substring(0, metaIndex)
                      .trim();
                  } catch {
                    // Ignore parse error
                  }
                }

                // Parse ORDER_META
                const orderMetaIndex =
                  actualContent.indexOf("---ORDER_META---");
                if (orderMetaIndex !== -1) {
                  try {
                    const jsonStr = actualContent
                      .substring(orderMetaIndex + "---ORDER_META---".length)
                      .trim();
                    orderMeta = JSON.parse(jsonStr);
                    actualContent = actualContent
                      .substring(0, orderMetaIndex)
                      .trim();
                  } catch {
                    // Ignore parse error
                  }
                }

                return (
                  <div
                    key={msg.id || `cs-msg-${msg.createdAt}`}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 relative group transition-all hover:shadow-md ${
                        isMe
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20 rounded-2xl rounded-tr-sm shadow-sm"
                          : "bg-white border border-slate-200/60 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm backdrop-blur-sm"
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {actualContent}
                      </p>

                      {/* Rich Order Meta Card */}
                      {orderMeta && (
                        <div
                          className={`mt-2 p-3 rounded-xl border ${
                            isMe
                              ? "bg-blue-700/40 border-blue-400/40"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex gap-2.5">
                            <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-white shadow-sm border border-gray-100">
                              {orderMeta.firstItemImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={orderMeta.firstItemImage}
                                  alt={orderMeta.firstItemName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg bg-gray-100">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12px] font-bold truncate ${isMe ? "text-white" : "text-gray-800"}`}
                              >
                                {orderMeta.firstItemName}
                                {orderMeta.itemCount > 1 && (
                                  <span
                                    className={`font-medium ${isMe ? "text-blue-200" : "text-gray-400"}`}
                                  >
                                    {" "}
                                    +{orderMeta.itemCount - 1} lainnya
                                  </span>
                                )}
                              </p>
                              <p
                                className={`text-[11px] font-semibold mt-0.5 ${isMe ? "text-white" : "text-blue-600"}`}
                              >
                                {formatRupiah(orderMeta.totalHarga)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`mt-2 pt-2 flex items-center justify-between border-t ${
                              isMe ? "border-blue-400/30" : "border-gray-200"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-mono font-bold ${isMe ? "text-blue-200" : "text-gray-400"}`}
                            >
                              #{orderMeta.shortId}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                orderMeta.status?.toUpperCase() ===
                                "MENUNGGU_BAYAR"
                                  ? "bg-amber-100 text-amber-700"
                                  : orderMeta.status?.toUpperCase() ===
                                      "DIPROSES"
                                    ? "bg-blue-100 text-blue-700"
                                    : orderMeta.status?.toUpperCase() ===
                                        "DIKIRIM"
                                      ? "bg-orange-100 text-orange-700"
                                      : orderMeta.status?.toUpperCase() ===
                                          "SELESAI"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {orderMeta.status}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rich Product Meta Card */}
                      {productMeta && (
                        <div
                          className={`mt-2 p-2 rounded-xl flex gap-3 border items-center shadow-sm ${
                            isMe
                              ? "bg-blue-700/50 border-blue-500/50"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="w-11 h-11 bg-white rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                            {productMeta.fotoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={productMeta.fotoUrl}
                                alt={productMeta.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">
                                📷
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-1">
                            <p
                              className={`text-[12px] font-bold truncate leading-tight ${
                                isMe ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {productMeta.nama}
                            </p>
                            <p
                              className={`text-[11px] font-medium mt-0.5 ${
                                isMe ? "text-blue-100" : "text-blue-600"
                              }`}
                            >
                              {formatRupiah(productMeta.harga)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMe
                            ? "justify-end text-blue-100"
                            : "justify-start text-gray-400"
                        }`}
                      >
                        <span className="text-[10px]">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMe &&
                          (msg.id.startsWith("temp-") ? (
                            <Loader2
                              size={12}
                              className="animate-spin text-blue-100"
                            />
                          ) : msg.isRead ? (
                            <CheckCheck size={14} className="text-white" />
                          ) : (
                            <Check size={14} className="text-blue-200" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-xl bg-white/80 px-4 sm:px-6 py-4 flex items-end gap-3 z-20 border-t border-slate-200/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] flex-shrink-0 transition-all">
        <div className="flex-1 relative group">
          <textarea
            ref={inputRef as any}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik balasan untuk customer..."
            rows={1}
            className="w-full py-3.5 px-6 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-3xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none overflow-hidden min-h-[52px] max-h-[120px]"
            style={{ height: "auto", minHeight: "52px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="w-[52px] h-[52px] bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none flex-shrink-0 mb-[1px]"
        >
          {sending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Send size={20} className="ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminChatRoomPage;
