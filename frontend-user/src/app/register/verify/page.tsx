"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";

import { authApi } from "@/lib/api/auth";

// ── Step indicator ─────────────────────────────────────────────────────────

const steps = [
  { label: "Daftar", done: true },
  { label: "Verifikasi Email", done: false, active: true },
  { label: "Masuk", done: false },
];

// ── Main Content ───────────────────────────────────────────────────────────

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "email Anda";

  const [devOpen, setDevOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (email && email !== "email Anda") {
      const savedEndTime = localStorage.getItem(`resendCooldown-${email}`);
      if (savedEndTime) {
        const remaining = Math.floor(
          (parseInt(savedEndTime, 10) - Date.now()) / 1000,
        );
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          localStorage.removeItem(`resendCooldown-${email}`);
        }
      }
    }
  }, [email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (resending || countdown > 0 || !email || email === "email Anda") return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
      setCountdown(120); // 120 detik cooldown
      localStorage.setItem(
        `resendCooldown-${email}`,
        (Date.now() + 120 * 1000).toString(),
      );
      setTimeout(() => setResent(false), 5000);
    } catch {
      alert("Gagal mengirim ulang email verifikasi. Coba lagi nanti.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-8">
          <Mail strokeWidth={1.5} size={42} className="text-primary-700" />
        </div>

        {/* Text */}
        <h1 className="text-2xl text-gray-900 text-center mb-4">
          Cek Email Anda
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8 px-4 leading-relaxed">
          Kami telah mengirimkan tautan verifikasi ke{" "}
          <span className="font-semibold text-primary-700 break-all">
            {email}
          </span>
          . Periksa folder Spam atau Promosi Anda jika tidak menemukannya.
        </p>

        {/* Actions */}
        <div className="space-y-4 w-full">
          <a
            href={`mailto:${email}`}
            className="w-full bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink strokeWidth={1.5} size={20} /> Buka Aplikasi Email
          </a>

          <button
            onClick={handleResend}
            disabled={resending || resent || countdown > 0}
            className="w-full bg-white text-gray-700 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {resending ? (
              <RefreshCw strokeWidth={1.5} size={20} className="animate-spin" />
            ) : resent ? (
              <CheckCircle strokeWidth={1.5} size={20} />
            ) : (
              <RefreshCw strokeWidth={1.5} size={20} />
            )}
            {resending
              ? "Mengirim..."
              : countdown > 0
                ? `Kirim Ulang (${countdown}s)`
                : resent
                  ? "Email Terkirim"
                  : "Kirim Ulang Email"}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-transparent text-gray-500 py-3 flex items-center justify-center gap-2 hover:text-gray-700 transition-colors mt-2"
          >
            <ArrowLeft strokeWidth={1.5} size={18} /> Kembali ke Login
          </button>
        </div>

        {/* ── Developer Options (Collapsible) ── */}
        <div className="mt-12 w-full">
          {devOpen && (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-5 mt-4 space-y-3 w-full">
              <p className="text-sm text-center text-gray-400 mb-4">
                ⚠️ Mode pengembangan — tidak tampil di produksi
              </p>
              <button
                onClick={() => router.push("/register/success")}
                className="w-full bg-blue-50 text-blue-600 py-3 flex items-center justify-center gap-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <CheckCircle strokeWidth={1.5} size={18} /> Simulasi: Email
                Sudah Diverifikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50" />}>
      <VerifyContent />
    </Suspense>
  );
}
