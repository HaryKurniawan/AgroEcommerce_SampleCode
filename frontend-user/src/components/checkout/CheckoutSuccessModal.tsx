import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  orderIdsParam: string;
}

const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  isOpen,
  orderIdsParam,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto p-6 animate-slide-up text-center overflow-hidden">
        {/* Illustration */}
        <div className="flex justify-center -mt-6 -mb-10">
          <Image
            src="/chkout-succes.svg"
            alt="Checkout Success"
            width={280}
            height={280}
            className="object-contain w-[280px] h-[280px]"
            priority
          />
        </div>

        <h3 className="font-display font-semibold text-xl text-slate-800 mb-2">
          Checkout Berhasil!
        </h3>
        <p className="text-[13px] text-slate-500 mb-8 px-2">
          Pesanan berhasil dibuat. Yuk, segera selesaikan pembayaran!
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.replace("/")}
            className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all active:scale-[0.98] text-[13px] sm:text-[14px]"
          >
            Lanjut Belanja
          </button>

          <button
            onClick={() => {
              if (orderIdsParam) {
                router.replace(`/pembayaran?orderIds=${orderIdsParam}`);
              } else {
                router.replace("/pesanan");
              }
            }}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] text-[13px] sm:text-[14px]"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessModal;
