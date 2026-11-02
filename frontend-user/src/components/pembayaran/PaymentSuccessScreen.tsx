import React from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { formatRupiah } from "@/lib/ecommerce-api";

interface PaymentSuccessScreenProps {
  orderId: string;
  total: number;
  metode: { label: string; icon: string };
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  orderId,
  total,
  metode,
}) => {
  const router = useRouter();

  return (
    <div className="animate-fade-in min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      {/* Illustration */}
      <div className="relative mb-2">
        <Image
          src="/berhasil-bayar.svg"
          alt="Payment Success"
          width={250}
          height={250}
          className="object-contain w-[250px] h-[250px]"
          priority
        />
      </div>

      <h1 className="font-display font-semibold text-2xl text-gray-900 mb-1">
        Pembayaran Berhasil!
      </h1>
      <p className="text-sm text-gray-500 text-center mb-2">
        Pesanan kamu sedang diproses oleh penjual
      </p>

      <div className="mb-16" />

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.replace("/pesanan")}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingBag size={18} /> Lihat Pesanan Saya
        </button>
        <button
          onClick={() => router.replace("/")}
          className="w-full py-3 bg-white border border-primary-600 hover:bg-primary-50 text-primary-600 rounded-2xl font-semibold text-sm transition-all"
        >
          Lanjut Belanja
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessScreen;
