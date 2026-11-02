"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Search,
  Star,
  MapPin,
  Loader2,
  AlertCircle,
  Package,
  ShoppingBag,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Users,
} from "lucide-react";

import { storesApi } from "@/lib/ecommerce-api";

interface StoreItem {
  id: string;
  nama: string;
  status: string;
  kabupaten?: string;
  wilayah?: string;
  totalProduk?: number;
  totalPesanan?: number;
  rating?: number;
  jamOperasional?: string;
  alamat?: string;
  lat?: number;
  lng?: number;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
          <CheckCircle2 size={10} /> Aktif
        </span>
      );
    case "PENDING":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
          <Clock size={10} /> Menunggu
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
          Ditangguhkan
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-wider">
          Nonaktif
        </span>
      );
  }
};

export default function ManajemenTokoPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchStores = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await storesApi.adminGetAll();
      const raw = res?.data?.data || res?.data || [];
      const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
      setStores(arr);
    } catch {
      setError("Gagal memuat data toko dari sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchStores(false)); // Already loading by default
  }, []);

  const filtered = stores.filter(
    (t) =>
      t.nama?.toLowerCase().includes(search.toLowerCase()) ||
      t.kabupaten?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
            <Store size={26} className="text-primary-600" /> Manajemen Toko
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pantau performa, status, dan lokasi Agro Daerah di seluruh wilayah
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-primary-600 transition-all"
            title={viewMode === "grid" ? "Switch to List" : "Switch to Grid"}
          >
            {viewMode === "grid" ? (
              <List size={20} />
            ) : (
              <LayoutGrid size={20} />
            )}
          </button>
          <button
            onClick={() => (window.location.href = "/admin/toko/seller")}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl font-medium text-sm hover:bg-primary-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <Users size={18} /> Data Seller & Kurir
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari toko berdasarkan nama, kota, atau daerah..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors border border-gray-200">
            <Filter size={16} /> Filter Wilayah
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={40} className="animate-spin text-primary-600" />
          <p className="text-gray-400 font-medium">
            Menyinkronkan data toko...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="text-gray-300 w-8 h-8" />
          </div>
          <h3 className="text-gray-900 text-lg font-medium">
            Data Toko Kosong
          </h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">
            Tidak ada data toko yang cocok dengan kriteria pencarian Anda saat
            ini.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-4 text-primary-600 text-sm font-medium hover:underline"
          >
            Bersihkan Pencarian
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((toko) => (
            <div
              key={toko.id}
              onClick={() => router.push(`/admin/toko/${toko.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/admin/toko/${toko.id}`);
                }
              }}
              role="button"
              tabIndex={0}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-all duration-300 group cursor-pointer"
            >
              {/* Card Content */}
              <div className="p-4">
                {/* Header: Status */}
                <div className="flex items-start justify-between mb-3">
                  {statusBadge(toko.status)}
                </div>

                {/* Nama Toko */}
                <h3 className="font-medium text-gray-900 text-base group-hover:text-primary-700 transition-colors truncate mb-1">
                  {toko.nama}
                </h3>

                {/* Lokasi */}
                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mb-4">
                  <MapPin size={12} className="text-primary-500 shrink-0" />
                  <span className="truncate">
                    {toko.kabupaten || "Wilayah Belum Diset"}
                    {toko.wilayah ? ` • ${toko.wilayah}` : ""}
                  </span>
                </p>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-3">
                  {/* Action Button */}
                  <Link
                    href={`/admin/toko/${toko.id}`}
                    className="w-full text-center py-2 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors flex items-center justify-center gap-1"
                  >
                    Kelola Toko
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">
                  Toko / Lokasi
                </th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">
                  Metriks
                </th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">
                  Status
                </th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((toko) => (
                <tr
                  key={toko.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{toko.nama}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {toko.kabupaten} • {toko.wilayah}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Package size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {toko.totalProduk || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {toko.totalPesanan || 0}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(toko.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/toko/${toko.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
