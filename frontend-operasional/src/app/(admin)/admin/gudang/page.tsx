"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Warehouse,
  Search,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

interface WarehouseItem {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  telepon?: string;
  status: string;
}

export default function DaftarGudangPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [search, setSearch] = useState("");

  const fetchWarehouses = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      setIsOffline(false);

      const res = await gudangApi.getWarehouses();
      const data = res?.data?.data || res?.data || [];
      setWarehouses(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err: any) {
      console.error("Error fetching warehouses:", err);
      const isNetworkError =
        !err?.response ||
        err?.code === "ECONNREFUSED" ||
        err?.code === "ERR_NETWORK";
      if (isNetworkError) {
        setIsOffline(true);
      }
      setError("Gagal memuat data gudang dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filtered = warehouses.filter(
    (w) =>
      w.nama?.toLowerCase().includes(search.toLowerCase()) ||
      w.kode?.toLowerCase().includes(search.toLowerCase()) ||
      w.kabupaten?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
            Aktif
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 uppercase tracking-wider">
            Nonaktif
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Warehouse size={26} className="text-emerald-600" /> Daftar Gudang
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola data gudang regional dan pusat di seluruh Jawa Barat
          </p>
        </div>
        <button
          onClick={() => fetchWarehouses()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-emerald-600 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      {/* Offline / Error Banner */}
      {error && (
        <div
          className={`rounded-2xl border p-4 flex items-start gap-3 ${
            isOffline
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">
              {isOffline ? "⚡ Gudang Sedang Offline" : "Gagal Memuat Data"}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {isOffline
                ? "Koneksi ke server tidak tersedia. Pastikan backend sudah berjalan, lalu coba segarkan."
                : error}
            </p>
          </div>
          <button
            onClick={() => fetchWarehouses()}
            className="ml-auto shrink-0 text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Search Bar — hanya tampil jika tidak offline */}
      {!isOffline && (
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama gudang, kode, atau kota..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-gray-400 font-medium text-sm">
            Memuat data gudang...
          </p>
        </div>
      ) : filtered.length === 0 && !isOffline ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Warehouse className="text-gray-300 w-7 h-7" />
          </div>
          <h3 className="text-gray-900 text-base font-bold">
            Tidak Ada Gudang
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            {search
              ? "Tidak ada gudang yang cocok dengan pencarian Anda."
              : "Belum ada data gudang di sistem."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-emerald-600 font-bold hover:underline text-sm"
            >
              Bersihkan Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((gudang) => (
            <div
              key={gudang.id}
              onClick={() => router.push(`/admin/gudang/${gudang.id}`)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 group cursor-pointer"
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                    <Warehouse size={24} />
                  </div>
                  {statusBadge(gudang.status)}
                </div>

                {/* Nama & Kode */}
                <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-700 transition-colors mb-1">
                  {gudang.nama}
                </h3>
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-3">
                  {gudang.kode}
                </p>

                {/* Lokasi */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin
                      size={13}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{gudang.kabupaten}</p>
                      <p className="text-gray-500 line-clamp-2">
                        {gudang.alamat}
                      </p>
                    </div>
                  </div>
                  {gudang.telepon && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <p className="font-medium">{gudang.telepon}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {gudang.provinsi}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/gudang/${gudang.id}`);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 group/btn"
                >
                  Detail
                  <ChevronRight
                    size={14}
                    className="group-hover/btn:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
