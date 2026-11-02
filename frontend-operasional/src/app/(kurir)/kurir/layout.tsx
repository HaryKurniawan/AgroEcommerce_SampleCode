"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, User, MessageCircle } from "lucide-react";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== "KURIR")) {
      router.replace("/");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || user.role !== "KURIR") {
    return null;
  }

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/kurir/pesanan" },
    { id: "chat", label: "Chat", icon: MessageCircle, path: "/kurir/chat" },
    {
      id: "riwayat",
      label: "Riwayat",
      icon: ClipboardList,
      path: "/kurir/riwayat",
    },
    { id: "profil", label: "Profil", icon: User, path: "/kurir/profil" },
  ];

  const isChatDetailPage =
    pathname.includes("/chat/admin") || pathname.includes("/chat/seller/");
  const isOrderDetailOrMapPage =
    pathname.startsWith("/kurir/pesanan/") && pathname !== "/kurir/pesanan";

  // Hide bottom nav on chat detail pages, order detail pages, and full-screen map page
  const hideBottomNav = isChatDetailPage || isOrderDetailOrMapPage;

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto relative flex flex-col font-sans">
      <main className="flex-1">{children}</main>

      {/* --- Shared Bottom Nav - Exact Ecommerce Theme --- */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50 max-w-lg mx-auto">
          <div className="flex items-center justify-around py-1.5 px-2">
            {tabs.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] active:scale-95 ${
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <div
                    className={`p-1 rounded-lg transition-all duration-200 ${isActive ? "bg-primary-50" : ""}`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
