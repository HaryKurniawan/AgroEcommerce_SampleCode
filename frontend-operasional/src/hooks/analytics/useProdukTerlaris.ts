import { useQuery } from "@tanstack/react-query";

import {
  analyticsApi,
  ProdukTerlarisFilter,
  RiwayatBulananFilter,
} from "@/lib/api/analytics";
import { queryKeys } from "@/hooks/query-keys";

export function useProdukTerlaris(
  filters: ProdukTerlarisFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.produkTerlaris(filters),
    queryFn: () => analyticsApi.getProdukTerlaris(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

export function useRiwayatTerlaris(
  filters: RiwayatBulananFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.riwayatTerlaris(filters),
    queryFn: () => analyticsApi.getRiwayatTerlaris(filters),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 menit — data historis jarang berubah
  });
}
