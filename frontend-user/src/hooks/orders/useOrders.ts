import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { ordersApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/src/hooks/query-keys";
import type { ApiOrderData } from "@/types";

export const useOrders = (isAuthenticated: boolean, _hasHydrated: boolean) => {
  const query = useInfiniteQuery({
    queryKey: ["orders", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      ordersApi.getMyOrders({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const data =
        lastPage?.data?.data?.data ||
        lastPage?.data?.data ||
        lastPage?.data ||
        [];
      const dataArray = Array.isArray(data) ? data : [];
      if (dataArray.length === 10) return (allPages?.length || 0) + 1;
      return undefined;
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const orders =
    query.data?.pages.flatMap((page) => {
      const data =
        page?.data?.data?.data || page?.data?.data || page?.data || [];
      return Array.isArray(data) ? data : [];
    }) ?? [];

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;

    const eventSource = new EventSource("/api/proxy/ecom-pesanan/stream", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "heartbeat") return;
        query.refetch();
      } catch {
        // ignore JSON parse errors
      }
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, isAuthenticated]);

  return {
    orders,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
