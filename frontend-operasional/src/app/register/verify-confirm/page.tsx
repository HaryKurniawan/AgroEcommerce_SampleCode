"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

import { authApi } from "@/lib/api/auth";

function VerifyConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Sedang memverifikasi email Anda...");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Token tidak ditemukan. Silakan periksa kembali tautan verifikasi Anda.",
      );
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(res.data?.message || "Email berhasil diverifikasi!");
      } catch (err: any) {
        const errMsg =
          err?.response?.data?.message || "Gagal memverifikasi email";
        setStatus("error");
        setMessage(errMsg);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center space-y-6">
      {status === "loading" && (
        <>
          <Loader2
            size={48}
            className="animate-spin text-emerald-500 mx-auto"
          />
          <h2 className="text-xl font-bold text-gray-900">
            Verifikasi Berjalan
          </h2>
          <p className="text-sm text-gray-500">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Verifikasi Sukses!
          </h2>
          <p className="text-sm text-gray-500">{message}</p>
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <LogIn size={18} />
            Lanjut ke Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Verifikasi Gagal
          </h2>
          <p className="text-sm text-gray-500">{message}</p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
          >
            Kembali ke Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Loader2
            size={48}
            className="animate-spin text-emerald-500 mx-auto"
          />
        }
      >
        <VerifyConfirmContent />
      </Suspense>
    </div>
  );
}
