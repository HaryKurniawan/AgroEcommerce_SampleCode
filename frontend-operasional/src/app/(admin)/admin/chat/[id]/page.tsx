"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

import { chatApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import ChatHeader from "@/components/ecommerce/chat/ChatHeader";
import ChatMessageList from "@/components/ecommerce/chat/ChatMessageList";
import ChatInput from "@/components/ecommerce/chat/ChatInput";

interface MessageData {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConvDetail {
  id: string;
  type: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    phone: string | null;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getConversation(conversationId, {
        limit: 100,
      });
      const data = res.data?.data || res.data;

      if (data?.id) {
        // Map the backend structure to the frontend structure
        setConversation({
          id: data.id,
          type: data.tipe,
          otherUser: data.otherUser || null,
        });
      }

      if (data?.pesan) {
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

        // Ensure uniqueness
        const unique = mapped.filter(
          (msg: any, index: number, self: any[]) =>
            index === self.findIndex((t) => t.id === msg.id),
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
            index === self.findIndex((t) => t.id === msg.id),
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

        // Skip if no real message content or sender
        if (!msgObj.id && !msgObj.pengirimId && !msgObj.senderId) return;

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

        // Skip if still no content or sender after mapping
        if (!newMessage.content && !newMessage.senderId) return;

        setMessages((prev) => {
          // If this message ID already exists, don't add it
          if (newMessage.id && prev.some((m) => m.id === newMessage.id))
            return prev;

          // If it's our own message, try to replace the optimistic/temp one
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

  // Load draft from localStorage when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    const draft = localStorage.getItem(`chat_draft_${conversationId}`);
    if (draft) setNewMessage(draft);
    else setNewMessage("");
  }, [conversationId]);

  const handleMessageChange = (val: string) => {
    setNewMessage(val);
    if (val.trim()) {
      localStorage.setItem(`chat_draft_${conversationId}`, val);
    } else {
      localStorage.removeItem(`chat_draft_${conversationId}`);
    }
    window.dispatchEvent(new Event("chat_draft_changed"));
  };

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    setNewMessage("");
    localStorage.removeItem(`chat_draft_${conversationId}`);
    window.dispatchEvent(new Event("chat_draft_changed"));

    const optimisticMsg: MessageData = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      await chatApi.sendMessage(conversationId, content);
      // SSE will handle real-time update, but we fetch as a safety net
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 min-h-0">
      <ChatHeader
        title={
          conversation?.otherUser?.name ||
          conversation?.otherUser?.email ||
          "Customer"
        }
        subtitle={conversation?.otherUser?.role
          ?.toLowerCase()
          .replace("_", " ")}
        chatType="ADMIN_CS"
        phone={conversation?.otherUser?.phone}
        email={conversation?.otherUser?.email}
      />
      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput
        newMessage={newMessage}
        setNewMessage={handleMessageChange}
        sending={sending}
        handleSend={handleSend}
        handleKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        inputRef={inputRef}
      />
    </div>
  );
};

export default AdminChatRoomPage;
