"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  BarChart2,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
  User as UserIcon,
  CalendarCheck,
  MessageCircle,
  Warehouse,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import NotifBell from "./NotifBell";
import FullScreenButton from "./FullScreenButton";

const NAV_TABS = [
  { label: "Beranda", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Management Account", icon: UserIcon, path: "/admin/pengguna" },
  { label: "Gudang", icon: Warehouse, path: "/admin/gudang" },
  { label: "Pusat Bantuan", icon: MessageCircle, path: "/admin/chat" },
];

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock booking count for demonstration. In real implementation, fetch this from API.
  const [bookingCount, setBookingCount] = useState(3);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  /* Derive initials from name or email */
  const displayName = user?.name || user?.email || "Admin";
  const email = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full flex items-center justify-between px-2">
      {/* ── Left: logo + pill tabs ── */}
      <div className="flex items-center gap-3">
        {/* Logo icon (Daun) - Lingkaran */}
        <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-200">
          <Leaf size={18} className="text-white" />
        </div>

        {/* Nav tabs (terpisah-pisah) */}
        <nav className="flex items-center gap-2 ml-2">
          {NAV_TABS.map((tab) => {
            let isActive =
              pathname === tab.path || pathname.startsWith(tab.path + "/");

            if (tab.path === "/admin/dashboard") {
              const inOtherTab = NAV_TABS.some(
                (t) =>
                  t.path !== "/admin/dashboard" &&
                  (pathname === t.path || pathname.startsWith(t.path + "/")),
              );
              if (pathname.startsWith("/admin") && !inOtherTab) {
                isActive = true;
              }
            }

            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-colors duration-300 border ${
                  isActive
                    ? "text-white border-primary-600 shadow-sm bg-primary-600/10"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {/* Active Sweep Background */}
                <div className="absolute -inset-[1px] rounded-full overflow-hidden z-0">
                  <div
                    className={`absolute inset-0 bg-primary-600 ${
                      isActive
                        ? "transition-transform duration-500 ease-out translate-x-0"
                        : "-translate-x-[105%]"
                    }`}
                  />
                </div>

                <div className="relative z-10 flex items-center gap-1.5">
                  <Icon size={13} />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Right: Avatar/Email Dropdown ── */}
      <div className="flex items-center gap-2">
        <NotifBell />
        <div className="hidden md:flex items-center gap-2">
          <FullScreenButton />
        </div>
        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="relative z-50 flex items-center gap-2.5 rounded-full transition-all group outline-none">
            {/* Avatar Circle with User Icon */}
            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 group-hover:border-primary-600 transition-all duration-200 shadow-sm">
              <UserIcon
                size={15}
                className="text-gray-600 group-hover:text-white transition-colors"
              />
            </div>
          </button>

          {/* Floating Dropdown Menus */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 pointer-events-none animate-in fade-in duration-300" />

              <div className="absolute right-0 top-full pt-2 w-64 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 p-1.5">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-50 mb-1.5 flex flex-col items-start text-left">
                    <p className="text-[14px] font-bold text-gray-800 leading-none mb-1 w-full truncate">
                      {displayName}
                    </p>
                    <p className="text-[12px] text-gray-500 truncate leading-none mb-2.5 w-full">
                      {email}
                    </p>
                    <span className="inline-block text-[11px] font-medium text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-full">
                      Admin
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-[14px] font-semibold transition-all"
                  >
                    <LogOut size={18} />
                    Keluar Sesi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
