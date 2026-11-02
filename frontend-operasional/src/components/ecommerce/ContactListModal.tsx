import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Loader2,
  Users,
  User,
  Shield,
  Store,
  Truck,
  Headset,
  Package,
  ChevronRight,
} from "lucide-react";

import { adminApi } from "@/lib/ecommerce-api";

interface ContactListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (userId: string) => void;
}

export default function ContactListModal({
  isOpen,
  onClose,
  onSelectContact,
}: ContactListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<
    "ALL" | "KURIR" | "ADMIN_CS" | "PENJUAL" | "ADMIN"
  >("ALL");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Ambil pengguna dengan semua peran kecuali KONSUMEN
      adminApi
        .getUsers({ role: "KURIR,ADMIN_CS,PENJUAL,SUPER_ADMIN", limit: 100 })
        .then((res) => {
          const data = res.data?.data?.data || res.data?.data || [];
          setUsers(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to fetch operational users", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    // Search match
    const searchMatch =
      u.nama?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      (u.peran || u.role)?.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    // Role match
    if (filterRole === "ALL") return true;
    if (filterRole === "ADMIN")
      return u.peran?.includes("ADMIN") || u.role?.includes("ADMIN");
    return u.peran === filterRole || u.role === filterRole;
  });

  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase();
    let label = role;
    switch (r) {
      case "KURIR":
        label = "KURIR";
        break;
      case "ADMIN_CS":
        label = "CS";
        break;
      case "PENJUAL":
        label = "SELLER";
        break;
      case "SUPER_ADMIN":
        label = "ADMIN";
        break;
      case "GUDANG":
      case "STAF_GUDANG":
      case "ADMIN_GUDANG":
        label = "GUDANG";
        break;
    }
    return (
      <span className="px-2 py-0.5 bg-primary-50 text-primary-600 border border-primary-100 text-[10px] font-bold rounded-md">
        {label}
      </span>
    );
  };

  const getRoleIcon = (role: string) => {
    const r = role?.toUpperCase();
    switch (r) {
      case "KURIR":
        return <Truck size={16} className="text-primary-500" />;
      case "ADMIN_CS":
        return <Headset size={16} className="text-primary-500" />;
      case "PENJUAL":
        return <Store size={16} className="text-primary-500" />;
      case "SUPER_ADMIN":
        return <Shield size={16} className="text-primary-500" />;
      case "GUDANG":
      case "STAF_GUDANG":
      case "ADMIN_GUDANG":
        return <Package size={16} className="text-primary-500" />;
      default:
        return <User size={16} className="text-primary-500" />;
    }
  };

  const filterOptions = [
    { label: "Semua", value: "ALL" },
    { label: "Seller", value: "PENJUAL" },
    { label: "Kurir", value: "KURIR" },
    { label: "CS", value: "ADMIN_CS" },
    { label: "Admin", value: "ADMIN" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 w-full max-w-md flex flex-col overflow-hidden h-[600px]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <Users size={16} className="text-primary-600" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">
              Kontak Operasional
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterRole(opt.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterRole === opt.value
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-200"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
              <p className="text-sm text-gray-500">Memuat kontak...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Kontak Tidak Ditemukan
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Coba kata kunci pencarian atau filter yang lain.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user, idx) => (
                <button
                  key={user.id || user.id_pengguna || idx}
                  onClick={() => onSelectContact(user.id || user.id_pengguna)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center border border-gray-200">
                    {getRoleIcon(user.peran)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {user.name || user.email.split("@")[0]}
                      </p>
                      {getRoleBadge(user.peran)}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-primary-500 transition-colors"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
