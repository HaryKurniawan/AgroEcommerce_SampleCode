"use client";

import { useRouter } from "next/navigation";
import { Settings, Construction, ArrowLeft, Home } from "lucide-react";

interface InDevelopmentProps {
  title?: string;
  description?: string;
  backPath?: string;
}

export default function InDevelopment({
  title = "Fitur Sedang Dikembangkan",
  description = "Maaf, halaman ini masih dalam tahap pengembangan oleh tim kami. Nantikan pembaruan selanjutnya!",
  backPath,
}: InDevelopmentProps) {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
          <Construction size={64} className="text-emerald-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 animate-bounce">
          <Settings
            size={24}
            className="text-amber-500 animate-[spin_8s_linear_infinite]"
          />
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
        {title}
      </h1>

      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
        <button
          onClick={() => (backPath ? router.push(backPath) : router.back())}
          className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
        >
          <Home size={18} /> Beranda
        </button>
      </div>
    </div>
  );
}
