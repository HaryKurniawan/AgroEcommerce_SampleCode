import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatRupiah } from "@/lib/utils";
import type { ApiChatOrderMeta } from "@/types";

interface ChatOrderCardProps {
  orderMeta: ApiChatOrderMeta;
  isMe: boolean;
}

export default function ChatOrderCard({ orderMeta, isMe }: ChatOrderCardProps) {
  const router = useRouter();

  const getStatusBadgeClass = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "MENUNGGU_BAYAR":
        return "bg-amber-100 text-amber-700";
      case "DIPROSES":
        return "bg-blue-100 text-blue-700";
      case "DIKIRIM":
        return "bg-purple-100 text-purple-700";
      case "SELESAI":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "MENUNGGU_BAYAR":
        return "Menunggu Bayar";
      case "DIPROSES":
        return "Diproses";
      case "DIKIRIM":
        return "Dikirim";
      case "SELESAI":
        return "Selesai";
      default:
        return status;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/pesanan/${orderMeta.orderId}`);
      }}
      onClick={() => router.push(`/pesanan/${orderMeta.orderId}`)}
      className={`mt-2 p-3 rounded-xl border cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all ${
        isMe
          ? "bg-primary-700/40 border-primary-400/40"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex gap-2.5">
        {/* Product thumbnail */}
        <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-white shadow-sm border border-gray-100">
          {orderMeta.firstItemImage ? (
            <Image
              src={orderMeta.firstItemImage}
              alt={orderMeta.firstItemName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg bg-gray-100">
              📦
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[12px] font-bold truncate ${isMe ? "text-white" : "text-gray-800"}`}
          >
            {orderMeta.firstItemName}
            {orderMeta.itemCount > 1 && (
              <span
                className={`font-medium ${isMe ? "text-primary-200" : "text-gray-400"}`}
              >
                {" "}
                +{orderMeta.itemCount - 1} lainnya
              </span>
            )}
          </p>
          <p
            className={`text-[11px] font-semibold mt-0.5 ${isMe ? "text-primary-100" : "text-primary-600"}`}
          >
            {formatRupiah(Number(orderMeta.totalHarga))}
          </p>
        </div>
      </div>
      {/* Order info strip */}
      <div
        className={`mt-2 pt-2 flex items-center justify-between border-t ${
          isMe ? "border-primary-400/30" : "border-gray-200"
        }`}
      >
        <span
          className={`text-[10px] font-mono font-bold ${isMe ? "text-primary-200" : "text-gray-400"}`}
        >
          #{orderMeta.shortId}
        </span>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(orderMeta.status)}`}
        >
          {getStatusLabel(orderMeta.status)}
        </span>
      </div>
    </div>
  );
}
