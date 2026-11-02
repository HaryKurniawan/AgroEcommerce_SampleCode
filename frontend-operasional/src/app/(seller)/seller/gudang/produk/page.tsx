"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  CheckCircle2,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import { gudangApi, storesApi } from "@/lib/ecommerce-api";

const FAVORITE_KEY = "seller_gudang_favorit";
const CART_KEY = "pengajuan_cart";

interface CartStorage {
  gudangId: string;
  items: {
    produkGudangId: string;
    jumlahPermintaan: number;
    ukuranKemasanKg: number;
    jumlahKemasan: number;
  }[];
}

interface GudangData {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  kapasitas: number;
}

interface AffiliationData {
  id: string;
  tokoId: string;
  gudangId: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  gudang: GudangData | null;
}

interface Product {
  id: string;
  nama: string;
  varianProduk?: string | null;
  deskripsi?: string;
  satuan: string;
  hargaGudang: number;
  minimalPembelianKg?: number;
  gambarUrl?: string;
  createdAt: string;
}

interface ProductWithGudang extends Product {
  gudangId: string;
  gudangNama: string;
}

const FALLBACK_WAREHOUSES: Record<
  string,
  { nama: string; alamat: string; telepon: string }
> = {
  "8ecaddc3-85d3-4715-9490-35158899f441": {
    nama: "Gudang Utama Agro Jabar",
    alamat: "Jl. Soekarno Hatta No.10, Bandung",
    telepon: "081122334455",
  },
};

