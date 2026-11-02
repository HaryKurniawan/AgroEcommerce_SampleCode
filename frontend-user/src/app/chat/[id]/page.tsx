"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";

import {
  chatApi,
  productsApi,
  authApi,
  ordersApi,
  storesApi,
} from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import { ChatRoomSkeleton } from "@/src/components/ecommerce/Skeleton";
import type {
  ApiChatMessage,
  ApiChatProductMeta,
  ApiChatOrderMeta,
  ApiChatConversation,
} from "@/types";
import {
  ChatHeader,
  ChatWelcomeMessage,
  ChatFAQButtons,
  ChatDateSeparator,
  ChatMessageBubble,
  ChatInput,
} from "@/src/components/chat";
import {
  parseMessageMetadata,
  mapBackendMessage,
  groupMessagesByDate,
  getMessageSenderId,
} from "@/hooks/chat/chat-helpers";

const ChatRoomContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const searchParams = useSearchParams();

  // Core Chat States
  const [conversation, setConversation] = useState<ApiChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Context & Refs
  const [productContext, setProductContext] =
    useState<ApiChatProductMeta | null>(null);
  const [orderContext, setOrderContext] = useState<string | null>(null);
  const [orderMetaContext, setOrderMetaContext] =
    useState<ApiChatOrderMeta | null>(null);
  const orderCardSent = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialMessageSet = useRef(false);

  // Header info
  const [headerInfo, setHeaderInfo] = useState<{
    name: string;
    icon: "seller" | "cs";
    fotoUrl: string | null;
  }>({
    name: "Loading...",
    icon: "cs",
    fotoUrl: null,
  });

  // URL params
  const produkId = searchParams.get("produkId");
  const orderRef = searchParams.get("orderRef");
  const orderId = searchParams.get("orderId");
  const orderStatusParam = searchParams.get("orderStatus");

  const { user, _hasHydrated } = useAuthStore();
  const storeUserId = user?.id || "";
  const [resolvedUserId, setResolvedUserId] = useState(storeUserId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Resolve header info from conversation
  useEffect(() => {
    if (!conversation) return;

    const resolveHeader = async () => {
      const tipe = (conversation as any).tipe || (conversation as any).type;
      const isSellerChat = tipe === "CHAT_PENJUAL" || tipe === "SELLER_CHAT";

      if (isSellerChat) {
        const storeId = conversation.tokoId || (conversation as any).storeId;
        if (conversation.store?.nama) {
          setHeaderInfo({
            name: conversation.store.nama,
            icon: "seller",
            fotoUrl: conversation.store.fotoUrl || null,
          });
        } else if (storeId) {
          try {
            const storeRes = await storesApi.getById(storeId);
            const storeData = storeRes.data?.data || storeRes.data;
            if (storeData) {
              setHeaderInfo({
                name: storeData.nama,
                icon: "seller",
                fotoUrl: storeData.fotoUrl || null,
              });
            }
          } catch (err) {
            console.error("Failed to resolve store header", err);
            setHeaderInfo({ name: "Toko Agro", icon: "seller", fotoUrl: null });
          }
        } else {
          setHeaderInfo({ name: "Toko", icon: "seller", fotoUrl: null });
        }
      } else {
        const adminName = conversation.otherUser?.name || "Customer Service";
        setHeaderInfo({ name: adminName, icon: "cs", fotoUrl: null });
      }
    };

    resolveHeader();
  }, [conversation]);

  // Fetch conversation and messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getConversation(conversationId, {
        limit: 100,
      });
      const data = res.data?.data || res.data;
      if (data?.conversation || data?.tipe || data?.type) {
        setConversation(data.conversation || data);
      }

      const rawMessages = data?.pesan || data?.messages || [];
      const mapped = rawMessages.map(mapBackendMessage);
      const unique = mapped.filter(
        (m: any, i: number, arr: any[]) =>
          i === arr.findIndex((t) => t.id === m.id),
      );
      setMessages(unique);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [conversationId]);

  // Initialize chat
  useEffect(() => {
    const init = async () => {
      // Fetch authenticated profile
      try {
        const profileRes = await authApi.getProfile();
        const profile = profileRes.data?.data || profileRes.data;
        if (profile?.id || profile?.id_pengguna) {
          setResolvedUserId(profile.id || profile.id_pengguna);
        } else if (storeUserId) {
          setResolvedUserId(storeUserId);
        }
      } catch {
        if (storeUserId) setResolvedUserId(storeUserId);
      }

      await fetchMessages();

      const isValidOrderId =
        orderId && orderId !== "undefined" && orderId !== "null";

      // Resolve order context
      if (isValidOrderId) {
        try {
          const orderRes = await ordersApi.getById(orderId);
          const orderData = orderRes?.data?.data || orderRes?.data;
          if (orderData) {
            const oStoreName =
              orderData.item?.[0]?.produk?.toko?.nama ||
              orderData.item?.[0]?.storeName ||
              orderData.storeName ||
              "Toko Agro";
            const oStatus = orderStatusParam || orderData.status;
            const oShortId = orderData.id.slice(-8).toUpperCase();
            const firstItem = orderData.item?.[0];

            // Check if order card already sent
            const currentMessages = await chatApi.getConversation(
              conversationId,
              { limit: 100 },
            );
            const existingData =
              currentMessages.data?.data || currentMessages.data;
            const existingMsgs =
              existingData?.messages || existingData?.pesan || [];
            const alreadySent = existingMsgs.some((m: ApiChatMessage) => {
              const c = m.content || (m as any).isiPesan || "";
              return c.includes("---ORDER_META---") && c.includes(orderId);
            });

            // Auto-send order card (once)
            if (!alreadySent && !orderCardSent.current) {
              orderCardSent.current = true;
              const orderMeta: ApiChatOrderMeta = {
                orderId: orderData.id,
                shortId: oShortId,
                status: oStatus,
                storeName: oStoreName,
                totalHarga: Number(orderData.totalHarga || 0),
                itemCount: orderData.item?.length || 0,
                firstItemName:
                  firstItem?.produk?.nama?.replace(" - ", " ") || "Produk",
                firstItemImage: firstItem?.produk?.gambarUrl || null,
              };
              const cardMsg = `Halo, saya ingin menanyakan pesanan #${oShortId}\n---ORDER_META---\n${JSON.stringify(orderMeta)}`;
              await chatApi.sendMessage(conversationId, cardMsg);
              await fetchMessages();
              setOrderContext(null);
            }

            if (alreadySent) {
              setOrderContext(`Order #${oShortId}`);
            }
          }
        } catch (err: any) {
          console.error("Failed to fetch orderId context", err);
          if (orderRef) setOrderContext(decodeURIComponent(orderRef));
        }
      }

      if (!isValidOrderId && orderRef) {
        setOrderContext(decodeURIComponent(orderRef));
        if (!initialMessageSet.current) {
          setNewMessage(
            `Halo, saya ingin bertanya mengenai ${decodeURIComponent(orderRef)}. `,
          );
          initialMessageSet.current = true;
        }
      }

      // Resolve product context
      if (produkId) {
        try {
          const prodRes = await productsApi.getById(produkId);
          const productData = prodRes.data?.data || prodRes.data;
          setProductContext(productData);

          // Set initial message for product inquiry
          if (productData && !initialMessageSet.current) {
            setNewMessage(`Meminta info untuk produk ${productData.nama}. `);
            initialMessageSet.current = true;
          }
        } catch (err) {
          console.error("Failed to fetch product context", err);
        }
      }

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
        const msgObj = rawData.data || rawData;
        const newMessage = mapBackendMessage(msgObj.message || msgObj);

        setMessages((prev) => {
          if (newMessage.id && prev.some((m) => m.id === newMessage.id))
            return prev;

          if (String(newMessage.senderId) === String(resolvedUserId)) {
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

        const senderId = getMessageSenderId(newMessage);
        if (String(senderId) !== String(resolvedUserId)) {
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
  }, [
    conversationId,
    fetchMessages,
    produkId,
    orderId,
    orderStatusParam,
    orderRef,
    resolvedUserId,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const content_raw = newMessage.trim();
    if (!content_raw && !productContext && !orderMetaContext) return;
    if (sending) return;

    setNewMessage("");
    setSending(true);

    let content = content_raw;

    if (productContext) {
      const meta = {
        id: productContext.id,
        nama: productContext.nama,
        harga: productContext.harga,
        fotoUrl: productContext.fotoUrl || productContext.gambarUtama || null,
      };

      if (!content.includes(productContext.nama)) {
        content = `Meminta info untuk produk: ${productContext.nama}\n\n${content}`;
      }

      content =
        `${content}\n---PRODUCT_META---\n${JSON.stringify(meta)}`.trim();
      setProductContext(null);
    }

    if (orderMetaContext) {
      content =
        `${content}\n---ORDER_META---\n${JSON.stringify(orderMetaContext)}`.trim();
      setOrderMetaContext(null);
      setOrderContext(null);
    }

    // Optimistic update
    const optimisticMsg: ApiChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: resolvedUserId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await chatApi.sendMessage(conversationId, content);
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

  const handleFAQSelect = async (text: string) => {
    setNewMessage("");
    setSending(true);
    const optimistic: ApiChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: resolvedUserId,
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await chatApi.sendMessage(conversationId, text);
      setTimeout(() => fetchMessages(), 500);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  if (!_hasHydrated || loading) {
    return <ChatRoomSkeleton />;
  }

  const isSeller = headerInfo.icon === "seller";
  const hasUserSentMessage = messages.some((m) => {
    const content = (m.content || (m as any).isiPesan || "").trim();
    return (
      content !== "" && String(getMessageSenderId(m)) === String(resolvedUserId)
    );
  });

  const showWelcome = !isSeller;
  const showFAQButtons = !isSeller && !hasUserSentMessage;
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 z-50 lg:static lg:z-auto lg:h-full flex flex-col bg-slate-50">
      <ChatHeader
        name={headerInfo.name}
        icon={headerInfo.icon}
        fotoUrl={headerInfo.fotoUrl}
        onBack={() => router.back()}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {showWelcome && (
          <div className="flex flex-col items-start gap-3">
            <ChatWelcomeMessage />
            {showFAQButtons && (
              <ChatFAQButtons
                onSelectFAQ={handleFAQSelect}
                disabled={sending}
              />
            )}
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <ChatDateSeparator date={group.messages[0].createdAt} />
            <div className="space-y-2">
              {group.messages
                .filter(
                  (msg) =>
                    ((msg as any).isiPesan || msg.content || "").trim() !== "",
                )
                .map((msg) => {
                  const senderId = getMessageSenderId(msg);
                  const isMe =
                    resolvedUserId && senderId
                      ? String(senderId) === String(resolvedUserId)
                      : false;

                  const rawContent = (msg as any).isiPesan || msg.content || "";
                  const { actualContent, productMeta, orderMeta } =
                    parseMessageMetadata(rawContent);

                  return (
                    <ChatMessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={isMe}
                      productMeta={productMeta}
                      orderMeta={orderMeta}
                      content={actualContent}
                    />
                  );
                })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <ChatInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        sending={sending}
        disabled={
          (!newMessage.trim() && !productContext && !orderMetaContext) ||
          sending
        }
        inputRef={inputRef}
        productContext={productContext}
        onClearProductContext={() => setProductContext(null)}
      />
    </div>
  );
};

export default function ChatRoomPage() {
  return (
    <Suspense fallback={<ChatRoomSkeleton />}>
      <ChatRoomContent />
    </Suspense>
  );
}
