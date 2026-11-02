import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useCartQuery,
  useAddItemToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/src/hooks/cart/useCartQuery";
import { cartApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/src/store/auth-store";

// Mock API and Auth Store
vi.mock("@/lib/ecommerce-api", () => ({
  cartApi: {
    get: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock("@/src/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for testing
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useCartQuery Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      _hasHydrated: true,
    });
  });

  describe("useCartQuery", () => {
    it("should not fetch if not authenticated", async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        _hasHydrated: true,
      });
      const { result } = renderHook(() => useCartQuery(), { wrapper });

      expect(cartApi.get).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
    });

    it("should fetch and map cart items correctly", async () => {
      const mockApiData = {
        data: {
          item: [
            {
              id: "cart-item-1",
              produkId: "prod-1",
              jumlah: 2,
              produk: {
                id: "prod-1",
                nama: "Sayur Kol",
                harga: 5000,
                toko: { id: "toko-1", nama: "Toko A" },
              },
            },
          ],
        },
      };

      (cartApi.get as any).mockResolvedValue(mockApiData);

      const { result } = renderHook(() => useCartQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(cartApi.get).toHaveBeenCalled();
      expect(result.current.items).toHaveLength(1);

      // Checking if "toko" was mapped to "store" correctly
      expect(result.current.items[0].product.store.nama).toBe("Toko A");

      // Check calculations
      expect(result.current.totalItems).toBe(1);
      // 2 * 5000 = 10000
      expect(result.current.totalHarga).toBe(10000);
    });
  });

  describe("Mutations", () => {
    it("useAddItemToCart calls API and invalidates query", async () => {
      (cartApi.addItem as any).mockResolvedValue({ data: { success: true } });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddItemToCart(), { wrapper });

      await result.current.mutateAsync({ produkId: "prod-2", jumlah: 3 });

      expect(cartApi.addItem).toHaveBeenCalledWith("prod-2", 3, undefined);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
    });

    it("useUpdateCartItem calls API and invalidates query", async () => {
      (cartApi.updateItem as any).mockResolvedValue({
        data: { success: true },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper });

      await result.current.mutateAsync({ itemId: "item-2", jumlah: 5 });

      expect(cartApi.updateItem).toHaveBeenCalledWith("item-2", 5);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
    });

    it("useRemoveCartItem calls API and invalidates query", async () => {
      (cartApi.removeItem as any).mockResolvedValue({
        data: { success: true },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveCartItem(), { wrapper });

      await result.current.mutateAsync("item-2");

      expect(cartApi.removeItem).toHaveBeenCalledWith("item-2");
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
    });

    it("useClearCart calls API and invalidates query", async () => {
      (cartApi.clear as any).mockResolvedValue({ data: { success: true } });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useClearCart(), { wrapper });

      await result.current.mutateAsync();

      expect(cartApi.clear).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
    });
  });
});
