import React, { useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sending: boolean;
  handleSend: (e?: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  sending,
  handleSend,
  handleKeyDown,
  inputRef,
}) => {
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      const targetHeight = Math.max(scrollHeight, 32);
      inputRef.current.style.height = `${targetHeight}px`;
    }
  }, [newMessage, inputRef]);

  return (
    <div className="bg-white p-3 sticky bottom-0 z-20 shrink-0 border-t border-gray-100">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(e);
        }}
        className="flex items-end gap-2 max-w-4xl mx-auto"
      >
        <div className="flex-1 bg-[#f0f2f5] rounded-2xl border border-transparent px-4 py-1.5 flex items-center min-h-[44px]">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            className="w-full bg-transparent border-0 py-1.5 text-sm focus:ring-0 resize-none outline-none overflow-y-auto transition-[height] duration-200 ease-in-out"
            rows={1}
            style={{ minHeight: "32px", height: "32px", maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors shadow-md active:scale-95"
        >
          {sending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className="ml-0.5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
