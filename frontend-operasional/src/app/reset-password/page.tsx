"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { authApi } from "@/lib/api/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      if (!token) {
        throw new Error(
          "Token reset tidak valid atau kedaluwarsa. Silakan minta link baru.",
        );
      }
      const response = await authApi.resetPassword({
        token,
        newPassword: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900">
            Token Reset Tidak Ditemukan
          </h3>
          <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Link reset password ini tidak valid. Silakan klik tombol di bawah
            untuk meminta link baru.
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-block py-2.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/10"
            >
              Minta Link Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-gray-400">
          Buat password baru yang aman untuk akun Anda.
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-4 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">
              Password Berhasil Diperbarui
            </h3>
            <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
              Password Anda telah berhasil diubah. Halaman akan otomatis
              dialihkan ke form login dalam beberapa saat...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Baru */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700"
            >
              Password Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                className={`w-full px-5 py-3 pr-12 rounded-full border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.password
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-emerald-500"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium px-2">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-700"
            >
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru"
                className={`w-full px-5 py-3 pr-12 rounded-full border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-emerald-500"
                }`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium px-2">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
              {(() => {
                const axiosError = mutation.error as {
                  response?: { data?: { message?: string } };
                };
                if (axiosError?.response?.data?.message) {
                  return axiosError.response.data.message;
                }
                return mutation.error instanceof Error
                  ? mutation.error.message
                  : "Gagal mengatur ulang password. Silakan coba lagi.";
              })()}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses password...</span>
              </>
            ) : (
              "Perbarui Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Login
        </Link>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-gray-400">Memuat halaman reset...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
