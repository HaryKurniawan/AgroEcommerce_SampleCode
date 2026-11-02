import { useQuery, UseQueryResult } from "@tanstack/react-query";

import {
  fetchProfitReport,
  fetchProfitSummary,
  ProfitReportFilters,
  ProfitSummaryFilters,
} from "@/lib/api/profit-report";
import {
  ProfitReportResponseDto,
  ProfitSummaryResponseDto,
} from "@/types/profit-report";

/**
 * Hook to fetch profit report for a product
 */
export function useProfitReport(
  produkId: string,
  filters?: ProfitReportFilters,
): UseQueryResult<ProfitReportResponseDto, Error> {
  return useQuery({
    queryKey: ["profitReport", produkId, filters],
    queryFn: () => fetchProfitReport(produkId, filters),
    enabled: !!produkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch profit summary for a store
 */
export function useProfitSummary(
  tokoId: string,
  filters?: ProfitSummaryFilters,
): UseQueryResult<ProfitSummaryResponseDto, Error> {
  return useQuery({
    queryKey: ["profitSummary", tokoId, filters],
    queryFn: () => fetchProfitSummary(tokoId, filters),
    enabled: !!tokoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
