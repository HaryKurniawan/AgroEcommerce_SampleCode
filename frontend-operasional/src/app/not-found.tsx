"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import NotFoundImg from "../../public/images/not_found.svg";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm mx-auto mb-3 relative aspect-square max-h-[250px] flex items-center justify-center">
        {/* We use standard img to avoid Next.js Image strict domain errors if SVG is simple, but Next Image is fine for local static. */}
        <Image
          src={NotFoundImg}
          alt="Halaman Tidak Ditemukan"
          width={250}
          height={250}
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-lg text-gray-800 mb-1 mt-3">
        Halaman tidak ditemukan
      </h1>

      <p className="text-gray-500 text-sm mb-12 max-w-xs mx-auto">
        Maaf, halaman yang Anda tuju tidak tersedia.
      </p>

      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-200"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
