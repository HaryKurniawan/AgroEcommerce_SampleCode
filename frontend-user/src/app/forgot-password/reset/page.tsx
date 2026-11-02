"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

import { authApi } from "@/lib/ecommerce-api";
import { resetPasswordSchema } from "@/src/lib/validations/schemas";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema as never),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ token, newPassword: data.password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error?.response?.data?.message ||
          "Token tidak valid atau sudah kadaluarsa.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 text-center">
        <p className="text-red-500 font-semibold px-6 py-4 bg-red-50 rounded-2xl border border-red-100 italic">
          Token tidak ditemukan. Pastikan link reset yang Anda buka valid.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center bg-white animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Password Berhasil Direset!
        </h1>
        <p className="text-gray-500 text-sm">Mengalihkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 py-6 max-w-lg mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 mb-6 flex items-center justify-center bg-green-50 rounded-full border border-green-100">
          <KeyRound size={36} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Buat Password Baru
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Masukkan password baru untuk akun Anda.
        </p>

        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
            >
              Password Baru
            </label>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              {...register("password")}
              placeholder="Min. 6 karakter"
              className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                errors.password ? "border-red-300" : "border-gray-200"
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500 ml-1 font-medium italic">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
            >
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type={showPass ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Ulangi password baru"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.confirmPassword ? "border-red-300" : "border-gray-200"
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-500 ml-1 font-medium italic">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs italic">
              {error}
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white font-bold py-3.5 rounded-xl hover:bg-green-800 disabled:opacity-70 flex items-center justify-center h-14 shadow-sm shadow-green-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetContent />
    </Suspense>
  );
}
