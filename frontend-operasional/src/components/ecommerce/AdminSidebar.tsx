"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ClipboardList,
  BarChart2,
  Settings,
  Star,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import AppSidebar, { SidebarMenuItem } from "./AppSidebar";

const ADMIN_MENU: SidebarMenuItem[] = [
  {
    path: "/admin/dashboard",
    label: "Beranda",
    icon: <LayoutDashboard size={17} />,
  },
  {
    // Group: Toko
    path: "/admin/toko",
    label: "Toko",
    icon: <Store size={17} />,
    children: [
      { path: "/admin/toko", label: "Daftar Toko" },
      { path: "/admin/toko/margin", label: "Margin Toko" },
    ],
  },
  {
    // Group: Produk & Katalog
    path: "/admin/produk",
    label: "Produk & Katalog",
    icon: <Package size={17} />,
    children: [
      { path: "/admin/produk", label: "Produk" },
      { path: "/admin/master-komoditas", label: "Komoditas" },
    ],
  },
  {
    // Group: Pengguna & Akses
    path: "/admin/pengguna",
    label: "Pengguna & Akses",
    icon: <Users size={17} />,
    children: [
      { path: "/admin/pengguna", label: "Pengguna" },
      { path: "/admin/verifikasi-b2b", label: "Verifikasi B2B" },
    ],
  },
  {
    // Group: Transaksi
    path: "/admin/pesanan",
    label: "Transaksi",
    icon: <ClipboardList size={17} />,
    children: [
      { path: "/admin/pesanan", label: "Pesanan" },
      { path: "/admin/barang-siap", label: "Barang Siap Jual" },
    ],
  },
  {
    path: "/admin/rating",
    label: "Ulasan & Rating",
    icon: <Star size={17} />,
  },
  {
    // Group: Tren
    path: "/admin/tren",
    label: "Tren",
    icon: <TrendingUp size={17} />,
    children: [
      { path: "/admin/laporan/produk-terlaris", label: "Produk Terlaris" },
      { path: "/admin/tren/per-seller", label: "Per Seller" },
      { path: "/admin/tren/pola", label: "Pola Penjualan" },
    ],
  },
  {
    path: "/admin/laporan",
    label: "Laporan",
    icon: <BarChart2 size={17} />,
    children: [{ path: "/admin/laporan/penjualan", label: "Penjualan" }],
  },
  {
    path: "/admin/pengaturan/ongkir",
    label: "Ongkos Kirim",
    icon: <Truck size={17} />,
  },
  {
    path: "/admin/pengaturan",
    label: "Pengaturan",
    icon: <Settings size={17} />,
    children: [
      { path: "/admin/pengaturan/ppn", label: "Pajak (PPN)" },
      { path: "/admin/banner", label: "Banner Promo" },
    ],
  },
];

const AdminSidebar: React.FC = () => {
  const router = useRouter();

  return (
    <AppSidebar
      menuItems={ADMIN_MENU}
      onLogout={() => router.push("/portal-staf-agro-99")}
      logoutLabel="Keluar"
      theme="emerald"
    />
  );
};

export default AdminSidebar;
