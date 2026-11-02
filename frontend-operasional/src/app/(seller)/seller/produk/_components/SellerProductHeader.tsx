"use client";

import React from "react";
import { Package, Warehouse } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";

interface SellerProductHeaderProps {
  warehouseName?: string;
  hasWarehouse: boolean;
}

const SellerProductHeader: React.FC<SellerProductHeaderProps> = ({
  warehouseName,
  hasWarehouse,
}) => {
  return (
    <PageHeader
      title="Produk & Gudang"
      icon={Package}
      iconColor="text-emerald-600"
      actions={
        hasWarehouse && (
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
            <Warehouse size={16} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">
              Gudang: {warehouseName || "Gudang Pusat"}
            </p>
          </div>
        )
      }
    />
  );
};

export default SellerProductHeader;
