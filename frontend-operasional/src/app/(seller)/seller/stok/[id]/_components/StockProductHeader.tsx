"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockProductHeaderProps {
  productName?: string;
}

export function StockProductHeader({ productName }: StockProductHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-slate-100/80">
      <button
        onClick={() => router.push("/seller/stok")}
        className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-2xl transition-all shadow-sm shrink-0 active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Pengelolaan Stok</span>
          <span>/</span>
          <span className="text-slate-500">Detail & Penyesuaian</span>
        </div>
        <h1 className="text-lg md:text-xl font-medium tracking-tight text-slate-800">
          {productName?.replace(" - ", " ")}
        </h1>
      </div>
    </div>
  );
}
