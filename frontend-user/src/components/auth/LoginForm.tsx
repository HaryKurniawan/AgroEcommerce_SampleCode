"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import { PasswordInput } from "@/components/form";
import Button from "@/components/ui/Button";

import AlertMessage from "./AlertMessage";
import GoogleLoginButton from "./GoogleLoginButton";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginForm Component
 * Form login reusable dengan validasi dan error handling
 *
 * @example
 * ```tsx
 * <LoginForm />
 * ```
 */
export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for error in URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");

      if (error === "unauthorized_role") {
        setShowUnauthorizedModal(true);
        // Clear param so it doesn't stay in URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else if (error === "session_expired") {
        setErrorMessage("Sesi Anda telah berakhir. Silakan login kembali.");
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push("/");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // STRICT: Only KONSUMEN role allowed
      const ALLOWED_ROLE = "KONSUMEN";
      if (data.user?.role !== ALLOWED_ROLE) {
        setShowUnauthorizedModal(true);
        return;
      }
      setAuth(data.user);
      router.push("/");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };

      let errorMsg = axiosError?.response?.data?.message;

      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }

      if (errorMsg) {
        // Jika error dari backend berkaitan dengan role/aplikasi lain, tampilkan modal Akses Ditolak
        if (
          errorMsg.toLowerCase().includes("aplikasi agro lain") ||
          errorMsg.toLowerCase().includes("tidak memiliki akses") ||
          errorMsg.toLowerCase().includes("role")
        ) {
          setShowUnauthorizedModal(true);
        } else {
          setErrorMessage(errorMsg);
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Kredensial tidak valid. Silakan coba lagi.");
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMessage(null);
    mutation.mutate(data);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-16 ml-1" />
          <div className="h-12 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-20 ml-1" />
          <div className="h-12 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="h-6 bg-gray-100 rounded w-24 ml-auto" />
        <div className="h-12 bg-gray-100 rounded-xl w-full pt-4" />
      </div>
    );
  }

  return (
    <>
      {showUnauthorizedModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 max-w-[340px] w-full p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-red-50/80 rounded-2xl flex items-center justify-center mb-5 text-red-500">
              <ShieldAlert size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
              Akses Ditolak
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Maaf, hanya pengguna dengan role{" "}
              <span className="font-semibold text-gray-900">KONSUMEN</span> yang
              diizinkan masuk.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowUnauthorizedModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
            >
              Tutup
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        suppressHydrationWarning
      >
        {/* Email Input */}
        <div suppressHydrationWarning>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            suppressHydrationWarning
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
          {...register("password")}
        />

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
          >
            Lupa password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={mutation.isPending}
            className="bg-green-700 hover:bg-green-800 shadow-sm shadow-green-200 py-3.5 text-sm font-medium"
          >
            Masuk Sekarang
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-100" />
        <span className="px-3 text-xs text-gray-400 bg-white">
          atau login dengan
        </span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Google Login */}
      <GoogleLoginButton />

      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/register");
          }}
          className="text-gray-900 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Daftar
        </button>
      </p>
    </>
  );
}
