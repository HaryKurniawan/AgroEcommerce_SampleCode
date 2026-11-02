import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ordersApi } from "@/lib/api/orders";
import { queryKeys } from "@/hooks/query-keys";

export const useSellerGrosirOrders = (tokoId: string) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: queryKeys.sellerDashboard.grosirOrders(tokoId),
    queryFn: () => ordersApi.sellerGetOrders(tokoId, { isGrosir: true }),
    select: (res) => {
      const responseBody = res?.data;
      // Backend returns { success: true, data: { data: [...], total: ... } }
      // So Axios res.data is the success object. res.data.data is the pagination object.
      // We want res.data.data.data
      const innerData = responseBody?.data;
      if (innerData && Array.isArray(innerData.data)) return innerData.data;
      if (Array.isArray(innerData)) return innerData;
      return [];
    },
    enabled: !!tokoId,
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ordersApi.confirmWholesale(id, data),
    onSuccess: () => {
      toast.success("Pesanan grosir berhasil dikonfirmasi");
      queryClient.invalidateQueries({
        queryKey: queryKeys.sellerDashboard.grosirOrders(tokoId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sellerDashboard.all(),
      });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Gagal konfirmasi pesanan";
      toast.error(msg);
    },
  });

  const ajukanGudangMutation = useMutation({
    mutationFn: ({ id, gudangId }: { id: string; gudangId: string }) =>
      ordersApi.ajukanGudang(id, gudangId),
    onSuccess: () => {
      toast.success("Berhasil diajukan ke Gudang Express!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.sellerDashboard.grosirOrders(tokoId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sellerDashboard.all(),
      });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Gagal mengajukan ke Gudang";
      toast.error(msg);
    },
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    confirm: (id: string, data: any) =>
      confirmMutation.mutateAsync({ id, data }),
    isConfirming: confirmMutation.isPending,
    ajukanGudang: (id: string, gudangId: string) =>
      ajukanGudangMutation.mutateAsync({ id, gudangId }),
    isAjukanGudangLoading: ajukanGudangMutation.isPending,
  };
};
