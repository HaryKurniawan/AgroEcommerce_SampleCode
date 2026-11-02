"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

// =====================================================
// LAYOUT — RESPONSIVE LAYOUT WRAPPER
// Bottom nav only on main menu pages
// =====================================================

import BottomNav from "./BottomNav";
import Navbar from "./Navbar";

// Pages that show bottom nav (main menu pages only)
const bottomNavPaths = ["/", "/booking", "/chat", "/notifikasi", "/profil"];

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const showBottomNav = bottomNavPaths.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className={`lg:pt-16 ${showBottomNav ? "pb-20 lg:pb-6" : "pb-6"}`}>
        <div className="desktop-container">{children}</div>
      </main>

      {/* Mobile Bottom Nav — only on main menu pages */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
