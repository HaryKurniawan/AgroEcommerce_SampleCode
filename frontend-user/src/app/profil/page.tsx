"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Package,
  MapPin,
  Store,
  Heart,
  Settings,
  Shield,
  MessageCircle,
  HelpCircle,
  UserCheck,
  User,
  Building2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Truck,
  Star,
  LogOut,
} from "lucide-react";

import CartCountButton from "@/src/components/ecommerce/CartCountButton";
import {
  useProfile,
  useOrdersSummary,
  useProfileActions,
  useSyncProfile,
} from "@/hooks";
import { useAuthStore } from "@/src/store/auth-store";
import { ProfileSkeleton } from "@/src/components/ecommerce/Skeleton";
import ActionModal from "@/src/components/ActionModal";

const ProfilPage: React.FC = () => {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const { profile, loading: profileLoading } = useProfile(
    isAuthenticated,
    _hasHydrated,
  );
  const { orders, loading: ordersLoading } = useOrdersSummary(
    isAuthenticated,
    _hasHydrated,
  );
  const { logout } = useProfileActions();

  // Sync profile data with auth store
  useSyncProfile();

  const loading = profileLoading || ordersLoading;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
  };

  const menuUtama = [
    {
      id: "detail-profil",
      label: "Detail Profil",
      icon: User,
      desc: "Lihat dan atur informasi akun Anda",
      path: "/profil/detail",
    },
    {
      id: "beri-nilai",
      label: "Beri Nilai Pesanan",
      icon: Star,
      desc: "Berikan ulasan untuk pesanan selesai",
      path: "/pesanan?status=selesai",
    },

    {
      id: "alamat",
      label: "Alamat Tersimpan",
      icon: MapPin,
      desc: "Kelola alamat pengiriman",
      path: "/profil/alamat",
    },
    {
      id: "bantuan",
      label: "Pusat Bantuan",
      icon: MessageCircle,
      desc: "Hubungi layanan pelanggan kami",
      path: "/chat",
    },
    {
      id: "upgrade-b2b",
      label: "Akun Perusahaan (B2B)",
      icon: Building2,
      desc:
        (profile as any)?.statusVerifikasiPerusahaan === "PENDING" ||
        (profile as any)?.statusVerifikasiPerusahaan === "DISETUJUI" ||
        (profile as any)?.isPerusahaan
          ? (profile as any)?.statusVerifikasiPerusahaan === "PENDING"
            ? "Menunggu verifikasi admin"
            : "Terverifikasi sebagai perusahaan"
          : "Daftar untuk harga grosir khusus",
      path: "/profil/upgrade-b2b",
    },
  ];

  if (!_hasHydrated || loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  const orderStatuses = [
    { id: "menunggu_bayar", label: "Belum Bayar", icon: CreditCard },
    { id: "diproses", label: "Diproses", icon: Package },
    { id: "dikirim", label: "Dikirim", icon: Truck },
    { id: "tiba", label: "Tiba", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Compact Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 pt-6 pb-20 px-5 relative overflow-hidden">
        {/* Batik background pattern - faded at edges */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "url('/images/batik.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "160px",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        />
        <div className="max-w-2xl mx-auto flex items-center justify-between relative z-10">
          <h1 className="font-display font-semibold text-xl text-white">
            Profil Saya
          </h1>
          <CartCountButton
            variant="dark"
            size="sm"
            className="!bg-transparent hover:!bg-white/10"
          />
        </div>
      </div>

      {/* Profile Card (Overlapping) */}
      <div className="max-w-2xl mx-auto px-4 -mt-14 relative z-10">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0">
              <User size={32} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-lg text-gray-900 truncate leading-tight">
                {profile.name || profile.email}
              </h2>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>

          {(profile.role === "SELLER" ||
            profile.role === "ADMIN_FARMER" ||
            profile.role === "SUPER_ADMIN") && (
            <div className="flex gap-2.5 mt-4 pt-4 border-t border-gray-200">
              {profile.role === "SELLER" && (
                <button
                  onClick={() => router.push("/seller/dashboard")}
                  className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Store size={16} />
                  Dasbor Seller
                </button>
              )}
              {(profile.role === "ADMIN_FARMER" ||
                profile.role === "SUPER_ADMIN") && (
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={16} />
                  Admin Panel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders Quick-Access */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[15px] text-gray-800">
              Pesanan Saya
            </h3>
            <button
              onClick={() => router.push("/pesanan")}
              className="text-xs text-primary-600 font-medium hover:text-primary-700"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {orderStatuses.map((item) => {
              const count = orders.filter((o) => {
                if (item.id === "tiba") {
                  return (
                    o.status?.toUpperCase() === "DIKIRIM" &&
                    (o as any).pengiriman?.status === "ARRIVED"
                  );
                }
                if (item.id === "dikirim") {
                  return (
                    o.status?.toUpperCase() === "DIKIRIM" &&
                    (o as any).pengiriman?.status !== "ARRIVED"
                  );
                }
                if (item.id === "menunggu_bayar") {
                  return (
                    o.status?.toUpperCase() === "MENUNGGU_BAYAR" ||
                    o.status?.toUpperCase() === "MENUNGGU_KONFIRMASI_SELLER"
                  );
                }
                return o.status?.toLowerCase() === item.id.toLowerCase();
              }).length;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/pesanan?status=${item.id}`)}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <div className="relative w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                    <item.icon size={23} strokeWidth={1.8} />
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm box-content">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Menus */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden">
          {menuUtama.map((menu, i) => (
            <button
              key={menu.id}
              onClick={() => router.push(menu.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100 ${i !== menuUtama.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 flex-shrink-0">
                <menu.icon size={20} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {menu.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {menu.desc}
                </p>
              </div>
              <ChevronRight size={17} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Logout Menu */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors group active:bg-red-100"
          >
            <LogOut
              size={20}
              className="text-red-400 group-hover:text-red-500 flex-shrink-0"
            />
            <p className="flex-1 text-left font-semibold text-red-500 group-hover:text-red-600 text-sm">
              Keluar Akun
            </p>
          </button>
        </div>
      </div>

      <ActionModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        icon={<LogOut size={40} className="text-primary-500" />}
        title="Keluar Akun"
        description="Apakah Anda yakin ingin keluar dari akun ini?"
        primaryButton={{
          label: "Ya, Keluar",
          onClick: handleConfirmLogout,
          danger: true,
        }}
        secondaryButton={{
          label: "Batal",
          onClick: () => setIsLogoutModalOpen(false),
        }}
      />
    </div>
  );
};

export default ProfilPage;
