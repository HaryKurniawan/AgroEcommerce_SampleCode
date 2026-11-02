"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  ShieldAlert,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  ShoppingBag,
  Trash2,
  CheckCircle,
  EyeOff,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

import { SortDropdown } from "@/components/ecommerce/SortDropdown";
import { reviewsApi, productsApi } from "@/lib/ecommerce-api";

interface ReviewItem {
  id: string;
  rating: number;
  ulasan: string | null;
  fotoUrl: string | null;
  isHidden: boolean;
  createdAt: string;
  statusLaporan: string | null;
  alasanLaporan: string | null;
  dilaporkanPada: string | null;
  pengguna: {
    id: string;
    nama: string;
  };
  produk: {
    id: string;
    nama: string;
    gambarUrl: string | null;
  };
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

export default function AdminRatingPage() {
  const [activeTab, setActiveTab] = useState<"products" | "reviews">(
    "products",
  );

  // Data State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filtering States
  const [searchText, setSearchText] = useState("");
  const [showOnlyReported, setShowOnlyReported] = useState(false);
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // Takedown Confirmation Modal State
  const [confirmingTakedownId, setConfirmingTakedownId] = useState<
    string | null
  >(null);
  const [takedownLoading, setTakedownLoading] = useState(false);

  // Derived: safely compute reported count from confirmed array
  const reportedCount = useMemo(() => {
    if (!Array.isArray(reviews)) return 0;
    return reviews.filter((r) => r.statusLaporan === "REPORTED").length;
  }, [reviews]);

  // Fetch initial data
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        setError(null);

        const [prodRes, reviewsRes] = await Promise.all([
          productsApi.getAll({ limit: 500 }),
          reviewsApi.adminGetAllReviews({ limit: 1000 }),
        ]);

        // Backend wraps response via TransformInterceptor:
        // axios res.data → { success, data: { data: [...], total, page }, timestamp }
        // So the actual array is at res.data.data.data
        const rawProducts =
          prodRes?.data?.data?.data ||
          prodRes?.data?.data ||
          prodRes?.data ||
          [];
        const rawReviews =
          reviewsRes?.data?.data?.data ||
          reviewsRes?.data?.data ||
          reviewsRes?.data ||
          [];

        const fetchedReviews: ReviewItem[] = (
          Array.isArray(rawReviews) ? rawReviews : []
        ).map((r: any) => ({
          ...r,
          id: r.id || r.id_ulasanProduk,
          pengguna: {
            ...r.pengguna,
            id: r.pengguna?.id || r.pengguna?.id_pengguna,
          },
          produk: {
            ...r.produk,
            id: r.produk?.id || r.produk?.id_produk,
          },
        }));

        setReviews(fetchedReviews);

        const fetchedProducts = (
          Array.isArray(rawProducts) ? rawProducts : []
        ).map((p: any) => {
          const productReviews = fetchedReviews.filter(
            (r: any) => r.produk?.id === (p.id || p.id_produk),
          );
          const totalRating = productReviews.reduce(
            (sum: number, r: any) => sum + r.rating,
            0,
          );

          return {
            id: p.id || p.id_produk,
            nama: p.nama?.replace(" - ", " "),
            gambarUrl: p.gambarUrl || p.gambar,
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

        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching admin ratings data:", err);
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
      if (showOnlyReported && r.statusLaporan !== "REPORTED") return false;
      if (selectedProductId && r.produk?.id !== selectedProductId) return false;
      if (starFilter !== "all" && r.rating !== starFilter) return false;

      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        if (
          !r.ulasan?.toLowerCase().includes(lowerSearch) &&
          !r.pengguna?.nama?.toLowerCase().includes(lowerSearch) &&
          !r.produk?.nama?.toLowerCase().includes(lowerSearch)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, selectedProductId, starFilter, searchText, showOnlyReported]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const handleResetFilters = () => {
    setSearchText("");
    setStarFilter("all");
    setShowOnlyReported(false);
    setSelectedProductId(null);
  };

  const handleTakedownConfirm = async () => {
    if (!confirmingTakedownId) return;
    setTakedownLoading(true);
    try {
      await reviewsApi.adminTakedown(confirmingTakedownId);
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === confirmingTakedownId) {
            return {
              ...r,
              isHidden: true,
              statusLaporan: "TAKEDOWN_APPROVED",
            };
          }
          return r;
        }),
      );
      setConfirmingTakedownId(null);
    } catch (err: any) {
      console.error("Takedown error:", err);
      alert(err.message || "Gagal men-takedown ulasan.");
    } finally {
      setTakedownLoading(false);
    }
  };

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

