"use client";

import React, { useState } from "react";
import { Modal, message } from "antd";
import {
  Loader2,
  Users,
  Filter,
  CheckCircle2,
  Store,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";
import { adminApi } from "@/lib/api/admin";
import { formatTanggal } from "@/lib/ecommerce-api";
import type { AdminUser } from "@/types";

import UserRoleBadge from "./UserRoleBadge";

interface UserTableProps {
  users: AdminUser[];
  loading: boolean;
  onDelete: (user: AdminUser) => void;
  onResetFilter: () => void;
  onRefresh?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onDelete,
  onResetFilter,
  onRefresh,
}) => {
  const router = useRouter();
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleResend = async (
    e: React.MouseEvent,
    email: string,
    id: string,
  ) => {
    e.stopPropagation();
    try {
      setResendingEmailId(id);
      await authApi.resendVerification(email);
      message.success(`Email verifikasi dikirim ulang ke ${email}`);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Gagal mengirim ulang verifikasi",
      );
    } finally {
      setResendingEmailId(null);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, user: AdminUser) => {
    e.stopPropagation();
    const isCurrentlyActive = user.aktif !== false;
    const newStatus = !isCurrentlyActive;

    Modal.confirm({
      title: newStatus ? "Aktifkan Akun Seller?" : "Nonaktifkan Akun Seller?",
      content: newStatus
        ? `Akun ${user.name || user.email} akan diaktifkan kembali dan bisa berjualan.`
        : `Akun ${user.name || user.email} akan dinonaktifkan. Seller tidak bisa login dan berjualan.`,
      okText: newStatus ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
      okType: newStatus ? "primary" : "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        try {
          setTogglingId(user.id);
          await adminApi.toggleSellerStatus(user.id, newStatus);
          message.success(
            newStatus
              ? "Akun seller berhasil diaktifkan"
              : "Akun seller berhasil dinonaktifkan",
          );
          onRefresh?.();
        } catch (err: any) {
          message.error(
            err?.response?.data?.message || "Gagal mengubah status akun",
          );
        } finally {
          setTogglingId(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm py-20 text-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-gray-400 font-medium">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm py-20 text-center">
        <div className="max-w-xs mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-200" />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">
            Pengguna tidak ditemukan
          </h3>
          <p className="text-gray-400 text-xs">
            Coba sesuaikan kata kunci atau filter tab Anda.
          </p>
          <button
            onClick={onResetFilter}
            className="mt-4 text-emerald-600 font-bold flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <Filter size={14} /> Reset Filter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto text-[13px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
              <th className="pl-6 pr-2 py-4 font-bold uppercase tracking-wider text-[11px] w-12 text-center">
                No
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                Pengguna
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                Peran
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                Verifikasi
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                Detail Tambahan
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                Bergabung
              </th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user, index) => {
              const isVerifiedEmail = !!user.emailVerifiedAt;
              const isVerifiedB2B = user.isVerifiedB2B;
              const b2bStatus = user.b2bVerification?.status;
              const sellerStatus = user.sellerProfile?.status;
              const farmerStatus = user.farmerProfile?.status;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button") || target.closest("a")) {
                      return;
                    }
                    router.push(`/admin/pengguna/${user.id}`);
                  }}
                >
                  <td className="pl-6 pr-2 py-5 font-semibold text-gray-400 text-center w-12">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {user.name || "—"}
                      </p>
                      <p className="text-gray-500 text-[11px] truncate">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {isVerifiedEmail ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold uppercase tracking-tight">
                          <CheckCircle2 size={10} /> Email
                        </span>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 border border-gray-100 text-[9px] font-bold uppercase tracking-tight">
                            Email Not Verified
                          </span>
                          <button
                            onClick={(e) =>
                              handleResend(e, user.email, user.id)
                            }
                            disabled={resendingEmailId === user.id}
                            className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50 disabled:hover:no-underline"
                          >
                            {resendingEmailId === user.id
                              ? "Mengirim..."
                              : "Kirim Ulang"}
                          </button>
                        </div>
                      )}

                      {isVerifiedB2B ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-tight">
                          <CheckCircle2 size={10} /> B2B Verified
                        </span>
                      ) : b2bStatus === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase tracking-tight">
                          B2B PENDING
                        </span>
                      ) : null}

                      {user.role === "SELLER" &&
                        (user.aktif === false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase tracking-tight">
                            <PowerOff size={10} /> Nonaktif
                          </span>
                        ) : sellerStatus === "DISETUJUI" ||
                          sellerStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold uppercase tracking-tight">
                            <CheckCircle2 size={10} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase tracking-tight">
                            Merchant {sellerStatus || "PENDING"}
                          </span>
                        ))}

                      {user.role === "FARMER" &&
                        (farmerStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-lime-50 text-lime-700 border border-lime-100 text-[9px] font-bold uppercase tracking-tight">
                            <CheckCircle2 size={10} /> Farmer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase tracking-tight">
                            Farmer {farmerStatus || "PENDING"}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 text-xs">
                    {user.role === "SELLER" && user.sellerProfile?.storeName ? (
                      <span className="flex items-center gap-1">
                        <Store size={12} className="text-orange-400" />
                        {user.sellerProfile.storeName}
                      </span>
                    ) : user.role === "COURIER" &&
                      user.courierSellerProfile?.storeName ? (
                      <span className="flex items-center gap-1">
                        <Store size={12} className="text-emerald-500" />
                        <span className="text-gray-400">Toko:</span>{" "}
                        {user.courierSellerProfile.storeName}
                      </span>
                    ) : user.role === "FARMER" &&
                      user.farmerProfile?.fullName ? (
                      <span>{user.farmerProfile.fullName}</span>
                    ) : (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">
                    {user.createdAt ? formatTanggal(user.createdAt) : "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.role === "SELLER" && (
                        <button
                          onClick={(e) => handleToggleStatus(e, user)}
                          disabled={togglingId === user.id}
                          className={`p-2 rounded-xl transition-all active:scale-90 ${
                            user.aktif !== false
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                          } disabled:opacity-50`}
                          title={
                            user.aktif !== false
                              ? "Nonaktifkan Seller"
                              : "Aktifkan Seller"
                          }
                        >
                          {user.aktif !== false ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Hapus Pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
