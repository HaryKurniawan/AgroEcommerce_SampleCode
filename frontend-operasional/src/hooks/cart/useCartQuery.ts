import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { cartApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";

interface CartItem {
  id: string;
  produkId: string;
  jumlah: number;
  grade?: "A" | "B" | "C";
  product: {
    id: string;
    nama: string;
    harga: number;
    gambarUrl: string | null;
    satuan: string;
    store: { id: string; nama: string };
  };
}

/** Fetch cart data */
export const useCartQuery = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: () => cartApi.get(),
    select: (res): CartItem[] => {
      const data = res.data?.data || res.data;
      const items = data?.item || []; // Backend menggunakan 'item' (plural relation di Prisma)

      return items.map((i: any) => ({
        ...i,
        product: i.produk
          ? {
              ...i.produk,
              store: i.produk.toko, // Map 'toko' ke 'store'
            }
          : null,
      }));
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 30 * 1000, // 30 detik
  });

  const totalItems = query.data?.length ?? 0;
  const totalHarga =
    query.data?.reduce(
      (sum, item) => sum + item.product.harga * item.jumlah,
      0,
    ) ?? 0;

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalItems,
    totalHarga,
    refetch: query.refetch,
  };
};

/** Add item to cart */
export const useAddItemToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produkId,
      jumlah,
      grade,
    }: {
      produkId: string;
      jumlah: number;
      grade?: string;
    }) => cartApi.addItem(produkId, jumlah, grade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (error) => {
      console.error("Gagal menambahkan ke keranjang:", error);
    },
  });
};

/** Update item quantity */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, jumlah }: { itemId: string; jumlah: number }) =>
      cartApi.updateItem(itemId, jumlah),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
};

/** Remove item from cart */
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
};

/** Clear entire cart */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
};
