"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { usersApi } from "@/lib/ecommerce-api";
import { CreateSellerForm } from "@/components/ecommerce/CreateSellerForm";
import {
  SellerCourierSettings,
  SellerInfo,
} from "@/components/ecommerce/SellerCourierSettings";

const extractData = (
  res: { data?: { data?: unknown } | unknown } | unknown,
): unknown => {
  const body = (res as { data?: { data?: unknown } | unknown })?.data;
  if (
    body &&
    typeof body === "object" &&
    "data" in (body as Record<string, unknown>)
  )
    return (body as { data: unknown }).data;
  return body;
};

export default function SellerManagementPage() {
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [settingsSeller, setSettingsSeller] = useState<SellerInfo | null>(null);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSellers = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await usersApi.getSellerCourierAffiliations({
          page,
          limit: 12,
          search: search || undefined,
        });
        const data = extractData(res) as {
          data?: SellerInfo[];
          total?: number;
          totalPages?: number;
        };
        if (data && typeof data === "object") {
          if (Array.isArray(data)) {
            const mapped = data.map((u: any) => ({
              ...u,
              id: u.id_pengguna || u.id,
            }));
            setSellers(mapped as SellerInfo[]);
          } else {
            const raw = (data as { data: any[] }).data || [];
            const mapped = raw.map((u: any) => ({
              ...u,
              id: u.id_pengguna || u.id,
            }));
            setSellers(mapped as SellerInfo[]);
            setTotalPages((data as { totalPages: number }).totalPages || 1);
          }
        }
      } catch (err) {
        console.error("Error fetching sellers:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    Promise.resolve().then(() => fetchSellers(false)); // Already loading by default
  }, [fetchSellers]);

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setSuccess("Seller baru berhasil dibuat!");
    fetchSellers();
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Manajemen Seller & Kurir
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Buat dan kelola akun seller beserta afiliasi kurir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-80">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari seller..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400/50 outline-none transition-all bg-white"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buat Seller Baru
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2">
          ✅ {success}
        </div>
      )}

      {/* Seller Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin mr-3" />
          Memuat data seller...
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-4">🏪</div>
          <p className="font-medium text-slate-600">Belum ada seller</p>
          <p className="text-sm text-slate-400 mt-1">
            Klik &ldquo;Buat Seller Baru&rdquo; untuk memulai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sellers.map((seller) => {
            const store = seller.sellerProfile?.store;
            const courier = store?.courierStaff;

            return (
              <div
                key={seller.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Store header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {seller.sellerProfile?.storeName
                        ? seller.sellerProfile.storeName.charAt(0).toUpperCase()
                        : "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate pr-2">
                        {seller.sellerProfile?.storeName || "—"}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {seller.name || "—"} · {seller.email}
                      </p>
                      {store && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          📍 {store.kabupaten}
                          {store.wilayah ? `, ${store.wilayah}` : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex-shrink-0 ${
                        store?.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {store?.status || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Courier section */}
                <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Kurir Afiliasi
                  </p>
                  {courier ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                        {courier.name
                          ? courier.name.charAt(0).toUpperCase()
                          : "K"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {courier.name || courier.email}
                        </p>
                      </div>
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                      <span className="text-sm">⚠️</span>
                      <span className="text-xs font-semibold">
                        Belum ada kurir
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-end">
                  <button
                    onClick={() => setSettingsSeller(seller)}
                    className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    ⚙️ Pengaturan Kurir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all bg-white"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm font-medium text-slate-500 px-2">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all bg-white"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateSellerForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreate(false)}
        />
      )}
      {settingsSeller && (
        <SellerCourierSettings
          seller={settingsSeller}
          onClose={() => setSettingsSeller(null)}
          onUpdated={() => {
            fetchSellers();
            setSettingsSeller(null);
          }}
        />
      )}
    </div>
  );
}
