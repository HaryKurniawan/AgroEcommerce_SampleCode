"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

interface ProdukGudang {
  id: string;
  nama: string;
  varianProduk?: string;
  deskripsi?: string;
  satuan: string;
  hargaGudang: number;
  gambarUrl?: string;
  gudangId?: string;
  gudangNama?: string;
  gudangKode?: string;
}

interface WarehouseItem {
  id: string;
  nama: string;
}

const fmtRp = (n: number) => `Rp ${(n || 0).toLocaleString("id-ID")}`;

export default function ProdukGudangPage() {
  const [selectedGudang, setSelectedGudang] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Query untuk daftar gudang
  const { data: warehouses = [] } = useQuery<WarehouseItem[]>({
    queryKey: ["admin-warehouses"],
    queryFn: async () => {
      const res = await gudangApi.getWarehouses();
      const raw = res?.data?.data || res?.data || [];
      return Array.isArray(raw) ? raw : (raw.data ?? []);
    },
    staleTime: 5 * 60 * 1000, // Cache 5 menit
  });

  // Query untuk daftar produk gudang
  const {
    data: products = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<ProdukGudang[]>({
    queryKey: ["admin-gudang-produk", selectedGudang],
    queryFn: async () => {
      const gid =
        selectedGudang && selectedGudang !== "ALL" ? selectedGudang : undefined;
      const res = await gudangApi.getProdukGudang(gid);
      const raw = res?.data?.data || res?.data || [];
      return Array.isArray(raw) ? raw : (raw.data ?? []);
    },
    staleTime: 3 * 60 * 1000, // Cache 3 menit
  });

  const loading = isLoading || isFetching;
  const isOffline = isError; // treat any fetch error as potential offline
  const error = isError ? "Gagal memuat daftar produk gudang." : "";

  const filtered = useMemo(
    () =>
      products.filter(
        (p: ProdukGudang) =>
          p.nama
            ?.replace(" - ", " ")
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          p.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
          p.gudangNama?.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Package size={26} className="text-emerald-600" /> Produk Gudang
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar produk yang dijual gudang ke seller (katalog pengadaan)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-emerald-600 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

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
            onClick={() => refetch()}
            className="ml-auto shrink-0 text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk berdasarkan nama atau gudang..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <select
          value={selectedGudang}
          onChange={(e) => setSelectedGudang(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all md:w-52"
        >
          <option value="ALL">Semua Gudang</option>
          {warehouses.map((w: WarehouseItem) => (
            <option key={w.id} value={w.id}>
              {w.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-gray-400 font-medium text-sm">
            Memuat produk gudang...
          </p>
        </div>
      ) : filtered.length === 0 && !isOffline ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="text-gray-300 w-7 h-7" />
          </div>
          <h3 className="text-gray-900 text-base font-bold">
            Tidak Ada Produk
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            {search
              ? "Tidak ada produk yang cocok dengan pencarian Anda."
              : "Belum ada produk yang dijual gudang."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: ProdukGudang) => (
            <div
              key={`${p.gudangId}-${p.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="h-40 bg-gray-50 relative overflow-hidden border-b border-gray-100 flex-shrink-0">
                {p.gambarUrl && (
                  <img
                    src={p.gambarUrl}
                    alt={p.nama?.replace(" - ", " ")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextElementSibling) {
                        (
                          e.currentTarget.nextElementSibling as HTMLElement
                        ).style.display = "flex";
                      }
                    }}
                  />
                )}
                <div
                  className="w-full h-full items-center justify-center bg-emerald-50/50 absolute inset-0"
                  style={{ display: p.gambarUrl ? "none" : "flex" }}
                >
                  <Package size={40} className="text-emerald-200" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {p.varianProduk
                    ? `${p.nama?.replace(" - ", " ")} ${p.varianProduk}`
                    : p.nama?.replace(" - ", " ")}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                    {p.nama?.replace(" - ", " ")}
                  </span>
                  {p.varianProduk && (
                    <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                      {p.varianProduk}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-emerald-700">
                    {fmtRp(p.hargaGudang)}
                  </span>
                  <span className="text-xs text-gray-400">/ {p.satuan}</span>
                </div>
                {p.gudangNama && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1 border-t border-gray-50 mt-1">
                    <Warehouse size={12} className="text-gray-400" />
                    <span className="truncate">{p.gudangNama}</span>
                  </div>
                )}

                {/* Button Placeholder for Admin */}
                <button
                  disabled
                  className="mt-auto w-full px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center justify-center gap-1.5 bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  title="Fitur Pengajuan hanya tersedia untuk akun Seller"
                >
                  Hanya Seller yg bisa Ajukan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
