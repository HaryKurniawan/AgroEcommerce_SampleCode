"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import Image from "next/image";

import StarRating from "@/src/components/ecommerce/StarRating";
import { reviewsApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";
import type { ApiOrderReviewStatusItem } from "@/types";

const RatingPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { _hasHydrated, isAuthenticated } = useAuthStore();

  const [items, setItems] = useState<ApiOrderReviewStatusItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ulasans, setUlasans] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await reviewsApi.getOrderReviewStatus(orderId);
      const data: ApiOrderReviewStatusItem[] = res.data?.data || res.data || [];
      setItems(data);

      // Pre-fill existing ratings
      const preRatings: Record<string, number> = {};
      const preSuccess: Record<string, boolean> = {};
      data.forEach((item) => {
        if (item.isReviewed && item.review) {
          preRatings[item.orderItemId] = item.review.rating;
          preSuccess[item.orderItemId] = true;
        }
      });
      setRatings((prev) => ({ ...prev, ...preRatings }));
      setSuccess((prev) => ({ ...prev, ...preSuccess }));
    } catch (e) {
      console.error("Failed to fetch review status", e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (_hasHydrated) {
      Promise.resolve().then(() => fetchStatus());
    }
  }, [_hasHydrated, isAuthenticated, fetchStatus, router]);

  useEffect(() => {
    if (items.length > 0) {
      const allReviewed = items.every(
        (item) => item.isReviewed || success[item.orderItemId],
      );
      Promise.resolve().then(() => setAllDone(allReviewed));
    }
  }, [items, success]);

  const handleSubmitItem = async (item: ApiOrderReviewStatusItem) => {
    const rating = ratings[item.orderItemId];
    if (!rating) return;

    setSubmitting((prev) => ({ ...prev, [item.orderItemId]: true }));
    try {
      await reviewsApi.createReview({
        orderItemId: item.orderItemId,
        rating,
        ulasan: ulasans[item.orderItemId] || undefined,
      });
      setSuccess((prev) => ({ ...prev, [item.orderItemId]: true }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [item.orderItemId]: false }));
    }
  };

  if (loading || !_hasHydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary-500" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 h-14 flex items-center justify-center shadow-sm relative">
        <button
          onClick={() => router.back()}
          className="absolute left-2 p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-medium text-gray-800 text-[15px]">Beri Ulasan</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4 pb-32">
        {allDone && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Terima kasih!
            </h2>
            <p className="text-[13px] text-gray-500 mb-8 max-w-[260px] mx-auto leading-relaxed">
              Semua produk sudah Anda beri ulasan. Ulasan Anda sangat berarti
              bagi penjual! 🌟
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              <button
                onClick={() => router.replace("/pesanan")}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[13px] hover:bg-emerald-700 transition-colors"
              >
                Riwayat Pesanan
              </button>
              <button
                onClick={() => router.replace("/")}
                className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium text-[13px] hover:bg-gray-50 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        )}

        {!allDone &&
          items.map((item) => {
            const isItemDone = item.isReviewed || success[item.orderItemId];
            const isSubmitting = submitting[item.orderItemId];
            const currentRating = ratings[item.orderItemId] || 0;

            return (
              <div
                key={item.orderItemId}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                  isItemDone ? "border-green-200 opacity-80" : "border-gray-100"
                }`}
              >
                {/* Product header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.productFoto ? (
                      <Image
                        src={item.productFoto}
                        alt={item.productNama}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🥦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {item.productNama}
                      </p>
                      {item.isGrosir && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                          Grosiran
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.jumlah} {item.isGrosir ? "kg" : "item"}
                    </p>
                  </div>
                  {isItemDone && (
                    <CheckCircle2
                      size={22}
                      className="text-green-500 flex-shrink-0"
                    />
                  )}
                </div>

                {isItemDone ? (
                  <div className="px-4 py-4 flex flex-col items-center gap-1">
                    <StarRating
                      value={item.review?.rating || currentRating}
                      readonly
                    />
                    {item.review?.ulasan && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        &quot;{item.review.ulasan}&quot;
                      </p>
                    )}
                    <span className="text-xs text-green-600 font-medium mt-1">
                      Sudah diulas ✓
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-4 space-y-4">
                    {/* Stars */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-2">
                        Bagaimana kualitas produk ini?
                      </p>
                      <StarRating
                        value={currentRating}
                        onChange={(r) =>
                          setRatings((prev) => ({
                            ...prev,
                            [item.orderItemId]: r,
                          }))
                        }
                        size={36}
                      />
                    </div>

                    {/* Text review */}
                    <div>
                      <label
                        htmlFor={`ulasan-${item.orderItemId}`}
                        className="text-xs font-medium text-gray-600 mb-1.5 block"
                      >
                        Ulasan (opsional)
                      </label>
                      <textarea
                        id={`ulasan-${item.orderItemId}`}
                        value={ulasans[item.orderItemId] || ""}
                        onChange={(e) =>
                          setUlasans((prev) => ({
                            ...prev,
                            [item.orderItemId]: e.target.value,
                          }))
                        }
                        placeholder="Ceritakan pengalamanmu dengan produk ini..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 resize-none transition-all"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={() => handleSubmitItem(item)}
                      disabled={!currentRating || isSubmitting}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RatingPage;
