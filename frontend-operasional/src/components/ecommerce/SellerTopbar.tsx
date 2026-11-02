"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  LogOut,
  User as UserIcon,
  MessageCircle,
  Store,
  BarChart2,
  ArrowLeft,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import NotifBell from "./NotifBell";
import FullScreenButton from "./FullScreenButton";

const NAV_TABS = [
  { label: "Beranda", icon: LayoutDashboard, path: "/seller/dashboard" },
  { label: "Produk", icon: Package, path: "/seller/produk" },
  { label: "Tren & Laporan", icon: BarChart2, path: "/seller/tren" },
  { label: "Percakapan", icon: MessageCircle, path: "/seller/chat" },
];

export default function SellerTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const displayName = user?.name || user?.email || "Seller";
  const email = user?.email ?? "";

  let backUrl = "";
  const backLabel = "Kembali";

  if (
    pathname.startsWith("/seller/produk/") &&
    pathname !== "/seller/produk" &&
    pathname !== "/seller/produk/margin"
  ) {
    backUrl = "/seller/produk";
  } else if (
    pathname.startsWith("/seller/laporan/produk/") &&
    pathname !== "/seller/laporan/produk"
  ) {
    backUrl = "/seller/tren";
  } else if (pathname === "/seller/pengajuan-stok/baru") {
    backUrl = "/seller/gudang/produk";
  }

  const isDetailPage = !!backUrl;

  return (
    <div className="w-full flex items-center justify-between px-2 relative z-50">
      {/* ── Left: logo + pill tabs ── */}
      <div className="flex items-center gap-3">
        {!isDetailPage && (
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-200">
            <Store size={18} className="text-white" />
          </div>
        )}

        <nav
          className={`flex items-center gap-2 ${isDetailPage ? "" : "ml-2"}`}
        >
          {isDetailPage ? (
            <button
              onClick={() => router.push(backUrl)}
              className="relative flex items-center pl-3 pr-4 py-1.5 rounded-full text-[14px] font-semibold transition-all duration-300 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 group shadow-sm"
            >
              <ArrowLeft
                size={16}
                className="mr-1.5 group-hover:-translate-x-1 transition-transform"
              />
              {backLabel}
            </button>
          ) : (
            NAV_TABS.map((tab) => {
              let isTabActive = false;

              if (tab.path === "/seller/dashboard") {
                const dashboardRoutes = [
                  "/seller/dashboard",
                  "/seller/pesanan",
                  "/seller/pesanan-grosir",
                  "/seller/rating",
                  "/seller/kurir",
                ];
                isTabActive = dashboardRoutes.some(
                  (r) => pathname === r || pathname.startsWith(r + "/"),
                );
              } else if (tab.path === "/seller/produk") {
                const produkRoutes = [
                  "/seller/produk",
                  "/seller/stok",
                  "/seller/gudang",
                  "/seller/pengajuan-stok",
                ];
                isTabActive = produkRoutes.some(
                  (r) => pathname === r || pathname.startsWith(r + "/"),
                );
              } else if (tab.path === "/seller/tren") {
                isTabActive =
                  pathname === tab.path ||
                  pathname.startsWith(tab.path + "/") ||
                  pathname.startsWith("/seller/laporan");
              } else {
                isTabActive =
                  pathname === tab.path || pathname.startsWith(tab.path + "/");
              }

              const Icon = tab.icon;

              return (
                <button
                  key={tab.path}
                  onClick={() => router.push(tab.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 border ${
                    isTabActive
                      ? "text-white bg-primary-600 border-primary-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* ── Right: Profile + Notif ── */}
      <div className="flex items-center gap-1.5">
        {/* Profile Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <button className="relative z-50 flex items-center gap-2.5 rounded-full transition-all group outline-none">
            <div
              className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors shadow-sm ${
                pathname === "/seller/profil-toko"
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-slate-200 group-hover:bg-primary-600 group-hover:border-primary-600"
              }`}
            >
              <UserIcon
                size={18}
                className={`transition-colors ${
                  pathname === "/seller/profil-toko"
                    ? "text-white"
                    : "text-slate-700 group-hover:text-white"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Menus */}
          {isProfileOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 pointer-events-none animate-in fade-in duration-300" />

              <div className="absolute right-0 top-full pt-2 w-64 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/40 overflow-hidden pt-1 text-left">
                  {/* User Info Header */}
                  <div className="px-5 py-4 border-b border-slate-50 flex flex-col items-start text-left">
                    <p className="text-[14px] font-bold text-slate-800 leading-none mb-1 w-full truncate">
                      {displayName}
                    </p>
                    <p className="text-[12px] text-slate-500 truncate leading-none mb-2.5 w-full">
                      {email}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                      Seller
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/seller/profil-toko");
                      }}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 text-[14px] font-semibold transition-all"
                    >
                      <Store size={18} className="text-slate-500" />
                      Profil Toko
                    </button>
                    <div className="h-px bg-slate-100 my-1.5 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-[14px] font-semibold transition-all"
                    >
                      <LogOut size={18} />
                      Keluar Sesi
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notification Bell & FullScreen - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex items-center gap-1.5">
          <NotifBell />
          <FullScreenButton />
        </div>
      </div>
    </div>
  );
}
