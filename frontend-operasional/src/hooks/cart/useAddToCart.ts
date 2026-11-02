import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { useAddItemToCart } from "@/hooks/cart/useCartQuery";
import type { EcomProduct } from "@/types";

export const useAddToCart = (product: EcomProduct | null) => {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();
  const addItemMutation = useAddItemToCart();

  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const [lastAddedGrade, setLastAddedGrade] = useState<"A" | "B" | "C">("A");
  const [lastAddedQty, setLastAddedQty] = useState(1);

  const actionLoading = addItemMutation.isPending;

  const handleBuyNow = async (
    produkId: string,
    quantity: number,
    selectedGrade: "A" | "B" | "C",
  ) => {
    if (!_hasHydrated || !product) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    try {
      const res = await addItemMutation.mutateAsync({
        produkId: product.id,
        jumlah: quantity,
        grade: selectedGrade,
      });

      const cartItem = res.data?.data || res.data;
      const cartItemId = cartItem?.id;

      if (cartItemId) {
        router.push(`/checkout?items=${cartItemId}`);
      } else {
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Error buy now:", error);
      alert("Gagal memproses pembelian.");
    }
  };

  const handleConfirmAddToCart = async (
    produkId: string,
    qty: number,
    grade: "A" | "B" | "C",
  ) => {
    try {
      await addItemMutation.mutateAsync({ produkId, jumlah: qty, grade });
      setShowAddToCartModal(false);
      setLastAddedGrade(grade);
      setLastAddedQty(qty);
      setShowCartSuccessModal(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Gagal menambahkan ke keranjang.");
    }
  };

  const handleDesktopAddToCart = async (
    quantity: number,
    selectedGrade: string,
  ) => {
    if (!_hasHydrated || !product) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    try {
      await addItemMutation.mutateAsync({
        produkId: product.id,
        jumlah: quantity,
        grade: selectedGrade,
      });
      setLastAddedGrade(selectedGrade as "A" | "B" | "C");
      setLastAddedQty(quantity);
      setShowCartSuccessModal(true);
    } catch (error) {
      console.error("Error desktop add to cart:", error);
      alert("Gagal menambahkan ke keranjang.");
    }
  };

  return {
    showAddToCartModal,
    setShowAddToCartModal,
    showCartSuccessModal,
    setShowCartSuccessModal,
    lastAddedGrade,
    lastAddedQty,
    actionLoading,
    handleBuyNow,
    handleConfirmAddToCart,
    handleDesktopAddToCart,
  };
};
