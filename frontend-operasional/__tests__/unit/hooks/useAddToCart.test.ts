import { describe, it, expect, vi, beforeEach } from "vitest";

import { useAddToCart } from "@/hooks/useAddToCart";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cartApi } from "@/lib/ecommerce-api";

import { renderHook, act } from "../test-utils";

// Mock stores and API
vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));
vi.mock("@/store/cart-store", () => ({
  useCartStore: vi.fn(),
}));
vi.mock("@/lib/ecommerce-api", () => ({
  cartApi: {
    addItem: vi.fn(),
  },
}));

describe("useAddToCart hook", () => {
  const mockOpenLoginModal = vi.fn();
  const mockFetchCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      _hasHydrated: true,
      openLoginModal: mockOpenLoginModal,
    });
    (useCartStore as any).mockReturnValue({
      fetchCart: mockFetchCart,
    });
  });

  const mockProduct = { id: "prod-1", nama: "Wortel" } as any;

  it("should open login modal if not authenticated", () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      _hasHydrated: true,
      openLoginModal: mockOpenLoginModal,
    });

    const { result } = renderHook(() => useAddToCart());
    act(() => {
      result.current.handleAddToCart(mockProduct);
    });

    expect(mockOpenLoginModal).toHaveBeenCalled();
    expect(result.current.showAddToCartModal).toBe(false);
  });

  it("should open add to cart modal if authenticated", () => {
    const { result } = renderHook(() => useAddToCart());
    act(() => {
      result.current.handleAddToCart(mockProduct);
    });

    expect(result.current.showAddToCartModal).toBe(true);
    expect(result.current.selectedProduct).toEqual(mockProduct);
  });

  it("should call cartApi.addItem and show success modal on confirm", async () => {
    vi.mocked(cartApi.addItem).mockResolvedValue({} as any);
    const { result } = renderHook(() => useAddToCart());

    await act(async () => {
      await result.current.handleConfirmAddToCart("prod-1", 5, "B");
    });

    expect(cartApi.addItem).toHaveBeenCalledWith("prod-1", 5, "B");
    expect(result.current.showAddToCartModal).toBe(false);
    expect(result.current.showCartSuccessModal).toBe(true);
    expect(mockFetchCart).toHaveBeenCalled();
  });
});
