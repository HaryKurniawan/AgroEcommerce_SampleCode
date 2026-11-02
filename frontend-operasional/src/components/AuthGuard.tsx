"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;

    const isGuestChatRoute = pathname?.startsWith("/chat/guest");
    const isActiveGuestChat =
      pathname?.startsWith("/chat/") && !!localStorage.getItem("guest_token");

    const isPublicRoute =
      pathname === "/" ||
      pathname?.startsWith("/katalog") ||
      pathname?.startsWith("/produk") ||
      pathname?.startsWith("/toko") ||
      pathname?.startsWith("/auth/") ||
      isGuestChatRoute ||
      isActiveGuestChat;

    if (!isPublicRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, _hasHydrated, pathname, router, openLoginModal]);

  const isGuestChatRoute = pathname?.startsWith("/chat/guest");
  // Safe check for localStorage on initial render
  const isActiveGuestChat =
    typeof window !== "undefined"
      ? pathname?.startsWith("/chat/") && !!localStorage.getItem("guest_token")
      : false;

  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/katalog") ||
    pathname?.startsWith("/produk") ||
    pathname?.startsWith("/toko") ||
    pathname?.startsWith("/auth/") ||
    isGuestChatRoute ||
    isActiveGuestChat;

  const isAuthorized = isPublicRoute || isAuthenticated;

  if (!_hasHydrated || !isAuthorized) {
    if (!isPublicRoute) return null;
  }

  return children;
}
