"use client";

import React from "react";
import { Clock } from "lucide-react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface PaymentCountdownProps {
  timeLeft: TimeLeft;
}

/**
 * Banner countdown pembayaran yang muncul saat status pesanan MENUNGGU_BAYAR.
 * Menampilkan jam, menit, dan detik tersisa.
 */
export default function PaymentCountdown({ timeLeft }: PaymentCountdownProps) {
  return (
    <div className="bg-amber-50 rounded-2xl p-5 flex items-center gap-4 border border-amber-200">
      <Clock size={24} className="text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-amber-700 font-medium mb-1">
          Batas Waktu Pembayaran
        </p>
        <div className="flex gap-1.5 items-center">
          {[
            { v: timeLeft.hours, l: "Jam" },
            { v: timeLeft.minutes, l: "Menit" },
            { v: timeLeft.seconds, l: "Detik" },
          ].map((t, i) => (
            <React.Fragment key={t.l}>
              <div className="flex flex-col items-center">
                <span className="font-display font-semibold text-lg text-amber-800 tabular-nums leading-none">
                  {String(t.v).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-amber-600 font-medium mt-0.5 uppercase tracking-wide">
                  {t.l}
                </span>
              </div>
              {i < 2 && (
                <span className="text-amber-400 font-medium self-start mt-0.5 text-lg leading-none">
                  :
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
