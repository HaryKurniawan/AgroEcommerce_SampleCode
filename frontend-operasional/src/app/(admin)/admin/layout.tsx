"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";
import AdminSidebar from "@/components/ecommerce/AdminSidebar";
import AccountSidebar from "@/components/ecommerce/AccountSidebar";
import GudangSidebar from "@/components/ecommerce/GudangSidebar";
import AdminTopbar from "@/components/ecommerce/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const allowedRoles = ["SUPER_ADMIN", "ADMIN_CS"];

  useEffect(() => {
    if (
      _hasHydrated &&
      (!user || !allowedRoles.includes(user.role as string))
    ) {
      router.replace("/");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || !allowedRoles.includes(user.role as string)) {
    return null;
  }

  // Route-route yang menggunakan sidebar Account Management
  const accountRoutes = ["/admin/pengguna"];
  const isAccountSection = accountRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Route-route yang menggunakan sidebar Gudang
  const gudangRoutes = ["/admin/gudang"];
  const isGudangSection = gudangRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Route-route topbar yang bersifat standalone dan tidak memerlukan sidebar "Dashboard"
  const hideSidebarRoutes = ["/admin/booking", "/admin/chat"];

  // Fungsi untuk mengecek jika path saat ini cocok persis atau merupakan sub-path
  const showSidebar = !hideSidebarRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const renderSidebar = () => {
    if (isAccountSection) return <AccountSidebar />;
    if (isGudangSection) return <GudangSidebar />;
    return <AdminSidebar />;
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-5 gap-3 overflow-hidden">
      {/* Top Bar — di luar contain */}
      <div className="w-full py-1">
        <AdminTopbar />
      </div>

      {/* Desktop App Container */}
      <div className="w-full flex-1 bg-white rounded-2xl overflow-hidden flex border border-gray-200 min-h-0 relative">
        {/* Sidebar */}
        {showSidebar && renderSidebar()}

        {/* Main Content */}
        <main
          className={`flex-1 ${pathname.startsWith("/admin/chat") ? "overflow-hidden" : "overflow-auto"} bg-gray-100 flex flex-col min-h-0`}
        >
          <div
            className={`${pathname.startsWith("/admin/chat") ? "h-full" : "py-6 px-6 lg:px-12"} flex-1 flex flex-col min-h-0`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
