"use client";

import Image from "next/image";

export default function SellerChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 h-full p-6 text-center select-none">
      <Image
        src="/images/chat.svg"
        alt="Pilih percakapan"
        width={330}
        height={330}
        className="-mt-10 mb-8 opacity-95 mix-blend-multiply"
        priority
      />
      <h2 className="text-[17px] font-medium text-gray-700 mb-1">
        Belum ada percakapan dipilih
      </h2>
      <p className="text-[13px] text-gray-400 max-w-md leading-relaxed font-normal">
        Pilih percakapan di sebelah kiri untuk mulai membalas pesan pelanggan.
      </p>
    </div>
  );
}
