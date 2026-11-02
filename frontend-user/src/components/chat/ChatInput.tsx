import { Send, Loader2, X } from "lucide-react";
import Image from "next/image";

import { formatRupiah } from "@/lib/utils";
import type { ApiChatProductMeta } from "@/types";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  sending: boolean;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  productContext: ApiChatProductMeta | null;
  onClearProductContext: () => void;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  sending,
  disabled,
  inputRef,
  productContext,
  onClearProductContext,
}: ChatInputProps) {
  return (
    <div className="bg-white border-t border-gray-100 flex-shrink-0 flex flex-col">
      {/* Product Context Snippet */}
      {productContext && (
        <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex gap-3 relative animate-fade-in shadow-inner">
          <button
            onClick={onClearProductContext}
            className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm"
          >
            <X size={14} />
          </button>
          <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-primary-100 p-0.5">
            {productContext.fotoUrl || productContext.gambarUtama ? (
              <Image
                src={
                  (productContext.fotoUrl ||
                    productContext.gambarUtama) as string
                }
                alt={productContext.nama}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                📷
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-xs font-bold text-gray-800 truncate mb-0.5">
              {productContext.nama}
            </p>
            <p className="text-primary-600 text-[11px] font-bold">
              {formatRupiah(Number(productContext.harga))}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 sm:py-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ketik pesan..."
            className="w-full py-3 px-5 bg-gray-100 hover:bg-gray-50 focus:bg-gray-50 border border-transparent focus:border-primary-300 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all font-medium shadow-inner"
          />
        </div>
        <button
          onClick={onSend}
          disabled={disabled || sending}
          className="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-shrink-0"
        >
          {sending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className="ml-0.5 mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
