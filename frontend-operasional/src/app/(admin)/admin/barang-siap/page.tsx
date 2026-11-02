"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

import { productsApi, formatRupiah, formatTanggal } from "@/lib/ecommerce-api";

interface ReadyProduct {
  id: string;
  nama: string;
  stok: number;
  satuan?: string;
  harga: number;
  status: string;
  gambarUrl?: string;
  store?: { nama: string; kabupaten?: string };
  toko?: { nama: string; kabupaten?: string };
  category?: { nama: string };
  createdAt?: string;
  grades?: Array<{ grade: string; stok: number }>;
}

const BarangSiapJualPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ReadyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productsApi.getAll({ limit: 100 });
        const data =
          res?.data?.data?.data || res?.data?.data || res?.data || [];
        // Only show ACTIVE products as "barang siap jual"
        const all = Array.isArray(data) ? data : [];
        setItems(
          all.filter((p: ReadyProduct) => p.status === "ACTIVE" && p.stok > 0),
        );
      } catch (err) {
        console.error("Failed to fetch ready products:", err);
        setError("Gagal memuat data barang siap jual.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = items.filter(
    (b) =>
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      (b.store?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.toko?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.category?.nama || "").toLowerCase().includes(search.toLowerCase()),
  );

  const statusListingColor = (stok: number) =>
    stok > 50
      ? "bg-emerald-100 text-emerald-700"
      : stok > 10
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag size={24} className="text-emerald-600" /> Barang Siap
          Jual
        </h1>
        <p className="text-sm text-gray-500">
          Produk aktif yang tersedia di etalase toko marketplace
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, toko, atau kategori..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!loading &&
        !error &&
        (filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">
              Belum ada barang siap jual
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Produk aktif dari semua toko akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0 relative">
                      {b.gambarUrl ? (
                        <Image
                          src={b.gambarUrl}
                          alt={b.nama}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{b.nama}</p>
                      <p className="text-xs text-gray-500">
                        {b.toko?.nama ||
                          b.store?.nama ||
                          "Pusat / Tidak Diketahui"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusListingColor(b.stok)}`}
                  >
                    {b.stok > 50
                      ? "Stok Banyak"
                      : b.stok > 10
                        ? "Stok Terbatas"
                        : "Hampir Habis"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-500">Stok</p>
                    <p className="font-bold text-gray-900">
                      {b.stok.toLocaleString()} {b.satuan || "kg"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-500">Harga</p>
                    <p className="font-bold text-gray-900 text-xs">
                      {formatRupiah(b.harga)}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="font-bold text-gray-900 text-xs">
                      {b.category?.nama || "-"}
                    </p>
                  </div>
                </div>
                {b.grades && b.grades.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {b.grades.map((g) => (
                      <span
                        key={g.grade}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 font-mono"
                      >
                        Grade {g.grade}: {g.stok}
                      </span>
                    ))}
                  </div>
                )}
                {b.createdAt && (
                  <p className="text-xs text-gray-400 mt-3">
                    Ditambahkan: {formatTanggal(b.createdAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default BarangSiapJualPage;
