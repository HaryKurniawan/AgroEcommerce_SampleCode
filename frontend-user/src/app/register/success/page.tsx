"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const TOTAL_SECONDS = 10;

export default function RegisterSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  const progress = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * 100;

  // SVG ring config
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col items-center justify-center p-5">
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-emerald-700 text-sm">
              Agro Jabar Market
            </span>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl shadow-emerald-900/10 overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

          <div className="p-8 text-center">
            {/* Icon celebration */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer glow rings */}
                <div className="absolute inset-0 rounded-full bg-emerald-300 opacity-20 scale-[1.6] animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-emerald-200 opacity-30 scale-[1.3]" />
                {/* Main icon */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-300">
                  <CheckCircle2 size={44} className="text-white drop-shadow" />
                </div>
                {/* Sparkle decorations */}
                <Sparkles
                  size={18}
                  className="absolute -top-3 -right-3 text-yellow-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <Sparkles
                  size={13}
                  className="absolute -bottom-2 -left-3 text-emerald-400 animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Terverifikasi! 🎉
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
              Selamat! Email Anda telah berhasil diverifikasi. Akun Anda kini
              aktif dan siap digunakan.
            </p>

            {/* Countdown ring */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                  {/* Track */}
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="#d1fae5"
                    strokeWidth="6"
                  />
                  {/* Progress */}
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Countdown number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-emerald-700 leading-none">
                    {countdown}
                  </span>
                  <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider">
                    detik
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Otomatis ke halaman login
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-4 flex items-center justify-center gap-2.5 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] transition-all h-14 rounded-2xl shadow-xl shadow-emerald-300/50 text-sm"
            >
              Masuk ke Akun Sekarang <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Selamat bergabung di{" "}
          <span className="font-semibold text-emerald-600">
            Agro Jabar Market
          </span>{" "}
          🌱
        </p>
      </div>
    </div>
  );
}
