"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { register as registerApi } from "@/lib/auth";
import { UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { TextInput, PasswordInput } from "@/components/form";
import Button from "@/components/ui/Button";

import AlertMessage from "./AlertMessage";
import GoogleLoginButton from "./GoogleLoginButton";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
    isB2B: z.boolean().optional(),
    namaPerusahaan: z.string().optional(),
    npwpPerusahaan: z.string().optional(),
    nibPerusahaan: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.isB2B) {
        return !!data.namaPerusahaan && data.namaPerusahaan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Nama Perusahaan wajib diisi jika mendaftar sebagai B2B",
      path: ["namaPerusahaan"],
    },
  )
  .refine(
    (data) => {
      if (data.isB2B) {
        return !!data.npwpPerusahaan && data.npwpPerusahaan.trim().length > 0;
      }
      return true;
    },
    {
      message: "NPWP Perusahaan wajib diisi jika mendaftar sebagai B2B",
      path: ["npwpPerusahaan"],
    },
  )
  .refine(
    (data) => {
      if (data.isB2B) {
        return !!data.nibPerusahaan && data.nibPerusahaan.length === 13;
      }
      return true;
    },
    {
      message: "NIB harus 13 digit",
      path: ["nibPerusahaan"],
    },
  );

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * RegisterForm Component
 * Form register reusable dengan validasi dan error handling
 *
 * @example
 * ```tsx
 * <RegisterForm />
 * ```
 */
export default function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalEmail, setSuccessModalEmail] = useState<string | null>(
    null,
  );
  const [emailExistsModalOpen, setEmailExistsModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isB2B: false,
    },
  });

  const isB2BSelected = watch("isB2B");

  const mutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.KONSUMEN,
        ...(data.isB2B && {
          namaPerusahaan: data.namaPerusahaan,
          npwpPerusahaan: data.npwpPerusahaan,
          nibPerusahaan: data.nibPerusahaan,
        }),
      }),
    onSuccess: async (data, variables) => {
      // Clear auth session untuk simulasi email verification
      try {
        await fetch("/api/proxy/auth/logout", { method: "POST" });
        useAuthStore.getState().clearAuth();
      } catch (e) {
        console.error("Failed to clear auth session", e);
      }

      setSuccessModalEmail(variables.email);
    },
    onError: (error: unknown, variables) => {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      let msg = axiosError?.response?.data?.message;
      if (Array.isArray(msg)) {
        msg = msg[0]; // Ambil pesan pertama jika berupa array
      }
      if (
        axiosError?.response?.status === 409 ||
        msg === "Email already registered" ||
        msg?.toLowerCase().includes("sudah terdaftar")
      ) {
        setRegisteredEmail(variables.email);
        setEmailExistsModalOpen(true);
      } else if (msg) {
        setErrorMessage(msg);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registrasi gagal. Silakan coba lagi.");
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setErrorMessage(null);
    mutation.mutate(data);
  };

  const blockNumbers = (e: React.KeyboardEvent) => {
    if (/[0-9]/.test(e.key)) e.preventDefault();
  };

  const blockNonNumbers = (e: React.KeyboardEvent) => {
    if (
      !/[0-9+]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Delete"
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      {emailExistsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl px-5 py-8 w-full max-w-xs shadow-xl relative">
            <button
              onClick={() => setEmailExistsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-4 mt-2">
              Email Sudah Terdaftar
            </h3>

            <p className="text-sm text-gray-600 mb-8 leading-relaxed text-center">
              Silakan masuk ke akun Anda atau atur ulang kata sandi jika lupa.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20"
                onClick={() => router.push("/login")}
              >
                Masuk ke Akun
              </button>
              <button
                type="button"
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                onClick={() => router.push("/forgot-password")}
              >
                Lupa Kata Sandi?
              </button>
            </div>
          </div>
        </div>
      )}

      {successModalEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pendaftaran Berhasil!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Silakan cek email Anda (termasuk folder spam) di{" "}
              <span className="font-semibold">{successModalEmail}</span> untuk
              mengaktifkan akun.
            </p>
            <Button
              variant="primary"
              fullWidth
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setSuccessModalEmail(null);
                router.push(
                  `/register/verify?email=${encodeURIComponent(successModalEmail)}`,
                );
              }}
            >
              Lanjut
            </Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <AlertMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
          >
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            placeholder="Contoh: John Doe"
            onKeyDown={blockNumbers}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? "border-red-300" : "border-gray-200"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-500 ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Contoh: user@email.com"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email ? "border-red-300" : "border-gray-200"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500 ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          showStrength
          {...register("password")}
        />

        {/* Confirm Password Input */}
        <PasswordInput
          label="Konfirmasi Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* B2B Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              {...register("isB2B")}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                Daftar sebagai Pembeli Perusahaan (B2B)
              </span>
              <span className="text-xs text-gray-500">
                Dapatkan akses ke harga grosir khusus perusahaan
              </span>
            </div>
          </label>
        </div>

        {/* B2B Fields */}
        {isB2BSelected && (
          <div className="space-y-4 p-4 bg-green-50/50 rounded-xl border border-green-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: PT Agro Jabar Maju"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.namaPerusahaan ? "border-red-300" : "border-gray-200"
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
                {...register("namaPerusahaan")}
              />
              {errors.namaPerusahaan && (
                <p className="mt-1.5 text-sm text-red-500 ml-1">
                  {errors.namaPerusahaan.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                NPWP Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan Nomor NPWP"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.npwpPerusahaan ? "border-red-300" : "border-gray-200"
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
                {...register("npwpPerusahaan")}
              />
              {errors.npwpPerusahaan && (
                <p className="mt-1.5 text-sm text-red-500 ml-1">
                  {errors.npwpPerusahaan.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Nomor Induk Berusaha (NIB){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="13 Digit NIB"
                maxLength={13}
                onKeyDown={blockNonNumbers}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.nibPerusahaan ? "border-red-300" : "border-gray-200"
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
                {...register("nibPerusahaan")}
              />
              {errors.nibPerusahaan && (
                <p className="mt-1.5 text-sm text-red-500 ml-1">
                  {errors.nibPerusahaan.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={mutation.isPending}
            className="bg-green-700 hover:bg-green-800 shadow-sm shadow-green-200 text-sm py-3.5"
          >
            Daftar Sekarang
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-100" />
        <span className="px-3 text-xs text-gray-400 bg-white">
          atau daftar dengan
        </span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Google Login */}
      <GoogleLoginButton />

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/login");
          }}
          className="text-gray-900 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Masuk
        </button>
      </p>
    </>
  );
}
