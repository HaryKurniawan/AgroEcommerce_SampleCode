"use client";

import { useState, useCallback } from "react";

import { useAuthStore } from "@/src/store/auth-store";
import { useProfile } from "@/src/hooks/profil/useProfile";
import { useAddItemToCart } from "@/src/hooks/cart/useCartQuery";
import type { EcomProduct } from "@/types";

export function useAddToCart() {
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();
  const { profile } = useProfile(isAuthenticated, _hasHydrated);
  const addItemMutation = useAddItemToCart();

  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EcomProduct | null>(
    null,
  );
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
    [_hasHydrated, isAuthenticated, openLoginModal, profile],
  );

  const handleConfirmAddToCart = useCallback(
    async (produkId: string, quantity: number, varianKemasanId?: string) => {
      try {
        await addItemMutation.mutateAsync({
          produkId,
          jumlah: quantity,
          varianKemasanId,
        });
        setShowAddToCartModal(false);
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
