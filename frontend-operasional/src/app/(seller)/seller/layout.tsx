"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";
import SellerSidebar from "@/components/ecommerce/SellerSidebar";
import SellerTopbar from "@/components/ecommerce/SellerTopbar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== "PENJUAL")) {
      router.replace("/");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || user.role !== "PENJUAL") {
    return null;
  }

  // Routes where sidebar should be hidden (full-page views)
  const hideSidebarRoutes = [
    "/seller/chat",
    "/seller/profil-toko",
    "/seller/produk/",
    "/seller/pengajuan-stok/baru",
  ];

  // Exception: show sidebar for margin page
  const isMarginPage = pathname === "/seller/produk/margin";
  const showSidebar =
    !hideSidebarRoutes.some(
      (route) => pathname === route || pathname.startsWith(route),
    ) || isMarginPage;

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-5 gap-3 overflow-hidden print:h-auto print:p-0 print:overflow-visible print:block">
      {/* Top Bar */}
      <div className="w-full print:hidden">
        <SellerTopbar />
      </div>

      {/* Desktop App Container */}
      <div className="w-full flex-1 bg-white rounded-2xl overflow-hidden flex border border-gray-200 min-h-0 relative print:border-none print:rounded-none print:overflow-visible print:block">
        {/* Sidebar */}
        {showSidebar && (
          <div className="print:hidden">
            <SellerSidebar />
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 ${
            pathname.startsWith("/seller/chat") ||
            (pathname.startsWith("/seller/produk/") &&
              pathname !== "/seller/produk/margin" &&
              pathname !== "/seller/produk") ||
            pathname === "/seller/pengajuan-stok/baru" ||
            pathname === "/seller/gudang/produk"
              ? "overflow-hidden"
              : `overflow-auto ${pathname === "/seller/dashboard" ? "scrollbar-hide" : ""}`
          } bg-gray-100 flex flex-col min-h-0 print:bg-white print:overflow-visible print:block`}
        >
          <div
            className={`${
              pathname.startsWith("/seller/chat") ||
              (pathname.startsWith("/seller/produk/") &&
                pathname !== "/seller/produk/margin") ||
              pathname === "/seller/pengajuan-stok/baru" ||
              pathname === "/seller/gudang/produk"
                ? "h-full"
                : "p-6 md:p-8 pb-20 max-w-6xl mx-auto w-full"
            } flex-1 flex flex-col min-h-0 print:p-0 print:m-0 print:block`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