  return (
    <div className="w-full p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6">
        <div>
          <h1 className="text-xl text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-[#10B981] stroke-[1.5]" size={24} />{" "}
            Audit Ulasan & Rating
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Auditing feedback dari konsumen, monitoring ulasan bermasalah, dan
            lakukan moderasi/takedown.
          </p>
        </div>

        {/* Global Stats Banner */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="block text-xl text-gray-800 leading-none">
              {reviews.length}
            </span>
            <span className="text-xs text-gray-400 mt-1">Total Ulasan</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="block text-xl text-rose-500 leading-none">
              {reportedCount}
            </span>
            <span className="text-xs text-gray-400 mt-1">Laporan Masuk</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
        <div className="flex items-center gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab("products");
              setSelectedProductId(null);
            }}
            className={`pb-3 text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
              activeTab === "products"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ShoppingBag size={16} className="stroke-[1.5]" /> Daftar Rating
            Produk
            {activeTab === "products" && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
              activeTab === "reviews"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <MessageSquare size={16} className="stroke-[1.5]" /> Semua Ulasan &
            Rating
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-900" />
            )}
          </button>
        </div>

        {/* Global Review Filters (Visible only when in reviews tab) */}
        {activeTab === "reviews" && (
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowOnlyReported(!showOnlyReported)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-normal border transition-all flex items-center gap-2 ${
                showOnlyReported
                  ? "bg-rose-50 border-rose-100 text-rose-700 shadow-sm"
                  : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle
                size={14}
                className={
                  showOnlyReported
                    ? "text-rose-600 animate-pulse"
                    : "text-gray-400"
                }
              />
              Hanya Ulasan Dilaporkan
            </button>

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
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-normal focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white shadow-sm"
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

            {(selectedProductId ||
              starFilter !== "all" ||
              searchText ||
              showOnlyReported) && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-normal text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-100 px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Reset <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-gray-400 font-normal">Memuat data audit...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 flex items-center gap-4 max-w-2xl mx-auto">
          <AlertCircle size={32} />
          <div>
            <h3 className="font-normal text-lg">Error Auditing</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === "products" && (
            <div className="space-y-6">
              {products.length === 0 ? (
                <div className="bg-white rounded-3xl py-20 text-center border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100/50 text-slate-300">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-slate-700 font-normal text-base">
                      Belum Ada Produk
                    </h3>
                    <p className="text-slate-400 text-xs font-normal max-w-xs mx-auto leading-relaxed">
                      Belum ada produk aktif di aplikasi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              alt={p.nama || "Produk"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBag size={20} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-normal text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                            {p.nama}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Star
                            size={16}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="font-normal text-slate-800 text-sm">
                            {p.rating || "0.0"}
                          </span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({p.ulasanCount || 0} Ulasan)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setActiveTab("reviews");
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-50 transition-colors shrink-0"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {selectedProduct && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedProductId(null);
                        setActiveTab("products");
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      <ChevronRight size={18} className="rotate-180" />
                    </button>
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                      <div className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        {selectedProduct.gambarUrl ? (
                          <Image
                            src={selectedProduct.gambarUrl}
                            alt={selectedProduct.nama || ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block mb-0.5">
                          Menampilkan Ulasan Untuk
                        </span>
                        <h2 className="font-normal text-slate-800 text-sm leading-tight line-clamp-1">
                          {selectedProduct.nama}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 border-l border-slate-100 pl-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                        <span className="font-normal text-slate-800">
                          {selectedProduct.rating || "0.0"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Rating Rata-rata
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-normal text-slate-800">
                        {selectedProduct.ulasanCount || 0}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Total Ulasan
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-24 text-center border border-gray-100 shadow-sm space-y-4">
                  <MessageSquare className="w-16 h-16 text-gray-100 mx-auto" />
                  <h3 className="text-gray-900 font-normal text-lg">
                    Tidak Ada Ulasan Ditemukan
                  </h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    Seluruh ulasan aman atau tidak ada data yang memenuhi
                    kriteria pencarian Anda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative ${
                        review.isHidden
                          ? "border-red-100/80 bg-red-50/[0.01]"
                          : review.statusLaporan === "REPORTED"
                            ? "border-amber-100 shadow-md shadow-amber-500/[0.01]"
                            : "border-gray-50 hover:border-gray-100"
                      }`}
                    >
                      {/* Flagged Banner */}
                      {review.statusLaporan === "REPORTED" &&
                        !review.isHidden && (
                          <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-normal uppercase tracking-widest text-center py-1.5 rounded-t-[22px] flex items-center justify-center gap-1.5 shadow-sm">
                            <AlertTriangle
                              size={11}
                              className="animate-bounce"
                            />{" "}
                            Review Dilaporkan Oleh Seller
                          </div>
                        )}

