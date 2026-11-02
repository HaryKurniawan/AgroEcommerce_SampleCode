"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import AuthGuard from "@/src/components/AuthGuard";
import UnifiedOnboardingModal from "@/src/components/ecommerce/UnifiedOnboardingModal";
import { useAuthStore } from "@/src/store/auth-store";
import { useRestoreAuth } from "@/src/hooks/auth";

const Navbar = dynamic(() => import("@/src/components/ecommerce/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-[73px] bg-white border-b border-gray-200 hidden lg:block" />
  ),
});

const BottomNav = dynamic(
  () => import("@/src/components/ecommerce/BottomNav"),
  {
    ssr: false,
    loading: () => null,
  },
);

const bottomNavPaths = ["/", "/booking", "/notifikasi", "/profil", "/chat"];

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const showOnboarding = useAuthStore((s) => s.showOnboarding);
  const isVerifiedB2B = user?.isVerifiedB2B === true;

  // Restore and validate auth on app load
  useRestoreAuth();

  const isAuth =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password");

  const isEcommerce = !isAuth;

  let showBottomNav = bottomNavPaths.includes(pathname || "");
  if (pathname === "/chat" && isVerifiedB2B) {
    showBottomNav = false;
  }

  return isEcommerce ? (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main
          className={`lg:pt-32 ${showBottomNav ? "pb-20" : ""} ${pathname?.startsWith("/chat") ? "lg:pb-0" : "lg:pb-6"}`}
        >
          <div className="desktop-container">{children}</div>
        </main>
        {showBottomNav && <BottomNav />}
        <UnifiedOnboardingModal />
      </div>
    </AuthGuard>
  ) : (
    children
  );
}
