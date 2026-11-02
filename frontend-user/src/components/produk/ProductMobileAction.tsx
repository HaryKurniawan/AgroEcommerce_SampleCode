"use client";

import React from "react";
import { ShoppingCart, MessageCircle, Loader2 } from "lucide-react";

interface ProductMobileActionProps {
  onChatSeller: () => void;
  onOpenCartModal: () => void;
  onOpenBuyNowModal: () => void;
  chatLoading: boolean;
  isOutOfArea?: boolean;
  isAuthenticated?: boolean;
}

const ProductMobileAction: React.FC<ProductMobileActionProps> = ({
  onChatSeller,
  onOpenCartModal,
  onOpenBuyNowModal,
  chatLoading,
  isOutOfArea = false,
  isAuthenticated = false,
}) => {
  const isShoppingDisabled = isAuthenticated && isOutOfArea;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 px-6 z-50 lg:hidden shadow-[0_-15px_40px_rgba(0,0,0,0.06)] pb-safe-offset-4 font-normal text-gray-700">
      {isShoppingDisabled && (
        <div className="text-center text-xs text-red-500 mb-3 p-2 bg-red-50/50 rounded-xl border border-red-100 font-normal">
          Toko di luar jangkauan pengiriman Anda
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* Chat - Only Icon */}
        <button
          onClick={onChatSeller}
          disabled={chatLoading}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-xl text-primary-600 bg-white hover:bg-gray-50 transition-all active:scale-90 disabled:opacity-50"
          title="Chat"
        >
          {chatLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MessageCircle size={22} strokeWidth={2} />
          )}
        </button>

        {/* Add to Cart - Only Icon */}
        <button
          onClick={onOpenCartModal}
          disabled={isShoppingDisabled}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-xl text-primary-600 bg-white hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tambah ke Keranjang"
        >
          <ShoppingCart size={22} strokeWidth={2} />
        </button>

        {/* Buy Now - Primary Action Text */}
        <button
          onClick={onOpenBuyNowModal}
          disabled={isShoppingDisabled}
          className="flex-1 bg-primary-600 text-white rounded-xl h-12 flex items-center justify-center hover:bg-primary-700 transition-all active:scale-95 text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
};

export default ProductMobileAction;
