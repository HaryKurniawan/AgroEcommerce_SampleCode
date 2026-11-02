"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Search,
  Star,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Box,
} from "lucide-react";

import {
  formatRupiah,
  productsApi,
  storesApi,
  categoriesApi,
} from "@/lib/ecommerce-api";

interface Category {
  id: string;
  nama: string;
}
interface Store {
  id: string;
  nama: string;
}

interface VarianKemasan {
  id: string;
  ukuranKg: number;
  biayaTambahan: number;
  stokKemasan: number;
  isActive: boolean;
}

interface ProductRow {
  id: string;
  nama: string;
  status: string;
  gambarUrl?: string;
  gambar?: string;
  harga: number;
  stok: number;
  satuan?: string;
  terjual?: number;
  rating?: number;
  deskripsi?: string;
  kategori?: { nama: string } | string;
  masterProduk?: { id: string; nama: string };
  store?: { nama: string };
  tokoNama?: string;
  varian?: VarianKemasan[];
}

const EMPTY_FORM = {
  nama: "",
  harga: 0,
  stok: 0,
  satuan: "kg",
  deskripsi: "",
  kategoriId: "",
  tokoId: "",
  images: [{ type: "link", value: "" }] as {
    type: "link" | "file";
    value: string;
  }[],
};

export default function ManajemenProdukPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [prodRes, catRes, storeRes] = await Promise.all([
        productsApi.getAll({ limit: 200 }),
        categoriesApi.getAll(),
        storesApi.adminGetAll({ limit: 100 }),
      ]);
      const data =
        prodRes?.data?.data?.data || prodRes?.data?.data || prodRes?.data || [];
      setProducts(Array.isArray(data) ? data : []);
      const cats = catRes?.data?.data || catRes?.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
      const storesData = storeRes?.data?.data || storeRes?.data || [];
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchProducts(false)); // Already loading by default
  }, []);

  const filtered = products.filter((p) => {
    const productName = p.nama?.replace(" - ", " ") || "";
    const storeName = p.store?.nama || p.tokoNama || "";
    const matchSearch =
      productName.toLowerCase().includes(search.toLowerCase()) ||
      storeName.toLowerCase().includes(search.toLowerCase());
    let statusFormatted = "aktif";
    if (p.status === "ACTIVE") statusFormatted = "aktif";
    if (p.status === "INACTIVE" || p.status === "DRAFT")
      statusFormatted = "draft";
    if (p.stok === 0 || p.status === "OUT_OF_STOCK") statusFormatted = "habis";
    const matchStatus =
      filterStatus === "semua" || statusFormatted === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus produk "${nama}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    try {
      await productsApi.remove(id);
      await fetchProducts();
    } catch {
      alert("Gagal menghapus produk.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await productsApi.updateStatus(id, newStatus);
      await fetchProducts(false);
    } catch {
      alert("Gagal merubah status produk.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.tokoId) {
      setFormError("Nama produk dan toko wajib diisi.");
      return;
    }
    setSubmitLoading(true);
    setFormError("");
    try {
      await productsApi.create(form.tokoId, {
        nama: form.nama,
        harga: Number(form.harga),
        stok: Number(form.stok),
        satuan: form.satuan,
        deskripsi: form.deskripsi,
        kategoriId: form.kategoriId || undefined,
        gambarUrl: form.images[0]?.value || undefined,
        fotoLainnya: form.images
          .slice(1)
          .map((img) => img.value)
          .filter(Boolean),
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      await fetchProducts();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message || "Gagal menambahkan produk.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
            <Package size={24} className="text-primary-600" /> Manajemen Produk
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowModal(true);
              setForm(EMPTY_FORM);
              setFormError("");
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk berdasarkan nama atau nama toko..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["semua", "aktif", "draft", "habis"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize ${filterStatus === s ? "bg-primary-600 text-white " : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-gray-500 font-medium w-8" />
                <th className="py-4 px-6 text-gray-500 font-medium">Produk</th>
                <th className="py-4 px-6 text-gray-500 font-medium">Toko</th>
                <th className="py-4 px-6 text-gray-500 font-medium">Harga</th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Stok
                </th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Kemasan
                </th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Terjual
                </th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Rating
                </th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Status
                </th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <Loader2
                      size={32}
                      className="animate-spin text-primary-600 mx-auto"
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Belum ada data produk
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imageContent = p.gambarUrl ? (
                    <Image
                      src={p.gambarUrl}
                      alt={p.nama?.replace(" - ", " ")}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl">{p.gambar || "📦"}</span>
                  );
                  let displayStatus = "Aktif";
                  let statusClass = "bg-primary-100 text-primary-700";
                  if (p.stok === 0 || p.status === "OUT_OF_STOCK") {
                    displayStatus = "Habis";
                    statusClass = "bg-red-100 text-red-700";
                  } else if (p.status === "INACTIVE" || p.status === "DRAFT") {
                    displayStatus = "Draft";
                    statusClass = "bg-gray-100 text-gray-600";
                  }
                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(expandedId === p.id ? null : p.id)
                        }
                        className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 text-gray-400">
                          {expandedId === p.id ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                              {imageContent}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {p.nama?.replace(" - ", " ")}
                              </p>
                              {p.masterProduk?.nama ? (
                                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100">
                                  {p.masterProduk.nama}
                                </span>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  {typeof p.kategori === "object"
                                    ? p.kategori?.nama
                                    : p.kategori || "Tanpa Kategori"}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {p.store?.nama || p.tokoNama || "-"}
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {formatRupiah(p.harga)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {p.stok > 0 ? (
                            <span className="font-medium">
                              {p.stok}{" "}
                              <span className="text-xs text-gray-500 font-normal">
                                {p.satuan || "kg"}
                              </span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                              Habis
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {p.varian && p.varian.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-md">
                              <Box size={12} /> {p.varian.length} jenis
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 text-center">
                          {p.terjual || 0}
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center justify-center gap-1 font-semibold text-gray-700">
                            <Star size={14} className="text-gray-500" />
                            {p.rating || "0.0"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase ${statusClass}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id, p.nama?.replace(" - ", " "));
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>

                      {/* Dropdown detail row */}
                      {expandedId === p.id && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={10} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Detail Produk */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Detail Produk
                                </h4>
                                <div className="text-sm space-y-1.5">
                                  <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                      Satuan
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {p.satuan || "kg"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                      Harga Satuan
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {formatRupiah(p.harga)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">Stok</span>
                                    <span className="font-medium text-gray-800">
                                      {p.stok} {p.satuan || "kg"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Deskripsi */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Deskripsi
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {p.deskripsi || "Tidak ada deskripsi."}
                                </p>
                              </div>

                              {/* Jenis Kemasan */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                  <Box size={14} /> Jenis Kemasan
                                  {p.varian && p.varian.length > 0 && (
                                    <span className="text-gray-600">
                                      ({p.varian.length})
                                    </span>
                                  )}
                                </h4>
                                {p.varian && p.varian.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {p.varian.map((v) => (
                                      <div
                                        key={v.id}
                                        className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm"
                                      >
                                        <span className="font-medium text-gray-800">
                                          Kemasan {v.ukuranKg} kg Biaya
                                          Tambahan:{" "}
                                        </span>
                                        <span className="text-primary-700 font-medium">
                                          {formatRupiah(v.biayaTambahan)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    Belum ada varian kemasan. Dijual per{" "}
                                    {p.satuan || "kg"}.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Tombol Aksi di Dropdown */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(p.id, p.status);
                                }}
                                className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                              >
                                <RefreshCw
                                  size={14}
                                  className={
                                    p.status === "ACTIVE"
                                      ? "text-red-500"
                                      : "text-emerald-500"
                                  }
                                />
                                {p.status === "ACTIVE"
                                  ? "Nonaktifkan Produk"
                                  : "Aktifkan Produk"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  Tambah Produk Baru
                </h3>
                <p className="text-xs text-gray-500">
                  Produk akan ditambahkan ke toko yang dipilih
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
              <div>
                <label
                  htmlFor="tokoId"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Toko <span className="text-red-500">*</span>
                </label>
                <select
                  id="tokoId"
                  value={form.tokoId}
                  onChange={(e) => setForm({ ...form, tokoId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Toko --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Contoh: Bayam Segar"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="harga"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Harga (Rp)
                  </label>
                  <input
                    id="harga"
                    type="number"
                    min={0}
                    value={form.harga}
                    onChange={(e) =>
                      setForm({ ...form, harga: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="stok"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Stok
                  </label>
                  <input
                    id="stok"
                    type="number"
                    min={0}
                    value={form.stok}
                    onChange={(e) =>
                      setForm({ ...form, stok: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="satuan"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Satuan
                  </label>
                  <select
                    id="satuan"
                    value={form.satuan}
                    onChange={(e) =>
                      setForm({ ...form, satuan: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    {["kg", "gram", "ikat", "buah", "pack", "karton"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="kategoriId"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Kategori
                  </label>
                  <select
                    id="kategoriId"
                    value={form.kategoriId}
                    onChange={(e) =>
                      setForm({ ...form, kategoriId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="deskripsi"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  rows={3}
                  placeholder="Deskripsi singkat tentang produk..."
                />
              </div>

              {/* Product Images Section */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="block text-sm font-medium text-gray-700">
                    Foto Produk & Galeri (Maks 3)
                  </span>
                  {form.images.length < 3 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          images: [...form.images, { type: "link", value: "" }],
                        })
                      }
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md"
                    >
                      <Plus size={12} /> Tambah Foto
                    </button>
                  )}
                </div>
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100 relative"
                  >
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: form.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 border border-gray-100 hover:bg-red-50"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.map((im, i) =>
                                i === idx ? { type: "link", value: "" } : im,
                              ),
                            }))
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${img.type === "link" ? "bg-primary-600 text-white " : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
                        >
                          Link URL
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.map((im, i) =>
                                i === idx ? { type: "file", value: "" } : im,
                              ),
                            }))
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${img.type === "file" ? "bg-primary-600 text-white " : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
                        >
                          Upload File
                        </button>
                      </div>
                      {img.type === "link" ? (
                        <input
                          type="url"
                          value={img.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.map((im, i) =>
                                i === idx ? { ...im, value: val } : im,
                              ),
                            }));
                          }}
                          placeholder="https://example.com/image.png"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      ) : (
                        <div className="relative">
                          {img.value ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Image
                                src={img.value}
                                alt="Preview"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                unoptimized
                              />
                              <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                                ✔️ File Terpilih
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    images: prev.images.map((im, i) =>
                                      i === idx ? { ...im, value: "" } : im,
                                    ),
                                  }))
                                }
                                className="text-[10px] text-red-500 font-medium ml-auto hover:underline"
                              >
                                Ganti File
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const val = reader.result as string;
                                    setForm((prev) => ({
                                      ...prev,
                                      images: prev.images.map((im, i) =>
                                        i === idx ? { ...im, value: val } : im,
                                      ),
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer w-full"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Tambah Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
