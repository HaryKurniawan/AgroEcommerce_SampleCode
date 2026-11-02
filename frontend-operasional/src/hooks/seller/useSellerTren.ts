import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "@/lib/api/analytics";
import { queryKeys } from "@/hooks/query-keys";

export function useTrenBulanan(tokoId: string, bulanKe = 6) {
  return useQuery({
    queryKey: queryKeys.analytics.trenBulanan(tokoId, bulanKe),
    queryFn: () => analyticsApi.getTrenBulanan(tokoId, bulanKe),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrenProdukBulanan(
  tokoId: string,
  month?: number,
  year?: number,
  limit = 10,
  period?: "WEEK" | "MONTH" | "SIX_MONTHS" | "YEAR",
) {
  return useQuery({
    queryKey: [
      ...queryKeys.analytics.trenProdukBulanan(tokoId, month, year),
      period,
    ],
    queryFn: () => {
      const params: any = { limit };
      if (tokoId) params.tokoId = tokoId;
      if (period === "WEEK") {
        params.period = "WEEK";
      } else if (period === "SIX_MONTHS") {
        params.period = "6_MONTHS";
      } else if (period === "YEAR") {
        params.period = "YEAR";
        params.year = year;
      } else {
        params.month = month;
        params.year = year;
        params.period = "MONTH";
      }
      const q = new URLSearchParams(params).toString();
      return analyticsApi.getTrenProdukBulananRaw(q);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePolaPenjualan(
  tokoId: string,
  year?: number,
  month?: number,
) {
  return useQuery({
    queryKey: [...queryKeys.analytics.polaPenjualan(tokoId, year), month],
    queryFn: () => analyticsApi.getPolaPenjualan(tokoId, year, month),
    enabled: true,
    staleTime: 15 * 60 * 1000, // 15 menit — pola penjualan lambat berubah
  });
}

export function usePesananHarian(tokoId: string, date: string) {
  return useQuery({
    queryKey: ["analytics", "pesanan-harian", tokoId, date],
    queryFn: () => analyticsApi.getPesananHarian(tokoId, date),
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePertumbuhanProduk(
  tokoId: string,
  period?: "WEEK" | "MONTH" | "SIX_MONTHS" | "YEAR",
  month?: number,
  year?: number,
) {
  return useQuery({
    queryKey: [
      ...queryKeys.analytics.pertumbuhanProduk(tokoId),
      period,
      month,
      year,
    ],
    queryFn: () => {
      const params: any = {};
      if (tokoId) params.tokoId = tokoId;
      if (period === "WEEK") {
        params.period = "WEEK";
      } else if (period === "SIX_MONTHS") {
        params.period = "6_MONTHS";
      } else if (period === "YEAR") {
        params.period = "YEAR";
        params.year = year;
      } else if (period === "MONTH") {
        params.period = "MONTH";
        params.month = month;
        params.year = year;
      }
      const q = new URLSearchParams(params).toString();
      return analyticsApi.getPertumbuhanProdukRaw(q);
    },
    enabled: !!tokoId,
    staleTime: 10 * 60 * 1000,
  });
}
