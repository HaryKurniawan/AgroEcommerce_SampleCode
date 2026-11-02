"use client";

// =====================================================
// BOTTOM NAV — MOBILE NAVIGATION
// User biasa → Chat (bukan Booking)
// Verified B2B → Booking (bukan Chat)
// =====================================================

import { useRouter, usePathname } from "next/navigation";
import { Home, User, Bell, MessageCircle } from "lucide-react";

import { useAuthStore } from "@/src/store/auth-store";
import { useNotifStore } from "@/src/store/notifikasi-store";

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotifStore((s) => s.unreadCount);

  const isAuth =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/portal-staf-agro-99");

  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/katalog") ||
    pathname?.startsWith("/produk") ||
    pathname?.startsWith("/toko");

  if (isAuth || (!isAuthenticated && !isPublicRoute)) return null;

  const navItems = [
    { label: "Beranda", icon: Home, path: "/" },
    { label: "Percakapan", icon: MessageCircle, path: "/chat" },
    { label: "Notifikasi", icon: Bell, path: "/notifikasi" },
    { label: "Profil", icon: User, path: "/profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50 lg:hidden">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={(e) => {
                e.preventDefault();
                if (
                  item.path !== "/" &&
                  !useAuthStore.getState().isAuthenticated
                ) {
                  useAuthStore.getState().openLoginModal();
                } else {
                  router.push(item.path);
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] active:scale-95 relative ${
                isActive
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all duration-200 relative ${isActive ? "bg-primary-50" : ""}`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.path === "/notifikasi" && unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
