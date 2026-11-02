"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star, ChevronDown } from "lucide-react";

import { formatTanggal } from "@/lib/ecommerce-api";
import { useUlasanList } from "@/src/hooks/produk/useUlasanList";
import StarRating from "@/src/components/ecommerce/StarRating";

const getReviewerName = (name?: string) => {
  if (!name) return "Pembeli";
  return name.split("@")[0];
};

const UlasanProdukPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    product,
    reviews,
    reviewsTotal,
    loading,
    fetchLoading,
    ratingFilter,
    handleLoadMore,
    handleSetRatingFilter,
    page,
  } = useUlasanList(id);

  if (loading && !product) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="animate-spin text-primary-500" size={36} />
      </div>
    );
  }

  const FILTERS = [
    { label: "Semua", value: null },
    { label: "5 Bintang", value: 5 },
    { label: "4 Bintang", value: 4 },
    { label: "3 Bintang", value: 3 },
    { label: "2 Bintang", value: 2 },
    { label: "1 Bintang", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center justify-center shadow-sm relative">
        <button
          onClick={() => router.back()}
          className="absolute left-2 p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-medium text-gray-800 text-[15px]">
          Ulasan Pembeli
        </h1>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Rating Summary & Filters */}
        <div className="bg-white border-b border-gray-100 px-5 py-5 mb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900 leading-none">
                {product?.rating ? product.rating.toFixed(1) : "—"}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star
                    size={13}
                    fill="currentColor"
                    opacity={product?.rating && product.rating >= 4.5 ? 1 : 0.4}
                  />
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  {reviewsTotal} Ulasan
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-28 bg-white border border-gray-200 text-gray-700 text-[12px] font-medium rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <span>
                  {FILTERS.find((f) => f.value === ratingFilter)?.label ||
                    "Semua"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                    {FILTERS.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => {
                          handleSetRatingFilter(f.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[12px] transition-colors ${
                          ratingFilter === f.value
                            ? "bg-primary-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 font-medium"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="min-h-[50vh]">
          {loading && page === 1 ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white border-y border-gray-100 mt-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Star size={32} className="text-gray-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                Belum ada ulasan
              </h3>
              <p className="text-xs text-gray-500">
                {ratingFilter
                  ? `Belum ada ulasan dengan ${ratingFilter} Bintang.`
                  : "Jadilah yang pertama memberikan ulasan untuk produk ini."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-4 pt-1">
              {reviews.map(
                (rev: {
                  id_ulasanProduk: string;
                  user?: { name: string };
                  createdAt: string;
                  rating: number;
                  ulasan?: string;
                }) => (
                  <div
                    key={rev.id_ulasanProduk}
                    className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-[13px] border border-primary-100 mt-0.5">
                        {getReviewerName(rev.user?.name)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 leading-none mb-1.5 truncate">
                          {getReviewerName(rev.user?.name)}
                        </p>
                        <div className="flex items-center gap-2 mb-1.5">
                          <StarRating
                            value={rev.rating}
                            readonly
                            size={12}
                            justifyStart
                          />
                          <span className="text-[10px] text-gray-400">
                            • {formatTanggal(rev.createdAt)}
                          </span>
                        </div>
                        {rev.ulasan && (
                          <p className="text-[13px] text-gray-600 leading-relaxed">
                            {rev.ulasan}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Load More Button */}
          {reviews.length < reviewsTotal && (
            <div className="p-4 flex justify-center border-t border-gray-50 bg-gray-50/30">
              <button
                onClick={handleLoadMore}
                disabled={fetchLoading}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {fetchLoading && <Loader2 size={14} className="animate-spin" />}
                {fetchLoading ? "Memuat..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UlasanProdukPage;
