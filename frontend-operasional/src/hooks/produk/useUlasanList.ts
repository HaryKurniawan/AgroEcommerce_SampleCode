import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { productsApi, reviewsApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { EcomProduct, ApiProductReview } from "@/types";

export const useUlasanList = (produkId: string) => {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [accumulatedReviews, setAccumulatedReviews] = useState<
    ApiProductReview[]
  >([]);

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(produkId),
    queryFn: () => productsApi.getById(produkId),
    select: (res): EcomProduct => res.data?.data || res.data,
    enabled: !!produkId,
    staleTime: 5 * 60 * 1000,
  });

  const reviewsQuery = useQuery({
    queryKey: queryKeys.products.reviews(produkId, {
      page,
      rating: ratingFilter,
      limit: 10,
    }),
    queryFn: () =>
      reviewsApi.getProductReviews(produkId, {
        limit: 10,
        page,
        rating: ratingFilter || undefined,
        sortBy: "highest",
      }),
    select: (res) => {
      const body = res.data?.data || res.data;
      return {
        data: Array.isArray(body?.data) ? body.data : [],
        total: body?.total || 0,
      };
    },
    enabled: !!produkId,
    staleTime: 2 * 60 * 1000,
  });

  // Handle load more — akumulasi reviews
  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (reviewsQuery.data?.data) {
      setAccumulatedReviews((prev) => [...prev, ...reviewsQuery.data!.data]);
    }
    setPage(nextPage);
  };

  const handleSetRatingFilter = (rating: number | null) => {
    setRatingFilter(rating);
    setPage(1);
    setAccumulatedReviews([]);
  };

  const currentReviews =
    page > 1
      ? [...accumulatedReviews, ...(reviewsQuery.data?.data ?? [])]
      : (reviewsQuery.data?.data ?? []);

  return {
    product: productQuery.data ?? null,
    reviews: currentReviews,
    reviewsTotal: reviewsQuery.data?.total ?? 0,
    loading: productQuery.isLoading,
    fetchLoading: reviewsQuery.isFetching,
    ratingFilter,
    handleLoadMore,
    handleSetRatingFilter,
    page,
  };
};
