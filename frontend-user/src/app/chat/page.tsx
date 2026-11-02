"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-gray-400">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
        <MessageCircle size={48} className="text-gray-300" />
      </div>
      <h2 className="font-display font-semibold text-lg text-gray-700">
        Pilih Percakapan
      </h2>
      <p className="text-sm mt-1">
        Pilih salah satu obrolan dari daftar untuk memulai chat
      </p>
    </div>
  );
}
