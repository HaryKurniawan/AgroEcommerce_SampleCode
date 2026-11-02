"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Warehouse, ClipboardList, History, Package } from "lucide-react";

import AppSidebar, { SidebarMenuItem } from "./AppSidebar";

const GUDANG_MENU: SidebarMenuItem[] = [
  {
    path: "/admin/gudang",
    label: "Daftar Gudang",
    icon: <Warehouse size={17} />,
  },
  {
    path: "/admin/gudang/produk",
    label: "Produk Gudang",
    icon: <Package size={17} />,
  },
  {
    path: "/admin/gudang/pengajuan-aktif",
    label: "Pengajuan Aktif",
    icon: <ClipboardList size={17} />,
  },
  {
    path: "/admin/gudang/riwayat",
    label: "Riwayat Pengajuan",
    icon: <History size={17} />,
  },
];

const GudangSidebar: React.FC = () => {
  const router = useRouter();

  return (
    <AppSidebar
      menuItems={GUDANG_MENU}
      onLogout={() => router.push("/portal-staf-agro-99")}
      logoutLabel="Keluar"
      theme="emerald"
    />
  );
};

export default GudangSidebar;