export default function SellerWarehouseProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // gudangId dari query param (misal klik "Lihat Produk" dari daftar gudang)
  const qGudangId = searchParams.get("gudangId") || null;

  const [affiliations, setAffiliations] = useState<AffiliationData[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithGudang[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithGudang[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGudangFilter, setSelectedGudangFilter] =
    useState<string>("all");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<ProductWithGudang[]>([]);

  // Restore cart dari localStorage setelah produk dimuat
  // (dihandle di fetchAllProducts)

  // Baca favorit dari localStorage saat pertama load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_KEY);
      if (saved) setFavoriteId(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Tentukan filter default setelah affiliations & favorit diketahui
  // Prioritas: query param > favorit > 'all'
  useEffect(() => {
    if (affiliations.length === 0) return;
    if (qGudangId && affiliations.some((a) => a.gudangId === qGudangId)) {
      setSelectedGudangFilter(qGudangId);
    } else if (
      favoriteId &&
      affiliations.some((a) => a.gudangId === favoriteId)
    ) {
      setSelectedGudangFilter(favoriteId);
    }
    // else tetap 'all'
  }, [affiliations, favoriteId, qGudangId]);

  const toggleCart = (product: ProductWithGudang) => {
    setError("");
    setCart((prev) => {
      let next: ProductWithGudang[];
      const exists = prev.some(
        (p) => p.id === product.id && p.gudangId === product.gudangId,
      );
      if (exists) {
        next = prev.filter(
          (p) => !(p.id === product.id && p.gudangId === product.gudangId),
        );
      } else {
        if (prev.length > 0 && prev[0].gudangId !== product.gudangId) {
          setError(
            "Satu pengajuan hanya boleh dari satu gudang. Kosongkan daftar terlebih dahulu.",
          );
          setTimeout(() => setError(""), 3500);
          return prev;
        }
        next = [...prev, product];
      }
      // Sync ke localStorage
      try {
        if (next.length === 0) {
          localStorage.removeItem(CART_KEY);
        } else {
          localStorage.setItem(
            CART_KEY,
            JSON.stringify({
              gudangId: next[0].gudangId,
              items: next.map((p) => {
                const minKg = p.minimalPembelianKg ?? 300;
                return {
                  produkGudangId: p.id,
                  jumlahPermintaan: minKg,
                  ukuranKemasanKg: 1.0,
                  jumlahKemasan: minKg,
                };
              }),
            }),
          );
        }
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isInCart = (product: ProductWithGudang) =>
    cart.some((p) => p.id === product.id && p.gudangId === product.gudangId);

  const handleLanjutPengajuan = () => {
    if (cart.length === 0) return;
    const gId = cart[0].gudangId;
    // Simpan draft ke sessionStorage juga agar baru/page bisa merge
    sessionStorage.setItem(
      "pengajuan_draft",
      JSON.stringify({ gudangId: gId, produkIds: cart.map((p) => p.id) }),
    );
    router.push(`/seller/pengajuan-stok/baru?gudangId=${gId}`);
  };

  const getGudangDetails = (item: AffiliationData) => {
    if (item.gudang) return { nama: item.gudang.nama, isOffline: false };
    const fallback = FALLBACK_WAREHOUSES[item.gudangId];
    return {
      nama: fallback?.nama || "Gudang Regional Agro Jabar",
      isOffline: true,
    };
  };

  const fetchAffiliations = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const storeRes = await storesApi.getMyStore();
      const storeData = storeRes?.data?.data || storeRes?.data;
      if (!storeData?.id) {
        setError("Profil toko Anda tidak dapat ditemukan.");
        setLoading(false);
        return;
      }

      let warehouseData: any[] = [];
      try {
        const whRes = await gudangApi.getAllWarehousesForMarketplace();
        const rawData = whRes?.data?.data || whRes?.data || [];
        warehouseData = Array.isArray(rawData) ? rawData : [];
      } catch {
        warehouseData = Object.entries(FALLBACK_WAREHOUSES).map(
          ([id, info]) => ({ id, ...info }),
        );
      }

      const affData: AffiliationData[] = warehouseData.map((wh: any) => ({
        id: `marketplace-${wh.id}`,
        tokoId: storeData.id,
        gudangId: wh.id,
        status: "ACTIVE" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        gudang: {
          id: wh.id,
          nama: wh.nama,
          alamat: wh.alamat,
          telepon: wh.telepon || "-",
          kapasitas: wh.kapasitas || 0,
        },
      }));

      setAffiliations(affData);
      await fetchAllProducts(affData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data gudang.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllProducts = async (affData: AffiliationData[]) => {
    if (affData.length === 0) {
      setAllProducts([]);
      return;
    }
    const promises = affData.map(async (aff) => {
      try {
        const res = await gudangApi.getProductsForRequest(aff.gudangId);
        const responseData =
          res?.data?.data?.data || res?.data?.data || res?.data || {};
        const prods = responseData.products || [];
        const { nama: gudangNama } = getGudangDetails(aff);
        return prods.map((p: Product) => ({
          ...p,
          gudangId: aff.gudangId,
          gudangNama,
        }));
      } catch {
        return [];
      }
    });
    const arrays = await Promise.all(promises);
    const allProds: ProductWithGudang[] = arrays.flat();
    setAllProducts(allProds);

    // Restore cart dari localStorage
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CartStorage;
        if (saved?.gudangId && saved?.items?.length > 0) {
          const restored = saved.items
            .map((it) =>
              allProds.find(
                (p) =>
                  p.id === it.produkGudangId && p.gudangId === saved.gudangId,
              ),
            )
            .filter((p): p is ProductWithGudang => !!p);
          if (restored.length > 0) {
            setCart(restored);
          }
        }
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchAffiliations();
  }, [fetchAffiliations]);

  // Apply filter
  useEffect(() => {
    let filtered = allProducts;
    if (selectedGudangFilter !== "all") {
      filtered = filtered.filter((p) => p.gudangId === selectedGudangFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nama?.replace(" - ", " ").toLowerCase().includes(q) ||
          p.varianProduk?.toLowerCase().includes(q) ||
          p.gudangNama.toLowerCase().includes(q),
      );
    }
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts, selectedGudangFilter]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Memuat daftar produk...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Scrollable Content ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-6 md:p-8 space-y-5 max-w-6xl mx-auto w-full">
          {/* ── Header ─── */}
          <div className="flex flex-col gap-4 pb-4 mb-2 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Daftar Produk Gudang
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Minimal total pembelian 300 kg
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Filter chips gudang */}
          {affiliations.length > 1 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                onClick={() => setSelectedGudangFilter("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                  selectedGudangFilter === "all"
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                Semua
              </button>
              {affiliations.map((aff) => {
                const { nama } = getGudangDetails(aff);
                const isFav = aff.gudangId === favoriteId;
                const isActive = selectedGudangFilter === aff.gudangId;
                return (
                  <button
                    key={aff.gudangId}
                    onClick={() => setSelectedGudangFilter(aff.gudangId)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1 ${
                      isActive
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                    }`}
                  >
                    {isFav && (
                      <Star
                        className={`w-2.5 h-2.5 shrink-0 ${isActive ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400"}`}
                      />
                    )}
                    {nama}
                  </button>
                );
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Grid Produk */}
          {allProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-slate-700">
                Belum Ada Produk
              </h3>
              <p className="text-xs text-slate-400">
                Belum ada produk tersedia dari gudang.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-amber-50/40 border border-amber-100/70 p-5 rounded-2xl flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <h3 className="font-medium text-sm text-amber-900">
                  Tidak Ada Produk
                </h3>
                <p className="text-xs mt-1 text-amber-700/90">
                  {searchQuery
                    ? "Tidak ada produk yang sesuai pencarian."
                    : "Tidak ada produk untuk filter yang dipilih."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={`${product.id}-${product.gudangId}`}
                  className="bg-white rounded-2xl border border-slate-300 overflow-hidden transition-all flex flex-col cursor-pointer group hover:border-slate-400"
                >
                  {/* Foto */}
                  <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {product.gambarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.gambarUrl}
                        alt={product.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-300 z-0 bg-slate-100">
                      <ImageIcon className="w-10 h-10 opacity-50" />
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-3.5 flex flex-col flex-1 gap-0.5">
                    <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug">
                      {product.nama}
                      {product.varianProduk && ` ${product.varianProduk}`}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="font-semibold text-base text-primary-600">
                        Rp {product.hargaGudang.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        / {product.satuan}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleCart(product)}
                      className={`mt-auto w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                        isInCart(product)
                          ? "border border-primary-500 text-primary-600 bg-white hover:bg-primary-50"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      }`}
                    >
                      {isInCart(product) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ditambahkan
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Tambah ke Daftar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Bar — selalu di bawah ────────────────────────────────────── */}
      {cart.length > 0 && (
        <div className="shrink-0 px-6 md:px-8 pb-4 pt-3">
          <div className="bg-primary-600 text-white rounded-2xl p-3.5 flex items-center justify-between gap-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 relative">
                <Package className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-primary-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {cart.length} produk siap diajukan
                </p>
                <p className="text-[11px] text-primary-50/80 truncate">
                  Dari {cart[0].gudangNama}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCart([]);
                  try {
                    localStorage.removeItem(CART_KEY);
                  } catch {
                    /* ignore */
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-primary-50/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Kosongkan
              </button>
              <button
                onClick={handleLanjutPengajuan}
                className="px-5 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                Lanjut Ajukan
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
