"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Headphones, Loader2 } from "lucide-react";

import { authApi, chatApi } from "@/lib/ecommerce-api";

interface LocalMessage {
  id: string;
  senderId: "BOT" | "ME";
  content: string;
  createdAt: string;
}

export default function GuestChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<LocalMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const cached = localStorage.getItem("guest_bot_chat_history");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem("guest_bot_chat_history");
      }
    }
    return [
      {
        id: "bot-1",
        senderId: "BOT",
        content:
          "Hai! 👋 Selamat datang di Layanan Bantuan Agro Jabar.\n\nAda yang bisa saya bantu hari ini?",
        createdAt: new Date().toISOString(),
      },
    ];
  });
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("guest_bot_chat_history", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (senderId: "BOT" | "ME", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${senderId.toLowerCase()}-${Date.now()}`,
        senderId,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (text: string = newMessage) => {
    const rawContent = text.trim();
    if (!rawContent || escalating) return;

    if (text === newMessage) setNewMessage("");
    addMessage("ME", rawContent);

    // Bot Response Logic
    setIsTyping(true);
    setTimeout(() => {
      let botReply = "";
      const lowerReq = rawContent.toLowerCase();

      if (lowerReq.includes("buat akun") || lowerReq.includes("daftar")) {
        botReply =
          "Untuk membuat akun, Anda dapat menuju halaman Register. Klik link berikut:\n/register\n\nIsi form yang tersedia dengan data diri Anda. Mudah kok!";
      } else if (lowerReq.includes("lupa") || lowerReq.includes("password")) {
        botReply =
          "Jika Anda lupa password, silakan gunakan fitur Lupa Password di halaman Login, lalu ikuti petunjuk yang dikirimkan ke email Anda.";
      } else if (
        lowerReq.includes("cs") ||
        lowerReq.includes("agent") ||
        lowerReq.includes("bantuan langsung")
      ) {
        botReply =
          "Baik, saya akan menghubungkan Anda dengan agen Customer Service kami. Mohon tunggu sebentar...";
        setIsTyping(false);
        addMessage("BOT", botReply);
        escalateToCS();
        return;
      } else {
        botReply =
          'Maaf, saya belum mengerti maksud Anda. Anda dapat memilih salah satu topik di bawah, atau ketik "Hubungkan ke CS" untuk bantuan langsung.';
      }

      setIsTyping(false);
      addMessage("BOT", botReply);
    }, 1000);
  };

  const escalateToCS = async () => {
    setEscalating(true);
    try {
      // 1. Create Guest Session
      const authRes = await authApi.createGuestSession();
      const guestToken =
        authRes.data?.data?.guestToken || authRes.data?.guestToken;

      if (!guestToken) throw new Error("Failed to get guest token");
      localStorage.setItem("guest_token", guestToken);

      // 2. Create Conversation
      // Token is automatically injected by apiClient interceptor if authStore user is null
      const convRes = await chatApi.createConversation({ type: "ADMIN_CS" });
      const conv = convRes.data?.data || convRes.data;

      if (!conv?.id) throw new Error("Failed to create conversation");

      // 3. Send initial context message
      const contextMsg =
        "[Sistem] Pengguna Tamu (Guest) membutuhkan bantuan CS.\n\nRiwayat bot:\n" +
        messages
          .filter((m) => m.senderId === "ME")
          .map((m) => `- ${m.content}`)
          .join("\n");

      await chatApi.sendMessage(conv.id, contextMsg);

      // 4. Redirect to real chat room
      // Clear bot local history to start fresh next time
      localStorage.removeItem("guest_bot_chat_history");
      router.push(`/chat/${conv.id}`);
    } catch (error) {
      console.error("Escalation failed", error);
      alert(
        "Maaf, gagal menghubungi server CS saat ini. Silakan coba lagi nanti.",
      );
      setEscalating(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-20 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Headphones size={22} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-800 text-[15px] truncate">
            Bot Bantuan Agro
          </h1>
          <p className="text-primary-500 text-[12px] font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-500 relative flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            Online (Bot)
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        <div className="flex justify-center mb-4 mt-2">
          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[11px] font-medium border border-primary-200">
            Koneksi Terenkripsi (Guest)
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === "ME";
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm relative group ${
                  isMe
                    ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div
                  className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end text-primary-200" : "justify-start text-gray-400"}`}
                >
                  <span className="text-[10px]">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Suggestion Chips */}
      {!escalating && (
        <div className="bg-white px-4 py-2 border-t border-gray-100 overflow-x-auto flex gap-2 no-scrollbar">
          {["Cara buat akun", "Cara Lupa Password", "Hubungkan ke CS"].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold whitespace-nowrap hover:bg-primary-100 active:scale-95 transition-all"
              >
                {chip}
              </button>
            ),
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white px-4 py-3 sm:py-4 flex items-center gap-3 border-t border-gray-100">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            disabled={escalating}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              escalating ? "Menghubungkan ke CS..." : "Ketik pesan..."
            }
            className="w-full py-3 px-5 bg-gray-100 hover:bg-gray-50 focus:bg-gray-50 border border-transparent focus:border-primary-300 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none disabled:opacity-50 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!newMessage.trim() || escalating}
          className="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-50 active:scale-95 transition-all flex-shrink-0"
        >
          {escalating ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className="ml-0.5 mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
