"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { authApi } from "@/lib/api/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await authApi.forgotPassword(data.email);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

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

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-xs text-gray-400">
            Masukkan email terdaftar Anda untuk menerima link reset password.
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
                Email Berhasil Dikirim
              </h3>
              <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                Kami telah mengirimkan instruksi beserta link untuk mereset
                password ke kotak masuk email Anda. Silakan periksa folder inbox
                atau spam.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="eg. johnfrans@gmail.com"
                className={`w-full px-5 py-3 rounded-full border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.email
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-emerald-500"
                }`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium px-2">
                  {errors.email.message}
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
                    : "Gagal mengirim email reset password. Periksa kembali email Anda.";
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
                  <span>Mengirim link...</span>
                </>
              ) : (
                "Kirim Link Reset"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
