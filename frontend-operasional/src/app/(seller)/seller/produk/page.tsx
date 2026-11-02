"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, PackageOpen } from "lucide-react";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

import { useSellerProducts, ProductItem } from "./_hooks/useSellerProducts";
import EtalaseCard from "./_components/EtalaseCard";
import SellerProductHeader from "./_components/SellerProductHeader";

const ProdukSayaPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Hook
  const {
    store,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    actionLoadingId,
    filteredEtalase,
    handleToggleStatus,
    handleRemoveFromEtalase,
    handleUpdateProduct,
    refresh,
    totalPages,
    totalItems,
  } = useSellerProducts();

  // Local UI State
  // Fetch when page, search, or status changes
  useEffect(() => {
    refresh(page, limit, true);
  }, [page, limit, refresh]);

  const getStatusColor = (s: string) => {
    const status = s.toLowerCase();
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "inactive":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "out_of_stock":
        return "bg-red-50 text-red-600 border-red-100";
      case "draft":
        return "bg-gray-50 text-gray-500 border-gray-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat data produk...
        </p>
      </div>
    );
  }

  if (!store || store.error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 flex items-center gap-4 max-w-2xl mx-auto mt-10">
        <AlertCircle size={32} />
        <div>
          <h3 className="font-medium text-lg text-red-800">
            Toko Tidak Ditemukan
          </h3>
          <p className="text-sm opacity-80 mt-1">
            Anda belum memiliki toko. Pastikan Anda sudah terdaftar sebagai
            seller.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <SellerProductHeader
        hasWarehouse={!!store.warehouseAdmin}
        warehouseName={store.warehouseName || store.warehouseAdmin?.name}
      />

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        <div className="relative group flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset page on search
            }}
            placeholder="Cari produk di etalase..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none shadow-sm transition-all text-gray-700 font-normal"
          />
        </div>

        <div className="py-1.5 shrink-0">
          <SegmentedControl
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setPage(1); // reset page on filter change
            }}
            options={[
              { label: "Semua", value: "semua" },
              { label: "Aktif", value: "active" },
              { label: "Nonaktif", value: "inactive" },
              { label: "Habis", value: "out_of_stock" },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {filteredEtalase.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
            <PackageOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-800 font-medium text-lg">
              Hening di Etalase
            </h3>
            <p className="text-gray-400 text-sm mt-1 font-normal">
              Produk tidak ditemukan atau belum ada item yang diaktifkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEtalase.map((p) => (
              <EtalaseCard
                key={p.id}
                product={p}
                onToggleStatus={handleToggleStatus}
                onRemoveFromEtalase={handleRemoveFromEtalase}
                isActionLoading={actionLoadingId === p.id}
                statusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 pb-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-medium text-gray-500">
            Hal {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default ProdukSayaPage;
