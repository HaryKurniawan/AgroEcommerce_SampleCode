"use client";

import { useState, useCallback } from "react";

import { useAuthStore } from "@/store/auth-store";
import { useAddItemToCart } from "@/hooks/cart/useCartQuery";
import type { EcomProduct } from "@/types";

export function useAddToCart() {
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();
  const addItemMutation = useAddItemToCart();

  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EcomProduct | null>(
    null,
  );
  const [lastAddedGrade, setLastAddedGrade] = useState<"A" | "B" | "C">("A");
  const [lastAddedQty, setLastAddedQty] = useState(1);

  const handleAddToCart = useCallback(
    (product: EcomProduct) => {
      if (!_hasHydrated) return;
      if (!isAuthenticated) {
        openLoginModal();
        return;
      }
      setSelectedProduct(product);
      setShowAddToCartModal(true);
    },
    [_hasHydrated, isAuthenticated, openLoginModal],
  );

  const handleConfirmAddToCart = useCallback(
    async (produkId: string, quantity: number, grade: "A" | "B" | "C") => {
      try {
        await addItemMutation.mutateAsync({
          produkId,
          jumlah: quantity,
          grade,
        });
        setShowAddToCartModal(false);
        setLastAddedGrade(grade);
        setLastAddedQty(quantity);
        setShowCartSuccessModal(true);
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Gagal menambahkan ke keranjang");
      }
    },
    [addItemMutation],
  );

  return {
    showAddToCartModal,
    showCartSuccessModal,
    selectedProduct,
    lastAddedGrade,
    lastAddedQty,
    isSubmitting: addItemMutation.isPending,
    handleAddToCart,
    handleConfirmAddToCart,
    closeAddToCartModal: useCallback(() => setShowAddToCartModal(false), []),
    closeCartSuccessModal: useCallback(
      () => setShowCartSuccessModal(false),
      [],
    ),
  };
}
