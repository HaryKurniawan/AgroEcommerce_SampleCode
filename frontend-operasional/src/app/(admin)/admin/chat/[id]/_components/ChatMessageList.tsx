import React from "react";
import { Loader2, Check, CheckCheck } from "lucide-react";

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
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  messagesEndRef,
}) => {
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
    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4 bg-gray-100">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex justify-center mb-4 mt-2">
            <span className="bg-gray-200/60 text-gray-600 px-3 py-1 rounded-full text-[11px] font-medium">
              {formatDateSeparator(group.messages[0].createdAt)}
            </span>
          </div>
          <div className="space-y-2">
            {group.messages.map((msg) => {
              const isMe = String(msg.senderId) === String(currentUserId);
              return (
                <div
                  key={msg.id || `msg-${msg.createdAt}`}
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
                      className={`flex items-center gap-1 mt-1 ${
                        isMe
                          ? "justify-end text-primary-100"
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
                            className="animate-spin text-primary-100"
                          />
                        ) : msg.isRead ? (
                          <CheckCheck size={14} className="text-white" />
                        ) : (
                          <Check size={14} className="text-primary-200" />
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
