"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/src/store/auth-store";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  isVerifiedB2B?: boolean;
}

interface VerifyResponse {
  data: {
    accessToken?: string;
    user?: AuthUser;
    message?: string;
  };
}

function VerifyConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token ? "error" : "loading",
  );
  const [message, setMessage] = useState<string>(
    !token ? "Token tidak ditemukan." : "",
  );

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then((res: VerifyResponse) => {
        const data = res.data;
        if (data.accessToken) {
          setAuth({
            id: data.user?.id || "",
            email: data.user?.email || "",
            name: data.user?.name,
            role: data.user?.role || "CUSTOMER",
            isVerifiedB2B: data.user?.isVerifiedB2B,
          });
        }
        setStatus("success");
        setMessage(data.message || "Email berhasil diverifikasi!");
        setTimeout(() => router.push("/"), 2000);
      })
      .catch((err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Token tidak valid atau sudah kadaluarsa.",
        );
      });
  }, [token, router, setAuth]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-5 overflow-hidden">
      {/* ── Decorative Background ── */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-10 bg-gradient-to-b from-white via-emerald-50/30 to-white">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-emerald-900/5 text-center relative z-10">
        {status === "loading" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin opacity-50" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Memverifikasi Akun
            </h1>
            <p className="text-gray-500">
              Mohon tunggu sebentar, kami sedang memproses token Anda...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <CheckCircle className="w-12 h-12 text-emerald-600 relative z-10" />
              <div className="absolute inset-0 bg-emerald-300 opacity-20 animate-ping" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Berhasil!
            </h1>
            <p className="text-emerald-700 font-medium mb-1">{message}</p>
            <div className="mt-8 flex flex-col items-center gap-3 w-full">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <p className="text-gray-400 text-sm">Mengarahkan ke beranda...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100 shadow-sm">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Gagal
            </h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <button
              onClick={() => router.push("/register")}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
            >
              Kembali ke Pendaftaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyConfirmContent />
    </Suspense>
  );
}
