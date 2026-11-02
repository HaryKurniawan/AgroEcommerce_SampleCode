"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageCircle, Shield, Store, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { storesApi } from "@/lib/ecommerce-api";

export default function KurirChatPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [affiliatedTokoId, setAffiliatedTokoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_hasHydrated && user && user.role === "KURIR") {
      storesApi
        .getMyStore()
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data?.id) setAffiliatedTokoId(data.id);
        })
        .catch((err) => console.error("Failed to fetch affiliated toko", err))
        .finally(() => setLoading(false));
    }
  }, [user, _hasHydrated]);

  if (!_hasHydrated || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pb-28">
      {/* --- Header --- */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <h2 className="font-medium text-lg text-gray-800 tracking-tight text-left">
          Pusat Pesan
        </h2>
      </header>

      <div className="px-5 py-6 space-y-3">
        {/* Chat Option: Admin */}
        <button
          onClick={() => router.push("/kurir/chat/admin")}
          className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-emerald-300 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <Shield size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-800 text-sm tracking-wide">
              Admin Operasional
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Lapor masalah & bantuan umum
            </p>
          </div>
          <MessageCircle size={18} className="text-gray-300" />
        </button>

        {/* Chat Option: Seller */}
        <button
          disabled={loading || !affiliatedTokoId}
          onClick={() =>
            affiliatedTokoId &&
            router.push(`/kurir/chat/seller/${affiliatedTokoId}`)
          }
          className={`w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all active:scale-[0.98] group ${!affiliatedTokoId ? "opacity-60 grayscale" : "hover:border-emerald-300"}`}
        >
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Store size={24} strokeWidth={2} />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-800 text-sm tracking-wide">
              Seller / Toko
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {!loading && !affiliatedTokoId
                ? "Belum terhubung ke toko"
                : "Koordinasi pickup & stok"}
            </p>
          </div>
          <MessageCircle size={18} className="text-gray-300" />
        </button>
      </div>

      <div className="mt-8 px-10 text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
          Percakapan diawasi oleh sistem untuk kualitas layanan.
        </p>
      </div>
    </div>
  );
}
