import React from "react";
import Image from "next/image";
import { Wallet, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { PAYMENT_METHODS, type PaymentMethod } from "./payment-methods";

interface PaymentMethodSectionProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  selectedMethod,
}) => {
  const router = useRouter();
  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const handleClick = () => {
    const currentUrl = window.location.pathname + window.location.search;
    router.push(
      `/checkout/pembayaran?redirect=${encodeURIComponent(currentUrl)}`,
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2 px-1">
        Metode Pembayaran
      </h2>

      <div
        onClick={handleClick}
        className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:border-primary-400 transition-all flex items-center justify-between group"
      >
        {method ? (
          <div className="flex items-center gap-4">
            {method.logo ? (
              <div className="w-14 h-8 flex items-center justify-center px-2">
                <Image
                  src={method.logo}
                  alt={method.label}
                  width={48}
                  height={32}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className={`w-14 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${method.bgColor}`}
              >
                <span className="text-white font-black text-[10px] tracking-tight leading-tight text-center">
                  {method.badge}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {method.label}
              </p>
              <p className="text-xs text-gray-500">{method.sublabel}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm font-semibold text-gray-700 py-2 pl-1">
            Pilih Metode Pembayaran
          </div>
        )}
        <div className="flex items-center gap-1 text-primary-600 text-sm font-medium">
          Ubah
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSection;