                      {/* Takedown Approved Banner */}
                      {review.isHidden && (
                        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[10px] font-normal uppercase tracking-widest text-center py-1.5 rounded-t-[22px] flex items-center justify-center gap-1.5 shadow-sm">
                          <EyeOff size={11} /> Ulasan Telah Ditakedown (Hidden)
                        </div>
                      )}

                      <div
                        className={
                          review.statusLaporan === "REPORTED" || review.isHidden
                            ? "pt-4"
                            : ""
                        }
                      />

                      {/* Reviewer Details and Stars */}
                      <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-start pt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-100 shadow-inner">
                              <User size={16} />
                            </div>
                            <div>
                              <h4 className="font-normal text-gray-900 text-sm">
                                {review.pengguna?.nama || "Pengguna"}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                <Calendar size={11} />
                                <span>
                                  {review.createdAt
                                    ? new Date(
                                        review.createdAt,
                                      ).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {renderStars(review.rating, 11)}
                            <span className="text-[10px] font-normal text-gray-400">
                              Rating: {review.rating}
                            </span>
                          </div>
                        </div>

                        {/* Review Text */}
                        {review.ulasan ? (
                          <p className="text-gray-700 text-xs leading-relaxed font-normal bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                            &ldquo;{review.ulasan}&rdquo;
                          </p>
                        ) : (
                          <p className="text-gray-400 text-[11px] italic pl-1">
                            Konsumen tidak memberikan komentar tertulis.
                          </p>
                        )}

                        {/* Flag Reason Panel */}
                        {review.statusLaporan === "REPORTED" &&
                          review.alasanLaporan && (
                            <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-2xl space-y-1">
                              <span className="text-[9px] uppercase font-normal text-amber-700 tracking-wider block">
                                Alasan Laporan Seller:
                              </span>
                              <p className="text-[11px] text-amber-800 leading-normal italic font-normal">
                                &ldquo;{review.alasanLaporan}&rdquo;
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Product and Action buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 max-w-[60%]">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                            {review.produk?.gambarUrl ? (
                              <Image
                                src={review.produk.gambarUrl}
                                alt={
                                  review.produk.nama?.replace(" - ", " ") || ""
                                }
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag size={12} />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] font-normal text-gray-400 uppercase tracking-widest block">
                              Produk
                            </span>
                            <span className="font-normal text-gray-800 text-[11px] line-clamp-1">
                              {review.produk?.nama?.replace(" - ", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {review.isHidden ? (
                            <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 font-normal text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle size={10} /> Sukses Takedown
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmingTakedownId(review.id)}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-normal text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <Trash2 size={13} /> Takedown
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Takedown Confirmation Modal */}
      {confirmingTakedownId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-gray-50 space-y-6 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-normal text-gray-900 text-lg">
                  Konfirmasi Takedown
                </h3>
                <p className="text-xs text-gray-400">Moderasi Ulasan Pembeli</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin men-takedown ulasan ini? Setelah
              ditakedown, ulasan ini akan **disembunyikan sepenuhnya** dari
              pelanggan pada aplikasi katalog E-commerce.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmingTakedownId(null)}
                disabled={takedownLoading}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-xs font-normal text-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleTakedownConfirm}
                disabled={takedownLoading}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-normal transition-all shadow-md shadow-rose-600/10 flex items-center gap-1.5"
              >
                {takedownLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Menghapus...
                  </>
                ) : (
                  <span>Takedown Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
