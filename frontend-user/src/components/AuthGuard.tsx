"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";

import { useAuthStore } from "@/src/store/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, openLoginModal: _ } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;

    const isGuestChatRoute = pathname?.startsWith("/chat/guest");
    const isActiveGuestChat =
      typeof window !== "undefined" &&
      pathname?.startsWith("/chat/") &&
      !!localStorage.getItem("guest_token");

    const isPublicRoute =
      pathname === "/" ||
      pathname?.startsWith("/katalog") ||
      pathname?.startsWith("/produk") ||
      pathname?.startsWith("/toko") ||
      pathname?.startsWith("/auth/") ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register") ||
      pathname?.startsWith("/forgot-password") ||
      isGuestChatRoute ||
      isActiveGuestChat;

    // STRICT ROLE CHECK: Only KONSUMEN allowed
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      const ALLOWED_ROLE = "KONSUMEN";

      if (user && user.role !== ALLOWED_ROLE) {
        console.warn("🚫 Unauthorized role detected:", user.role);

        // Clear auth immediately
        useAuthStore.getState().clearAuth();

        // Clear all tokens
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie = "accessToken=; path=/; max-age=0";
        }

        // Redirect immediately
        router.replace("/login?error=unauthorized_role");
        return;
      }
    }

    if (!isPublicRoute && !isAuthenticated) {
      console.log(
        "🔐 Not authenticated, redirecting to login. Path:",
        pathname,
      );
      router.replace("/login");
    }
  }, [isAuthenticated, _hasHydrated, pathname, router]);

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
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    isGuestChatRoute ||
    isActiveGuestChat;

  const isAuthorized = isPublicRoute || isAuthenticated;

  if (!_hasHydrated || !isAuthorized) {
    if (!isPublicRoute) return null;
  }

  return children;
}
