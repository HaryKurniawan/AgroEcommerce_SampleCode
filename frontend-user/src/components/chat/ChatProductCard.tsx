import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatRupiah } from "@/lib/utils";
import type { ApiChatProductMeta } from "@/types";

interface ChatProductCardProps {
  productMeta: ApiChatProductMeta;
  isMe: boolean;
}

export default function ChatProductCard({
  productMeta,
  isMe,
}: ChatProductCardProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/produk/${productMeta.id}`);
      }}
      onClick={() => router.push(`/produk/${productMeta.id}`)}
      className={`mt-2 p-2 rounded-xl flex gap-3 border items-center shadow-sm cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all ${
        isMe
          ? "bg-primary-700/50 border-primary-500/50"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="w-11 h-11 bg-white rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
        {productMeta.fotoUrl ? (
          <Image
            src={productMeta.fotoUrl}
            alt={productMeta.nama}
            width={44}
            height={44}
            className="w-full h-full object-cover"
            unoptimized
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
            isMe ? "text-primary-100" : "text-primary-600"
          }`}
        >
          {formatRupiah(Number(productMeta.harga))}
        </p>
      </div>
    </div>
  );
}
