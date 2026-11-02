import {
  ProfitReportResponseDto,
  ProfitSummaryResponseDto,
} from "@/types/profit-report";

import { apiClient } from "../ecommerce-api";

export interface ProfitReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProfitSummaryFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
  isB2B?: boolean;
}

/**
 * Get profit report for a specific product
 */
export async function fetchProfitReport(
  produkId: string,
  filters?: ProfitReportFilters,
): Promise<ProfitReportResponseDto> {
  const params = new URLSearchParams();

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = `/ecommerce/profit-report/produk/${produkId}${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url);
  return response.data?.data || response.data;
}

/**
 * Get profit summary for a store
 */
export async function fetchProfitSummary(
  tokoId: string,
  filters?: ProfitSummaryFilters,
): Promise<ProfitSummaryResponseDto> {
  const params = new URLSearchParams();

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.groupBy) params.append("groupBy", filters.groupBy);
  if (filters?.isB2B !== undefined)
    params.append("isB2B", filters.isB2B.toString());

  const queryString = params.toString();
  const url = `/ecommerce/profit-report/toko/${tokoId}/summary${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url);
  return response.data?.data || response.data;
}

/**
 * Check stock availability for FIFO calculation
 */
export async function checkStockAvailability(
  produkId: string,
  requiredQty: number,
): Promise<{ produkId: string; requiredQty: number; isAvailable: boolean }> {
  const response = await apiClient.get(
    `/ecommerce/profit-report/produk/${produkId}/stock-availability?requiredQty=${requiredQty}`,
  );
  return response.data;
}
