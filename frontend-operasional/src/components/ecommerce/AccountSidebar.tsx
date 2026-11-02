"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Key,
  History,
  Settings,
  UserPlus,
  Lock,
} from "lucide-react";

import AppSidebar, { SidebarMenuItem } from "./AppSidebar";

const ACCOUNT_MENU: SidebarMenuItem[] = [
  {
    path: "/admin/pengguna",
    label: "Pengguna",
    icon: <Users size={17} />,
    children: [
      { path: "/admin/pengguna", label: "Semua Pengguna" },
      { path: "/admin/pengguna/tambah", label: "Tambah Pengguna" },
    ],
  },

  {
    path: "/admin/pengguna/logs",
    label: "Log Aktivitas",
    icon: <History size={17} />,
  },
  {
    path: "/admin/pengaturan",
    label: "Pengaturan Akun",
    icon: <Settings size={17} />,
  },
];

const AccountSidebar: React.FC = () => {
  const router = useRouter();

  return (
    <AppSidebar
      menuItems={ACCOUNT_MENU}
      onLogout={() => router.push("/portal-staf-agro-99")}
      logoutLabel="Keluar"
      theme="emerald"
    />
  );
};

export default AccountSidebar;
