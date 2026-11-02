"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Truck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { loginStaff } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

// --- SCHEMAS & TYPES ---
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type LoginFormData = z.infer<typeof loginSchema>;

// --- UTILS ---
const isAccountNotFoundError = (msg: string | null | undefined): boolean => {
  if (!msg) return false;
  const normalized = msg.toLowerCase();
  return (
    normalized.includes("akun tidak ditemukan") ||
    normalized.includes("user not found")
  );
};

const isUnverifiedError = (msg: string | null | undefined): boolean => {
  if (!msg) return false;
  const normalized = msg.toLowerCase();
  return normalized.includes("belum terverifikasi");
};

// --- CUSTOM HOOKS ---
function useOperationalLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, _hasHydrated } = useAuthStore();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [oauthError, setOauthError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [unverifiedMessage, setUnverifiedMessage] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    const msg = searchParams.get("message");
    if (err || msg) {
      const decodedMsg = msg ? decodeURIComponent(msg) : "";
      if (isAccountNotFoundError(decodedMsg)) {
        setShowErrorModal(true);
        router.replace("/");
      } else if (isUnverifiedError(decodedMsg)) {
        setUnverifiedMessage(decodedMsg);
        setShowUnverifiedModal(true);
        router.replace("/");
      } else {
        setOauthError(decodedMsg || "Authentication failed. Please try again.");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (_hasHydrated && user) {
      const role = user.role;
      if (role === "SUPER_ADMIN") router.replace("/admin/dashboard");
      else if (role === "PENJUAL") router.replace("/seller/dashboard");
      else if (role === "KURIR") router.replace("/kurir/pesanan");
      else if (role === "ADMIN_CS") router.replace("/cs/chat");
    }
  }, [user, _hasHydrated, router]);

  const mutation = useMutation({
    mutationFn: loginStaff,
    onSuccess: (data) => {
      setAuth(data.user);
      const role = data.user.role;
      if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
      else if (role === "PENJUAL") router.push("/seller/dashboard");
      else if (role === "KURIR") router.push("/kurir/pesanan");
      else if (role === "ADMIN_CS") router.push("/cs/chat");
      else router.push("/");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "";
      if (isAccountNotFoundError(msg)) {
        setShowErrorModal(true);
      } else if (isUnverifiedError(msg)) {
        setUnverifiedMessage(msg);
        setShowUnverifiedModal(true);
      }
    },
  });

  const getMutationErrorMessage = (): string | null => {
    const axiosError = mutation.error as {
      response?: { data?: { message?: string } };
    };
    const msg = axiosError?.response?.data?.message || mutation.error?.message;
    if (isAccountNotFoundError(msg) || isUnverifiedError(msg)) return null;
    return msg || null;
  };

  const activeError = oauthError || getMutationErrorMessage();

  return {
    mutation,
    activeError,
    setOauthError,
    showErrorModal,
    setShowErrorModal,
    showUnverifiedModal,
    setShowUnverifiedModal,
    unverifiedMessage,
  };
}

// --- COMPONENTS ---
function AccountNotFoundModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 flex flex-col items-center text-center transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 shadow-inner">
          <AlertCircle size={32} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
          Akun tidak ditemukan
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-6">
          Silakan daftar terlebih dahulu.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function UnverifiedAccountModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 flex flex-col items-center text-center transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-5 shadow-inner">
          <AlertCircle size={32} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
          Akun Belum Terverifikasi
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-6">
          Akun Anda belum terverifikasi sepenuhnya. Silakan selesaikan
          verifikasi Email Anda.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    window.location.href = `${backendUrl}/auth/google?origin=agro-core`;
  };
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-semibold text-gray-700 group"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform"
        fill="currentColor"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Lanjutkan dengan Google
    </button>
  );
}

function OperationalLoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    mutation,
    activeError,
    setOauthError,
    showErrorModal,
    setShowErrorModal,
    showUnverifiedModal,
    setShowUnverifiedModal,
    unverifiedMessage,
  } = useOperationalLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema as never) });

  const onSubmit = (data: LoginFormData) => {
    setOauthError(null);
    mutation.mutate(data);
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setShowUnverifiedModal(false);
    mutation.reset();
    setOauthError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans selection:bg-primary-100 selection:text-primary-900 relative">
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 mb-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Login Operasional
          </h2>
          <p className="text-sm text-gray-500">
            Silakan masukkan detail akun Anda
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-gray-900">
              Email / Username
            </label>
            <input
              type="email"
              placeholder="contoh: kurir@agrojabar.com"
              className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all ${
                errors.email
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                  : "border-gray-200"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium px-1 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-gray-900 block mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full px-4 py-3.5 pr-12 rounded-xl border bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all ${
                  errors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-gray-200"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              {errors.password ? (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              ) : (
                <span />
              )}
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors ml-auto"
              >
                Lupa sandi?
              </Link>
            </div>
          </div>

          {activeError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-70 disabled:pointer-events-none text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center py-6 mt-2">
          <div className="flex-grow border-t border-gray-100" />
          <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Atau
          </span>
          <div className="flex-grow border-t border-gray-100" />
        </div>

        <GoogleLoginButton />

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} PT Agro Jabar &bull; Internal Use
            Only
          </p>
        </div>
      </div>

      <AccountNotFoundModal isOpen={showErrorModal} onClose={closeModal} />
      <UnverifiedAccountModal
        isOpen={showUnverifiedModal}
        onClose={closeModal}
        message={unverifiedMessage}
      />
    </div>
  );
}

export default function OperationalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      }
    >
      <OperationalLoginPageContent />
    </Suspense>
  );
}
