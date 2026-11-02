import React from "react";
import Image from "next/image";
import { Loader2, Check, CheckCheck, Store, Shield } from "lucide-react";

interface MessageData {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatMessageListProps {
  messages: MessageData[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

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
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  messagesEndRef,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 relative z-10 bg-gray-50 flex flex-col items-center justify-center text-center px-6 select-none">
        <Image
          src="/images/chat.svg"
          alt="Belum ada pesan"
          width={200}
          height={200}
          className="mb-5 opacity-90 mix-blend-multiply"
        />
        <p className="text-[15px] font-medium text-gray-600 mb-1">
          Belum Ada Pesan
        </p>
        <p className="text-[12px] text-gray-400 font-normal leading-relaxed max-w-[200px]">
          Mulai percakapan dengan mengirim pesan pertama.
        </p>
      </div>
    );
  }

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

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4 bg-gray-50 relative z-10">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex justify-center mb-4 mt-2">
            <span className="bg-[#e2e8f0] text-[10px] font-bold text-gray-600 px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
              {formatDateSeparator(group.messages[0].createdAt)}
            </span>
          </div>
          <div className="space-y-2">
            {group.messages.map((msg) => {
              const isMe = String(msg.senderId) === String(currentUserId);

              let actualContent = msg.content || "";
              let productMeta: any = null;
              let orderMeta: any = null;

              // Parse PRODUCT_META
              const metaIndex = actualContent.indexOf("---PRODUCT_META---");
              if (metaIndex !== -1) {
                try {
                  const jsonStr = actualContent
                    .substring(metaIndex + "---PRODUCT_META---".length)
                    .trim();
                  productMeta = JSON.parse(jsonStr);
                  actualContent = actualContent.substring(0, metaIndex).trim();
                } catch {
                  // ignore JSON parse errors — content stays as-is
                }
              }

              // Parse ORDER_META
              const orderMetaIndex = actualContent.indexOf("---ORDER_META---");
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
                  // ignore JSON parse errors — content stays as-is
                }
              }

              return (
                <div
                  key={msg.id || `msg-${msg.createdAt}`}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 shadow-sm relative group ${
                      isMe
                        ? "bg-primary-100 text-primary-900 rounded-lg rounded-tr-none border border-primary-200"
                        : "bg-white text-gray-800 rounded-lg rounded-tl-none border border-gray-100"
                    }`}
                  >
                    {/* Tail for bubbles */}
                    <div
                      className={`absolute top-0 w-2 h-2 ${isMe ? "-right-2 bg-primary-100 [clip-path:polygon(0%_0%,0%_100%,100%_0%)]" : "-left-2 bg-white [clip-path:polygon(100%_0%,100%_100%,0%_0%)]"}`}
                    />

                    {actualContent && (
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words pr-12 pb-1">
                        {actualContent}
                      </p>
                    )}

                    {/* Product Meta Card */}
                    {productMeta && (
                      <div
                        className={`mt-2 mb-3 p-2 rounded-xl flex gap-3 border items-center shadow-sm ${isMe ? "bg-primary-200/50 border-primary-300/50" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
                          {productMeta.fotoUrl ? (
                            <img
                              src={productMeta.fotoUrl}
                              alt={productMeta.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-[12px] font-bold text-gray-800 truncate leading-tight">
                            {productMeta.nama}
                          </p>
                          <p className="text-[11px] font-bold text-primary-600 mt-0.5">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(productMeta.harga)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Meta Card */}
                    {orderMeta && (
                      <div
                        className={`mt-2 mb-3 p-2 rounded-xl border shadow-sm ${isMe ? "bg-primary-200/50 border-primary-300/50" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="flex gap-2.5 items-center">
                          <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                            {orderMeta.firstItemImage ? (
                              <img
                                src={orderMeta.firstItemImage}
                                alt={orderMeta.firstItemName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Shield size={18} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-800 truncate">
                              {orderMeta.firstItemName}
                            </p>
                            <p className="text-[10px] font-bold text-primary-600 mt-0.5">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                              }).format(orderMeta.totalHarga)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 flex items-center justify-between border-t border-gray-200/50">
                          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                            #
                            {orderMeta.shortId ||
                              orderMeta.orderId?.substring(0, 8)}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 uppercase tracking-tighter">
                            {orderMeta.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-1 right-2 flex items-center gap-1">
                      <span className="text-[9px] text-gray-500 opacity-80">
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMe &&
                        (msg.id.startsWith("temp-") ? (
                          <Loader2
                            size={12}
                            className="animate-spin text-primary-500"
                          />
                        ) : msg.isRead ? (
                          <CheckCheck size={14} className="text-blue-500" />
                        ) : (
                          <Check size={14} className="text-gray-400" />
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
  );
};

export default ChatMessageList;
