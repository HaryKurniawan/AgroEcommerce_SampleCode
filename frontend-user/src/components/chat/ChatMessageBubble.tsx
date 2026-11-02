import { Check, CheckCheck } from "lucide-react";

import type {
  ApiChatMessage,
  ApiChatProductMeta,
  ApiChatOrderMeta,
} from "@/types";

import ChatOrderCard from "./ChatOrderCard";
import ChatProductCard from "./ChatProductCard";

interface ChatMessageBubbleProps {
  message: ApiChatMessage;
  isMe: boolean;
  productMeta: ApiChatProductMeta | null;
  orderMeta: ApiChatOrderMeta | null;
  content: string;
}

export default function ChatMessageBubble({
  message,
  isMe,
  productMeta,
  orderMeta,
  content,
}: ChatMessageBubbleProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm relative group ${
          isMe
            ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
        }`}
      >
        {content && (
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        )}

        {/* Rich Order Meta Card */}
        {orderMeta && <ChatOrderCard orderMeta={orderMeta} isMe={isMe} />}

        {/* Rich Product Meta Card */}
        {productMeta && (
          <ChatProductCard productMeta={productMeta} isMe={isMe} />
        )}

        <div
          className={`flex items-center gap-1 mt-1 ${
            isMe
              ? "justify-end text-primary-100"
              : "justify-start text-gray-400"
          }`}
        >
          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
          {isMe &&
            (message.isRead ? (
              <CheckCheck size={14} className="text-white" />
            ) : (
              <Check size={14} className="text-primary-200" />
            ))}
        </div>
      </div>
    </div>
  );
}
