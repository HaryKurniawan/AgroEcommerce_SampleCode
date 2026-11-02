import React from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sending: boolean;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  sending,
  handleSend,
  handleKeyDown,
  inputRef,
}) => {
  return (
    <div className="bg-white px-4 py-3 sm:py-4 flex items-center gap-3 border-t border-gray-100 flex-shrink-0">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik balasan..."
          className="w-full py-3 px-5 bg-gray-100 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-primary-300 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all font-medium"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!newMessage.trim() || sending}
        className="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-shrink-0"
      >
        {sending ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Send size={20} className="ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default ChatInput;
