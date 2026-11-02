import { ReactNode } from "react";
import Link from "next/link";
import { Headphones, Leaf } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showGuestChat?: boolean;
  showMobileLogo?: boolean;
  hideHeaderOnMobile?: boolean;
}

/**
 * AuthLayout Component
 * Layout reusable untuk halaman authentication (Login, Register, Forgot Password)
 */
export default function AuthLayout({
  children,
  title,
  subtitle,
  showGuestChat = true,
  showMobileLogo = true,
  hideHeaderOnMobile = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* ─── LEFT DECORATIVE PANE (Desktop only) ─── */}
      <div className="hidden lg:flex w-[28%] xl:w-[25%] relative overflow-hidden">
        {/* Base */}
        <div className="absolute inset-0 bg-[#0d3d24]" />

        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3d24] via-[#125930] to-[#1a7048]" />

        {/* Blurred orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-10 -left-10 w-56 h-56 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-green-300/8 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-10 xl:p-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 border border-white/15 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-emerald-300" />
            </div>
            <span className="text-white font-display font-semibold text-lg tracking-tight">
              Agro<span className="text-emerald-400">Market</span>
            </span>
          </div>

          {/* Center illustration / text */}
          <div className="space-y-4">
            <div className="w-16 h-0.5 bg-emerald-400/50 rounded-full" />
            <h2 className="text-3xl xl:text-4xl font-display font-bold text-white leading-snug tracking-tight">
              Selamat
              <br />
              Datang
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                Kembali.
              </span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">
              Masuk dan nikmati produk pertanian segar pilihan.
            </p>
          </div>

          {/* Subtle bottom credit */}
          <p className="text-white/20 text-[10px] tracking-wide">
            AGRO MARKET · JAWA BARAT
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANE — Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-14 xl:px-20">
        {/* Mobile logo */}
        {showMobileLogo && (
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-2xl text-gray-900">
              Agro<span className="text-primary-600">Market</span>
            </span>
          </div>
        )}

        {/* Form card */}
        <div className="w-full max-w-[360px]">
          {/* Heading */}
          {title && (
            <div
              className={`mb-8 ${hideHeaderOnMobile ? "hidden md:block" : ""}`}
            >
              <h1 className="text-2xl font-display font-semibold text-emerald-700 tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-400">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
              )}
            </div>
          )}

          {/* Form content */}
          {children}
        </div>

        {/* Guest Chat Button */}
        {showGuestChat && (
          <Link
            href="/chat/guest"
            className="fixed bottom-5 right-5 bg-white text-gray-500 px-3.5 py-2 rounded-full border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all z-50 flex items-center gap-2 text-sm font-medium"
            title="Hubungi CS"
          >
            <Headphones size={15} />
            Butuh Bantuan?
          </Link>
        )}
      </div>
    </div>
  );
}
