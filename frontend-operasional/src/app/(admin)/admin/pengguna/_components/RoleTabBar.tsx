"use client";

import React from "react";
import { Users, Store, Truck, Headphones, CheckCircle2 } from "lucide-react";

export type RoleTab =
  | "ALL"
  | "USER"
  | "SELLER"
  | "CS"
  | "COURIER"
  | "ADMIN"
  | "GUEST";

interface RoleTabBarProps {
  activeTab: RoleTab;
  setActiveTab: (tab: RoleTab) => void;
}

const TABS: { id: RoleTab; label: string; icon: React.ElementType }[] = [
  { id: "ALL", label: "Semua", icon: Users },
  { id: "USER", label: "Pelanggan", icon: Users },
  { id: "SELLER", label: "Seller", icon: Store },
  { id: "COURIER", label: "Kurir", icon: Truck },
  { id: "CS", label: "CS", icon: Headphones },
  { id: "ADMIN", label: "Admin", icon: CheckCircle2 },
  { id: "GUEST", label: "Guest / Tamu", icon: Users },
];

const RoleTabBar: React.FC<RoleTabBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
            activeTab === tab.id
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-100 scale-[1.02]"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RoleTabBar;
