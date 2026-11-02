"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { useCartQuery } from "@/hooks/cart/useCartQuery";
import { useAuthStore } from "@/store/auth-store";

interface CartCountButtonProps {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}

const CartCountButton: React.FC<CartCountButtonProps> = ({
  variant = "light",
  size = "sm",
  className = "",
}) => {
  const router = useRouter();
  const { totalItems: cartCount } = useCartQuery();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const iconSize = size === "md" ? 22 : 20;

  const handleClick = () => {
    if (!isAuthenticated) {
      const authStore = useAuthStore.getState();
      if (typeof authStore.openLoginModal === "function") {
        authStore.openLoginModal();
      } else {
        router.push("/login");
      }
    } else {
      router.push("/keranjang");
    }
  };

  const isLight = variant === "light";

  const buttonClass = isLight
    ? `relative p-2 hover:bg-gray-50 rounded-xl transition-colors ${className}`
    : `relative p-2.5 bg-white/15 border border-white/20 rounded-xl flex-shrink-0 hover:bg-white/25 transition-colors ${className}`;

  const iconClass = isLight ? "text-gray-600" : "text-white";

  return (
    <button
      onClick={handleClick}
      className={buttonClass}
      aria-label="Keranjang Belanja"
    >
      <ShoppingCart size={iconSize} className={iconClass} />
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
          {cartCount}
        </span>
      )}
    </button>
  );
};

export default CartCountButton;
