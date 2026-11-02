import { create } from "zustand";

/**
 * @deprecated
 * Cart state management has moved to TanStack Query (src/hooks/cart/useCartQuery.ts).
 * This store is kept for legacy compatibility until all components are migrated.
 */

interface CartItem {
  id: string;
  produkId: string;
  jumlah: number;
  product: {
    id: string;
    nama: string;
    harga: number;
    gambarUrl: string | null;
    satuan: string;
    store: { id: string; nama: string };
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  // Methods are removed as they are now handled by useCartQuery mutations
}

export const useCartStore = create<CartState>(() => ({
  items: [],
  isLoading: false,
  error: null,
}));
