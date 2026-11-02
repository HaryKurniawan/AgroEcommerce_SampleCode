"use client";

import React from "react";

interface UserRoleBadgeProps {
  role: string | undefined;
}

const getRoleBadgeConfig = (role: string) => {
  switch (role) {
    case "USER":
    case "CUSTOMER":
      return {
        cls: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Pelanggan",
      };
    case "SELLER":
      return {
        cls: "bg-orange-50 text-orange-700 border-orange-100",
        label: "Seller",
      };
    case "CS":
    case "ADMIN_CS":
      return {
        cls: "bg-purple-50 text-purple-700 border-purple-100",
        label: "CS",
      };
    case "COURIER":
      return {
        cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
        label: "Kurir",
      };
    case "FARMER":
      return {
        cls: "bg-lime-50 text-lime-700 border-lime-100",
        label: "Petani",
      };
    case "SUPER_ADMIN":
      return {
        cls: "bg-red-50 text-red-700 border-red-100",
        label: "Super Admin",
      };
    case "ADMIN_FARMER":
      return {
        cls: "bg-teal-50 text-teal-700 border-teal-100",
        label: "Admin Tani",
      };
    case "ADMIN_WAREHOUSE":
      return {
        cls: "bg-amber-50 text-amber-700 border-amber-100",
        label: "Admin Gudang",
      };
    case "WAREHOUSE_STAFF":
      return {
        cls: "bg-cyan-50 text-cyan-700 border-cyan-100",
        label: "Staff Gudang",
      };
    default:
      return { cls: "bg-gray-50 text-gray-700 border-gray-100", label: role };
  }
};

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role = "USER" }) => {
  const badge = getRoleBadgeConfig(role);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-normal border ${badge.cls}`}
    >
      {badge.label}
    </span>
  );
};

export default UserRoleBadge;
