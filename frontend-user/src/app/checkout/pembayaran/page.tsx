"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Wallet } from "lucide-react";

import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/src/components/checkout/payment-methods";

const PaymentLogo: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  if (method.logo) {
    return (
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
    );
  }
  return (
    <div
      className={`w-14 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${method.bgColor}`}
    >
      <span className="text-white font-black text-[10px] tracking-tight leading-tight text-center">
        {method.badge}
      </span>
    </div>
  );
};

function PembayaranPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/checkout";

  const categories = Array.from(
    new Set(PAYMENT_METHODS.map((m) => m.sublabel)),
  );

  const handleSelect = (methodId: string) => {
    const [path, query] = redirectUrl.split("?");
    const params = new URLSearchParams(query || "");
    params.set("paymentMethod", methodId);
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 lg:top-16 z-40">
        <div className="relative flex items-center justify-center max-w-2xl mx-auto">
          <button
            onClick={() => router.push(redirectUrl)}
            className="absolute left-0 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-display font-semibold text-[17px] text-gray-900 py-1">
            Pilih Pembayaran
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
              {category}
            </p>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {PAYMENT_METHODS.filter((m) => m.sublabel === category).map(
                (method, idx, arr) => (
                  <div
                    key={method.id}
                    onClick={() => handleSelect(method.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      idx !== arr.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <PaymentLogo method={method} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {method.sublabel}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PembayaranPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PembayaranPageContent />
    </Suspense>
  );
}
