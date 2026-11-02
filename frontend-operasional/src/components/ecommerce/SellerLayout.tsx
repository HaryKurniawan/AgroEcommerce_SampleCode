"use client";

import { ReactNode } from "react";

import SellerSidebar from "./SellerSidebar";

export const SellerLayout: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
