import { useQuery } from "@tanstack/react-query";

import { reviewsApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { ApiProductReview } from "@/types";

export const useProductReviews = (id: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.products.reviews(id ?? "", {
      limit: 3,
      sortBy: "highest",
    }),
    queryFn: () =>
      reviewsApi.getProductReviews(id!, { limit: 3, sortBy: "highest" }),
    select: (res) => {
      const body = (res.data?.data || res.data) as {
        data: ApiProductReview[];
        total: number;
      };
      return {
        reviews: Array.isArray(body?.data) ? body.data : [],
        reviewsTotal: body?.total || 0,
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    reviews: query.data?.reviews ?? [],
    reviewsTotal: query.data?.reviewsTotal ?? 0,
    reviewsLoading: query.isLoading,
    refetch: query.refetch,
  };
};
