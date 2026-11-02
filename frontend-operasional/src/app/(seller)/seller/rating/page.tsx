"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  Store,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ChevronRight,
  User,
  Calendar,
  X,
} from "lucide-react";
import Image from "next/image";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SortDropdown } from "@/components/ecommerce/SortDropdown";
import { storesApi, productsApi, reviewsApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";

interface ReviewItem {
  id: string;
  rating: number;
  ulasan: string | null;
  fotoUrl: string | null;
  isHidden: boolean;
  createdAt: string;
  pengguna: {
    id: string;
    nama: string;
  };
  produk: {
    id: string;
    nama: string;
    gambarUrl: string | null;
  };
  statusLaporan?: string;
}

interface ProductItem {
  id: string;
  nama: string;
  gambarUrl?: string;
  rating: number;
  terjual?: number;
  category?: { nama: string };
  ulasanCount?: number;
}

export default function SellerRatingPage() {
  // Tabs: 'products' | 'reviews'
  const [activeTab, setActiveTab] = useState<"products" | "reviews">(
    "products",
  );

  // Data State
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [_reviewPage, _setReviewPage] = useState(1);
  const [_totalReviewCount, _setTotalReviewCount] = useState(0);

  // Fetch initial store details and reviews
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch store profile
        const storeRes = await storesApi.getMyStore();
        const storeData =
          extractArray<any>(storeRes)[0] ||
          storeRes?.data?.data ||
          storeRes?.data;
        if (!storeData || storeData.error) {
          throw new Error(
            "Toko Anda tidak ditemukan. Harap pastikan Anda telah terdaftar sebagai Seller.",
          );
        }
        setStore(storeData);

        // 2. Fetch products under the store
        const prodRes = await productsApi.getAllByStore(storeData.id);
        const dataArray = extractArray<any>(prodRes);

        // 3. Fetch reviews for store (FIXED using robust extractArray helper)
        const reviewsRes = await reviewsApi.getSellerReviews({
          page: 1,
          limit: 100,
        });
        const fetchedReviews = extractArray<ReviewItem>(reviewsRes);
        setReviews(fetchedReviews);
        _setTotalReviewCount(
          reviewsRes?.data?.data?.total ||
            reviewsRes?.data?.total ||
            fetchedReviews.length,
        );

        // 4. Map reviews to products to compute real-time counts
        const mappedProducts = dataArray.map((p: any) => {
          const productReviews = fetchedReviews.filter(
            (r: any) => r.produk?.id === p.id,
          );
          const totalRating = productReviews.reduce(
            (sum: number, r: any) => sum + r.rating,
            0,
          );
          return {
            id: p.id,
            nama: p.nama?.replace(" - ", " "),
            gambarUrl: p.gambarUrl,
            rating:
              p.rating ||
              (productReviews.length > 0
                ? Number((totalRating / productReviews.length).toFixed(1))
                : 0),
            category: p.kategori || p.category,
            terjual: p.terjual || 0,
            ulasanCount: productReviews.length,
          };
        });
        setProducts(mappedProducts);
      } catch (err: any) {
        console.error("Error fetching seller ratings data:", err);
        setError(err.message || "Gagal memuat data rating.");
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // Filtered reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Product Filter
      const matchesProduct =
        !selectedProductId || r.produk?.id === selectedProductId;

      // Star Filter
      const matchesStar = starFilter === "all" || r.rating === starFilter;

      // Search Filter
      const matchesSearch =
        !searchText ||
        (r.ulasan &&
          r.ulasan.toLowerCase().includes(searchText.toLowerCase())) ||
        (r.pengguna?.nama &&
          r.pengguna.nama.toLowerCase().includes(searchText.toLowerCase())) ||
        (r.produk?.nama?.replace(" - ", " ") &&
          r.produk.nama
            ?.replace(" - ", " ")
            .toLowerCase()
            .includes(searchText.toLowerCase()));

      return matchesProduct && matchesStar && matchesSearch;
    });
  }, [reviews, selectedProductId, starFilter, searchText]);

  // Selected product object
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Helper for rendering star SVGs
  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const floor = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;

    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-amber-400 fill-amber-400"
          />,
        );
      } else if (i === floor + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star size={size} className="text-gray-200 fill-gray-200" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={size} className="text-amber-400 fill-amber-400" />
            </div>
          </div>,
        );
      } else {
        stars.push(
          <Star key={i} size={size} className="text-gray-200 fill-gray-200" />,
        );
      }
    }
    return <div className="flex gap-0.5 items-center">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600/80 animate-spin" />
        <p className="text-slate-400 font-medium text-xs animate-pulse">
          Memuat Ulasan & Rating Toko...
        </p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="bg-rose-50/50 text-rose-700 p-6 rounded-2xl flex items-center gap-3 border border-rose-100 max-w-2xl mx-auto mt-10">
        <AlertCircle size={20} className="text-rose-500 shrink-0" />
        <div className="space-y-0.5">
          <h3 className="font-medium text-sm text-rose-800">
            Error Memuat Data
          </h3>
          <p className="text-xs text-rose-600/95 font-medium">
            {error || "Data toko tidak tersedia."}
          </p>
        </div>
      </div>
    );
  }

  // Calculate store average rating
  const averageStoreRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
        )
      : 0;

  return (
    <div className="w-full space-y-8 animate-fade-in font-sans">
      {/* Page Header and Overall Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pb-2 border-b border-slate-100">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-800 tracking-tight flex items-center gap-3">
            <Store className="text-emerald-600" size={24} /> Rating & Ulasan
            Toko
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Pantau reputasi produk, kepuasan konsumen, dan ulasan transaksi di
            toko Anda.
          </p>
        </div>

        {/* Global Rating Stats Widget */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Star
              className="fill-emerald-500 stroke-emerald-500 text-emerald-500"
              size={20}
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl font-medium text-slate-800 leading-none">
                {averageStoreRating || "0.0"}
              </span>
              <span className="text-[10px] text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(averageStoreRating, 11)}
              <span className="text-[10px] font-medium text-slate-400">
                ({reviews.length} Ulasan)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher and Global Filters */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
        {activeTab === "reviews" ? (
          <button
            onClick={() => {
              setActiveTab("products");
              setSelectedProductId(null);
              setStarFilter("all");
              setSearchText("");
            }}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm"
          >
            <ChevronRight size={16} className="rotate-180" /> Kembali ke Daftar
            Produk
          </button>
        ) : (
          <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <ShoppingBag size={16} /> Daftar Rating Produk
          </div>
        )}

        {/* Global Review Filters (Visible only when in reviews tab) */}
        {activeTab === "reviews" && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Cari ulasan / pembeli..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white shadow-sm"
              />
            </div>

            <div className="w-full sm:w-auto flex shrink-0">
              <SortDropdown
                value={starFilter.toString()}
                onChange={(val) =>
                  setStarFilter(val === "all" ? "all" : Number(val))
                }
                options={[
                  { value: "all", label: "Semua Bintang" },
                  { value: "5", label: "5 Bintang" },
                  { value: "4", label: "4 Bintang" },
                  { value: "3", label: "3 Bintang" },
                  { value: "2", label: "2 Bintang" },
                  { value: "1", label: "1 Bintang" },
                ]}
              />
            </div>

            {(selectedProductId || starFilter !== "all" || searchText) && (
              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setStarFilter("all");
                  setSearchText("");
                }}
                className="text-[10px] font-medium text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-100 px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Reset <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB CONTENT: PRODUCTS LIST */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl py-20 text-center border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100/50 text-slate-300">
                <ShoppingBag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-700 font-medium text-base">
                  Belum Ada Produk
                </h3>
                <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                  Toko Anda belum memiliki produk aktif di etalase.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-100/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 group"
                >
                  <div className="flex gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {p.gambarUrl ? (
                        <Image
                          src={p.gambarUrl}
                          alt={p.nama?.replace(" - ", " ")}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-350 bg-white">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                        {p.category?.nama || "Pertanian"}
                      </span>
                      <h3 className="font-medium text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors truncate">
                        {p.nama?.replace(" - ", " ")}
                      </h3>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {renderStars(p.rating, 11)}
                        <span className="text-xs font-medium text-slate-700">
                          {p.rating || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 text-xs">
                    <div className="text-slate-400 space-y-0.5 font-medium">
                      <div>
                        Terjual:{" "}
                        <span className="font-medium text-slate-700">
                          {p.terjual}
                        </span>
                      </div>
                      <div>
                        Total Ulasan:{" "}
                        <span className="font-medium text-slate-700">
                          {p.ulasanCount || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setStarFilter("all");
                        setActiveTab("reviews");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-650 text-slate-500 font-medium transition-all flex items-center gap-1 border border-slate-100 hover:border-emerald-100 shrink-0"
                    >
                      Ulasan <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS STREAM */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Product Focus Banner */}
          {selectedProductId && selectedProduct && (
            <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100/50 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-medium text-emerald-700 uppercase tracking-wider">
                  Fokus Produk
                </span>
                <button
                  onClick={() => {
                    setSelectedProductId(null);
                    setActiveTab("products");
                  }}
                  className="text-slate-400 hover:text-slate-650"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex gap-3">
                <div className="relative w-9 h-9 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                  {selectedProduct.gambarUrl ? (
                    <Image
                      src={selectedProduct.gambarUrl}
                      alt={selectedProduct.nama?.replace(" - ", " ")}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-350 bg-white">
                      <ShoppingBag size={12} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="font-medium text-slate-750 text-xs truncate">
                    {selectedProduct.nama?.replace(" - ", " ")}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderStars(selectedProduct.rating, 9)}
                    <span className="text-[10px] font-medium text-slate-500">
                      ({selectedProduct.rating})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Reviews List Stream */}
          <div className="space-y-4 relative z-0">
            {/* Focus / Filter Active Indicators */}
            {selectedProductId && selectedProduct && (
              <div className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Menampilkan ulasan khusus produk:{" "}
                    <span className="font-medium text-emerald-755">
                      {selectedProduct.nama?.replace(" - ", " ")}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProductId(null);
                    setActiveTab("products");
                  }}
                  className="px-3 py-1.5 text-[10px] font-medium bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:text-emerald-650 transition-colors"
                >
                  Kembali
                </button>
              </div>
            )}

            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 bg-slate-100/50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-700 font-medium text-base">
                    Tidak Ada Ulasan
                  </h3>
                  <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                    Tidak ditemukan ulasan yang sesuai dengan filter pencarian
                    Anda.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review, index) => (
                  <div
                    key={review?.id || `review-${index}`}
                    className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
                  >
                    {/* User and Rating Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50/50 text-emerald-600 border border-emerald-100/40 flex items-center justify-center shrink-0">
                          <User size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-medium text-slate-800 text-sm leading-none">
                            {review.pengguna?.nama || "Anonim"}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Calendar size={11} />
                            <span>
                              {new Date(review.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stars badge */}
                      <div className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-100/50 px-2.5 py-1 rounded-xl shrink-0">
                        {renderStars(review.rating, 10)}
                        <span className="text-xs font-medium text-amber-700">
                          {review.rating}
                        </span>
                      </div>
                    </div>

                    {/* Review text */}
                    {review.ulasan ? (
                      <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/30 p-3.5 rounded-2xl border border-slate-50 font-medium italic">
                        &ldquo;{review.ulasan}&rdquo;
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs italic font-medium pl-1">
                        Konsumen memberikan rating tanpa komentar tertulis.
                      </p>
                    )}

                    {/* Reviewed Product Info Block */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50 text-xs bg-slate-50/20 p-3 rounded-2xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0">
                          {review.produk?.gambarUrl ? (
                            <Image
                              src={review.produk.gambarUrl}
                              alt={review.produk.nama?.replace(" - ", " ")}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBag size={12} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-medium block uppercase tracking-wider">
                            Produk Yang Diulas
                          </span>
                          <span className="font-medium text-slate-700 truncate block">
                            {review.produk?.nama?.replace(" - ", " ") ||
                              "Produk"}
                          </span>
                        </div>
                      </div>

                      {/* Reported Badge */}
                      {review.statusLaporan && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border shrink-0 ${
                            review.statusLaporan === "REPORTED"
                              ? "bg-amber-50 text-amber-600 border-amber-100/50"
                              : review.statusLaporan === "TAKEDOWN_APPROVED"
                                ? "bg-red-50 text-red-500 border-red-100/50"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                          }`}
                        >
                          {review.statusLaporan === "REPORTED"
                            ? "Dilaporkan"
                            : review.statusLaporan === "TAKEDOWN_APPROVED"
                              ? "Ditakedown"
                              : "Takedown Ditolak"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
