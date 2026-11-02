"use client";

// =====================================================
// ADMIN LAYOUT - ECOMMERCE SAYUR
// =====================================================

import { ReactNode } from "react";

import AdminSidebar from "./AdminSidebar";

export const AdminLayout: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
