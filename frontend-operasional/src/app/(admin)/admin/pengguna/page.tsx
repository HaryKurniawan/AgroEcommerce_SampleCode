"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Users, Download, FilterX, Plus, Activity } from "lucide-react";
import { Modal, message } from "antd";
import Link from "next/link";

import { adminApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";
import type { AdminUser } from "@/types";

// Components
import PageHeader from "@/components/ui/PageHeader";

import RoleTabBar, { type RoleTab } from "./_components/RoleTabBar";
import UserTable from "./_components/UserTable";
import AddUserModal, {
  type CreateUserPayload,
} from "./_components/AddUserModal";

const ManajemenPenggunaPage: React.FC = () => {
  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RoleTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await adminApi.getUsers({ limit: 500 });
      const rawUsers = extractArray<any>(res);
      const mappedUsers: AdminUser[] = rawUsers.map((u: any) => ({
        ...u,
        id: u.id_pengguna || u.id,
        name: u.nama || u.name,
        role: u.peran || u.role,
        emailVerifiedAt: u.emailTerverifikasiPada || u.emailVerifiedAt,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchUsers(false));
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by Tab
    if (activeTab === "GUEST") {
      result = result.filter((user) => {
        const isGuest =
          user.email?.endsWith("@agro.guest") ||
          user.email?.startsWith("guest_");
        return isGuest;
      });
    } else {
      // Exclude guests from other tabs by default
      result = result.filter((user) => {
        const isGuest =
          user.email?.endsWith("@agro.guest") ||
          user.email?.startsWith("guest_");
        return !isGuest;
      });

      if (activeTab !== "ALL") {
        result = result.filter((user) => {
          const userRole = (user.role || "USER").toUpperCase();
          if (activeTab === "ADMIN") {
            return userRole.includes("ADMIN") || userRole === "SUPER_ADMIN";
          }
          return userRole === activeTab;
        });
      }
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [users, activeTab, searchQuery]);

  const regularUsersCount = useMemo(() => {
    return users.filter((user) => {
      const isGuest =
        user.email?.endsWith("@agro.guest") || user.email?.startsWith("guest_");
      return !isGuest;
    }).length;
  }, [users]);

  const handleCreateUser = async (formData: CreateUserPayload) => {
    setIsSubmitting(true);
    try {
      await adminApi.createUser(formData);
      message.success("Akun baru berhasil didaftarkan");
      setShowAddModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      message.error(
        error?.response?.data?.message || "Gagal mendaftarkan akun",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    Modal.confirm({
      title: "Hapus Akun Pengguna?",
      content: `Apakah Anda yakin ingin menghapus akun ${user.name || user.email}? Tindakan ini tidak dapat dibatalkan.`,
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        try {
          await adminApi.deleteUser(user.id);
          message.success("Pengguna berhasil dihapus");
          fetchUsers();
        } catch (error) {
          message.error("Gagal menghapus pengguna");
        }
      },
    });
  };

  return (
    <div className="w-full min-h-screen bg-transparent">
      <PageHeader
        title="Manajemen Pengguna"
        description={`Total ${regularUsersCount} akun terdaftar.`}
        icon={Users}
        iconColor="text-emerald-600"
        actions={
          <div className="relative group min-w-[320px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Cari nama, email, atau peran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-sm font-bold text-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <FilterX size={14} />
              </button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Filters & Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <RoleTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* User Table Component */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onDelete={handleDeleteUser}
          onResetFilter={() => {
            setActiveTab("ALL");
            setSearchQuery("");
          }}
          onRefresh={() => fetchUsers(false)}
        />
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateUser}
        loading={isSubmitting}
      />
    </div>
  );
};

export default ManajemenPenggunaPage;
