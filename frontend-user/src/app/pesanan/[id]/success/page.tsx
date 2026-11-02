"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Star, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Confetti or background shapes (optional subtle decoration) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mb-8 animate-in zoom-in duration-500 delay-150">
          <Image
            src="/pesanan diterima.svg"
            alt="Pesanan Diterima"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Text */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h1 className="font-medium text-xl text-gray-800 mb-3">
            Hore! Pesanan Selesai
          </h1>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-[280px] mx-auto mb-10">
            Terima kasih telah mengonfirmasi penerimaan pesanan. Dana Anda akan
            segera diteruskan ke penjual.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500 px-4">
          <button
            onClick={() => router.push(`/pesanan/${id}/rating`)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[13px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Star size={15} className="fill-white" />
            Beri Ulasan Sekarang
          </button>
          <button
            onClick={() => router.push("/katalog")}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium text-[13px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            Belanja Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
