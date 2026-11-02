"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Loader2,
  MessageCircle,
  LayoutGrid,
  Tags,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  ShoppingBag,
  Package,
  Store,
} from "lucide-react";
import Image from "next/image";

import { storesApi, productsApi, chatApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import ProductCard from "@/src/components/ecommerce/ProductCard";
import type { EcomProduct } from "@/types";
import { StoreDetailSkeleton } from "@/src/components/ecommerce/Skeleton";
import EmptyState from "@/src/components/ecommerce/EmptyState";

interface StoreData {
  id?: string;
  nama?: string;
  foto?: string;
  banner?: string;
  kabupaten?: string;
  wilayah?: string;
  rating?: number;
  totalPenjualan?: number;
  deskripsi?: string;
  alamat?: string;
  jamOperasional?: string;
}

const DetailTokoPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [store, setStore] = useState<StoreData | null>(null);
  const [storeProducts, setStoreProducts] = useState<EcomProduct[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products",
  );
  const [prevTab, setPrevTab] = useState<"products" | "categories">("products");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [sliding, setSliding] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const slideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth accordion: measure real content height
  const infoContentRef = useRef<HTMLDivElement>(null);
  const [infoHeight, setInfoHeight] = useState(0);

  const measureInfo = useCallback(() => {
    if (infoContentRef.current) {
      setInfoHeight(infoContentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (isAboutOpen) {
      measureInfo();
    }
  }, [isAboutOpen, measureInfo]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [storeRes, productsRes] = await Promise.all([
          storesApi.getById(id),
          productsApi.getByStore(id),
        ]);
        setStore(storeRes.data?.data || storeRes.data);
        const productsData =
          productsRes.data?.data?.data ||
          productsRes.data?.data ||
          productsRes.data;
        setStoreProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Failed to fetch store details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStoreData();
  }, [id]);

  const availableCategories = useMemo(() => {
    const catsMap = new Map<
      string,
      { id_kategoriToko: string; nama: string; count: number }
    >();
    storeProducts.forEach((p) => {
      const catId = p.kategoriId || "uncategorized";
      const catNama = p.kategoriNama || "Lainnya";
      if (catsMap.has(catId)) {
        const existing = catsMap.get(catId)!;
        catsMap.set(catId, { ...existing, count: existing.count + 1 });
      } else {
        catsMap.set(catId, { id_kategoriToko: catId, nama: catNama, count: 1 });
      }
    });
    return Array.from(catsMap.values()).sort((a, b) => b.count - a.count);
  }, [storeProducts]);

  const selectedCategoryNama = useMemo(() => {
    if (!selectedCategoryId) return null;
    return (
      availableCategories.find((c) => c.id_kategoriToko === selectedCategoryId)
        ?.nama || "Kategori"
    );
  }, [selectedCategoryId, availableCategories]);

  const filteredProducts = useMemo(() => {
    let result = storeProducts;
    if (selectedCategoryId) {
      result = result.filter((p) => p.kategoriId === selectedCategoryId);
    }

    if (sortOrder === "asc") {
      result = [...result].sort((a, b) => (a.harga || 0) - (b.harga || 0));
    } else if (sortOrder === "desc") {
      result = [...result].sort((a, b) => (b.harga || 0) - (a.harga || 0));
    }

    return result;
  }, [selectedCategoryId, storeProducts, sortOrder]);

  const handleTabChange = (tab: "products" | "categories") => {
    if (tab === activeTab || sliding) return;
    setPrevTab(activeTab);
    setSliding(true);
    if (slideTimeout.current) clearTimeout(slideTimeout.current);
    slideTimeout.current = setTimeout(() => {
      setActiveTab(tab);
      setSliding(false);
    }, 220);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    handleTabChange("products");
  };

  const handleClearFilter = () => {
    setSelectedCategoryId(null);
    handleTabChange("categories");
  };

  const handleChatSeller = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().openLoginModal();
      return;
    }
    setChatLoading(true);
    try {
      const res = await chatApi.createConversation({
        type: "SELLER_CHAT",
        tokoId: id,
      });
      const conv = res.data?.data || res.data;
      if (conv?.id) router.push(`/chat/${conv.id}`);
    } catch {
      alert("Gagal memulai chat dengan seller");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <StoreDetailSkeleton />;
  if (!store) {
    return (
      <div className="pt-20">
        <EmptyState
          title="Toko Tidak Ditemukan"
          description="Maaf, toko yang Anda cari tidak ada atau mungkin sudah ditutup."
          illustration="empty-store.svg"
          actionLabel="Kembali ke Daftar Toko"
          onAction={() => router.push("/toko")}
        />
      </div>
    );
  }

  // Sliding direction: going to 'categories' = slide left, back to 'products' = slide right
  const goingRight = activeTab === "products" && prevTab === "categories";
  const slideOutClass = sliding
    ? goingRight
      ? "translate-x-full opacity-0"
      : "-translate-x-full opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO HEADER ───────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-primary-300/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 px-4 pt-4 pb-16">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90 border border-white/10"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="flex items-center gap-1.5 pl-3 pr-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-semibold transition-all border border-white/10 active:scale-95"
            >
              <Info size={14} />
              Info
              {isAboutOpen ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>
          </div>

          {/* Store identity */}
          <div className="flex items-center gap-4">
            <div className="relative w-[72px] h-[72px] rounded-3xl overflow-hidden bg-white/10 border-2 border-white/20 flex-shrink-0 shadow-xl">
              {store.foto ? (
                <Image
                  src={store.foto}
                  alt={store.nama || "Toko"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Store size={32} className="text-white/80" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg leading-tight truncate">
                {store.nama}
              </h1>
              <p className="text-primary-100 text-xs flex items-center gap-1 mt-1">
                <MapPin size={11} className="opacity-70 flex-shrink-0" />
                {store.kabupaten}
              </p>
              <div className="flex items-center gap-2.5 mt-2.5 text-[11px] sm:text-xs">
                {/* rating */}
                <div className="flex items-center gap-1 text-white">
                  <Star
                    size={12}
                    fill="currentColor"
                    className="text-amber-400"
                  />
                  <span className="font-bold">{store.rating || 0}</span>
                </div>

                <div className="w-px h-3 bg-white/30" />

                {/* stats */}
                <div className="text-white/90">
                  <span className="font-bold text-white">
                    {storeProducts.length}
                  </span>{" "}
                  Produk
                </div>

                <div className="w-px h-3 bg-white/30" />

                <div className="text-white/90">
                  <span className="font-bold text-white">
                    {(store.totalPenjualan || 0).toLocaleString()}
                  </span>{" "}
                  Terjual
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible info panel — smooth measured height */}
          <div
            style={{
              height: isAboutOpen ? infoHeight : 0,
              overflow: "hidden",
              transition:
                "height 360ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease, margin-top 300ms ease",
              opacity: isAboutOpen ? 1 : 0,
              marginTop: isAboutOpen ? "1.25rem" : "0",
            }}
          >
            <div ref={infoContentRef}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 space-y-4 shadow-sm">
                <p className="text-sm text-white/90 leading-relaxed">
                  {store.deskripsi ||
                    "Selamat datang! Kami berkomitmen memberikan produk pertanian terbaik untuk Anda."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-transparent border border-white/20 rounded-2xl p-3">
                    <MapPin
                      size={14}
                      className="text-primary-200 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[9px] text-primary-200 uppercase font-bold tracking-widest">
                        Alamat
                      </p>
                      <p className="text-xs font-medium leading-snug">
                        {store.alamat || store.kabupaten}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-transparent border border-white/20 rounded-2xl p-3">
                    <Clock
                      size={14}
                      className="text-primary-200 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[9px] text-primary-200 uppercase font-bold tracking-widest">
                        Jam Buka
                      </p>
                      <p className="text-xs font-medium leading-snug">
                        {store.jamOperasional || "08:00 – 17:00"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleChatSeller}
                  disabled={chatLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/25 border border-white/40 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {chatLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                  Chat dengan Penjual
                </button>
              </div>
            </div>{" "}
            {/* end infoContentRef wrapper */}
          </div>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────── */}
      <div className="px-5 -mt-6 rounded-t-3xl bg-white relative z-20 min-h-[50vh]">
        {/* Tab Header / Filter Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 rounded-t-3xl overflow-hidden border-b border-gray-100 mx-[-20px] px-5">
          {selectedCategoryId ? (
            <div className="flex items-center gap-4 py-4 px-1 animate-in slide-in-from-left-4 duration-300">
              <button
                onClick={handleClearFilter}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                title="Kembali ke Kategori"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-base font-semibold text-gray-900 leading-none">
                  {selectedCategoryNama}
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex">
              {(["products", "categories"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200 relative ${
                      isActive
                        ? "text-primary-700"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "products" ? (
                      <LayoutGrid size={16} />
                    ) : (
                      <Tags size={16} />
                    )}
                    {tab === "products" ? "Semua Produk" : "Kategori"}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-600 rounded-full transition-all duration-200" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sliding tab content */}
        <div className="overflow-hidden">
          <div
            className={`transition-all duration-220 ease-in-out ${slideOutClass}`}
            style={{ willChange: "transform, opacity" }}
          >
            <div className="py-5">
              {activeTab === "products" ? (
                /* Products Grid */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">
                        Etalase Toko ({filteredProducts.length} Produk)
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) =>
                          setSortOrder(
                            e.target.value as "none" | "asc" | "desc",
                          )
                        }
                        className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-6 py-1.5 outline-none focus:ring-1 focus:ring-primary-400 appearance-none cursor-pointer"
                      >
                        <option value="none">Urutkan</option>
                        <option value="asc">Harga Terendah</option>
                        <option value="desc">Harga Tertinggi</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id_produk}
                          product={product}
                          hideCartOnMobile={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        title="Belum Ada Produk"
                        description="Toko ini belum menambahkan produk ke etalase."
                        illustration="empty-search.svg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Categories List */
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tags size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">
                      Kategori Tersedia
                    </span>
                  </div>

                  {availableCategories.length > 0 ? (
                    <div className="space-y-2.5">
                      {availableCategories.map((cat, idx) => (
                        <button
                          key={cat.id_kategoriToko}
                          onClick={() =>
                            handleSelectCategory(cat.id_kategoriToko)
                          }
                          className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary-50 border border-transparent hover:border-primary-100 rounded-2xl transition-all group text-left active:scale-[0.98]"
                        >
                          <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform border border-gray-100">
                            {
                              ["🌿", "🥦", "🍅", "🌽", "🥕", "🍃", "🫛", "🧅"][
                                idx % 8
                              ]
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">
                              {cat.nama}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {cat.count} produk tersedia
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                            <ChevronRight
                              size={15}
                              className="text-gray-400 group-hover:text-primary-600"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        title="Kategori Kosong"
                        description="Toko ini belum memiliki kategori produk."
                        illustration="empty-search.svg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTokoPage;
