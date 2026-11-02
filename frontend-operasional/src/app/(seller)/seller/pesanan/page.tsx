"use client";

import { useState, useEffect } from "react";
import { ClipboardList, AlertCircle, Loader2, Package } from "lucide-react";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SortDropdown } from "@/components/ecommerce/SortDropdown";

import { useSellerOrders } from "./_hooks/useSellerOrders";
import OrderCard from "./_components/OrderCard";

export default function PesananMasukPage() {
  const [filterStatus, setFilterStatus] = useState("semua");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { orders, loading, errorText, fetchOrders, totalPages, statusCounts } =
    useSellerOrders();

  useEffect(() => {
    fetchOrders(page, limit, filterStatus, true);
  }, [page, limit, filterStatus, fetchOrders]);

  const statusList = [
    { id: "semua", label: "Aktif" },
    { id: "MENUNGGU_BAYAR", label: "Belum Bayar" },
    { id: "DIPROSES", label: "Diproses" },
    { id: "DIKIRIM", label: "Dikirim" },
    { id: "TIBA", label: "Tiba" },
  ];

  const filtered = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );

  if (errorText)
    return (
      <div className="bg-rose-50/50 text-rose-700 p-6 rounded-2xl flex items-center gap-3 border border-rose-100/60 shadow-sm max-w-2xl mx-auto mt-10">
        <AlertCircle size={20} />
        <div>
          <h3 className="font-medium text-sm">Terjadi Kesalahan</h3>
          <p className="text-xs text-rose-600 mt-0.5">{errorText}</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-800 flex items-center gap-2">
            <ClipboardList size={24} className="text-emerald-600" /> Pesanan
            Masuk
          </h1>
        </div>

        {/* Filter Tabs & Sort */}
        <div className="py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SegmentedControl
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setPage(1); // reset to page 1 on filter change
            }}
            options={statusList.map((tab) => {
              let count = 0;
              if (tab.id === "semua") {
                count = statusCounts["SEMUA"] ?? statusCounts["semua"] ?? 0;
              } else {
                count = statusCounts[tab.id] ?? 0;
              }

              const isActive = filterStatus === tab.id;

              return {
                value: tab.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                ),
              };
            })}
          />

          <div className="shrink-0 w-full md:w-auto self-start md:self-auto z-20">
            <SortDropdown
              value={sortOrder}
              onChange={(val) => setSortOrder(val as "desc" | "asc")}
              options={[
                { value: "desc", label: "Urutkan: Terbaru" },
                { value: "asc", label: "Urutkan: Terlama" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center shadow-sm border border-slate-100 max-w-xl mx-auto space-y-4">
            <Package className="mx-auto text-slate-300 w-16 h-16" />
            <div className="space-y-1">
              <h3 className="font-medium text-lg text-slate-700">
                Tidak Ada Pesanan
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Belum ada pesanan masuk dengan kategori status ini.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((p, idx) => <OrderCard key={p?.id || idx} order={p} />)
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 pb-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-medium text-slate-500">
            Hal {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
