"use client";

import React from "react";
import { Star, ChevronRight, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import StarRating from "@/src/components/ecommerce/StarRating";
import type { ApiProductReview } from "@/types";

interface ProductReviewsPreviewProps {
  produkId: string;
  reviews: ApiProductReview[];
  reviewsTotal: number;
  reviewsLoading: boolean;
  averageRating: number;
}

const getReviewerName = (name?: string) => {
  if (!name) return "Pembeli";
  return name.split("@")[0];
};

const ProductReviewsPreview: React.FC<ProductReviewsPreviewProps> = ({
  produkId,
  reviews,
  reviewsTotal,
  reviewsLoading,
  averageRating,
}) => {
  const router = useRouter();

  return (
    <div className="px-4 lg:px-0 pb-10">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
              <Star size={14} className="fill-primary-500 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                Ulasan Pembeli
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {reviewsTotal > 0
                  ? `${reviewsTotal} ulasan · Rata-rata ${averageRating > 0 ? averageRating.toFixed(1) : "—"} ⭐`
                  : "Belum ada ulasan"}
              </p>
            </div>
          </div>

          {reviewsTotal > 0 && (
            <button
              onClick={() => router.push(`/produk/${produkId}/ulasan`)}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Semua <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {reviewsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-4 text-center border-t border-gray-50">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
              <Star size={22} className="fill-primary-500 text-primary-500" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Jadilah yang pertama memberikan ulasan!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 border-t border-gray-50">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id_ulasanProduk} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {getReviewerName(rev.user?.name)[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-800">
                        {getReviewerName(rev.user?.name)}
                      </p>
                      <StarRating value={rev.rating} readonly size={12} />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2">
                      {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {rev.ulasan && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {rev.ulasan}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {reviewsTotal > 3 && (
              <button
                onClick={() => router.push(`/produk/${produkId}/ulasan`)}
                className="w-full py-3.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5"
              >
                Lihat {reviewsTotal - 3} ulasan lainnya{" "}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewsPreview;
