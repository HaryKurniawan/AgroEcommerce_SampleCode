"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useProductDetail } from "@/src/hooks/produk/useProductDetail";
import { useProductReviews } from "@/src/hooks/produk/useProductReviews";
import { useChatAction } from "@/src/hooks/chat/useChatAction";
import { useAddToCart } from "@/src/hooks/cart/useAddToCart";
import { ProductDetailSkeleton } from "@/src/components/ecommerce/Skeleton";
import AddToCartModal from "@/src/components/ecommerce/AddToCartModal";
import CartSuccessModal from "@/src/components/ecommerce/CartSuccessModal";
import CartCountButton from "@/src/components/ecommerce/CartCountButton";
import EmptyState from "@/src/components/ecommerce/EmptyState";
import { useAuthStore } from "@/src/store/auth-store";
import { useProfile } from "@/src/hooks/profil/useProfile";

// Sub-components
import {
  ProductGallery,
  ProductInfo,
  ProductSpecs,
  ProductStoreCard,
  ProductReviewsPreview,
  ProductSidebar,
  ProductMobileAction,
} from "@/src/components/produk";

const DetailProdukPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, openLoginModal } = useAuthStore();

  const { profile } = useProfile(isAuthenticated, _hasHydrated);

  const { product, store, userAddress, addresses, loading, isOutOfArea } =
    useProductDetail(id as string, isAuthenticated);

  const { reviews, reviewsTotal, reviewsLoading } = useProductReviews(
    product?.id_produk,
  );
  const { handleChatSeller, chatLoading } = useChatAction();
  const {
    showAddToCartModal,
    showCartSuccessModal,
    selectedProduct,
    lastAddedQty,
    isSubmitting: actionLoading,
    handleAddToCart,
    handleConfirmAddToCart,
    closeAddToCartModal,
    closeCartSuccessModal,
  } = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [modalMode, setModalMode] = useState<"cart" | "buy">("cart");
  const [selectedVarianId, setSelectedVarianId] = useState<string | undefined>(
    undefined,
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <EmptyState
        title="Produk Tidak Ditemukan"
        description="Maaf, produk yang Anda cari mungkin sudah dihapus atau tidak tersedia saat ini."
        illustration="empty-search.svg"
        actionLabel="Kembali ke Katalog"
        onAction={() => router.push("/katalog")}
      />
    );
  }

  const variants = product?.varian || product?.kemasan || [];
  const selectedVariant = variants.find(
    (v: any) => v.id_varianKemasan === selectedVarianId,
  );

  const displayHarga = selectedVariant
    ? product.harga * selectedVariant.ukuranKg +
      (selectedVariant.biayaTambahan || 0)
    : product.harga;
  const displayStok = selectedVariant
    ? selectedVariant.stokKemasan
    : product.stok;
  const totalStok = displayStok;

  const onChatSeller = () => {
    if (product?.id_produk && product?.tokoId) {
      handleChatSeller(product.id_produk, product.tokoId);
    }
  };

  const onSetAddress = () => {
    router.push(`/profil/alamat/form?redirect=/produk/${id}`);
  };

  const handleOpenModal = (mode: "beli" | "cart" | "grosir") => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (mode === "beli") {
      setModalMode("buy");
      handleAddToCart(product);
    } else if (mode === "grosir") {
      router.push(`/produk/${id}/grosir`);
    } else {
      setModalMode("cart");
      handleAddToCart(product);
    }
  };

  return (
    <div className="animate-fade-in relative min-h-screen bg-gray-50 pb-20 lg:pb-10">
      {/* Mobile Header */}
      <div
        className={`sticky top-0 lg:top-16 z-40 px-4 py-2 lg:hidden flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <button
          onClick={() => router.push("/")}
          className="p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span className="font-display font-medium text-[15px] text-gray-900 tracking-tight">
          Detail Produk
        </span>
        <div className="flex items-center gap-1">
          <CartCountButton className="!bg-transparent !border-none !shadow-none" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-6 lg:pt-6">
        <div className="lg:flex lg:gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            <div className="space-y-6 lg:flex lg:gap-8 lg:space-y-0">
              <div className="lg:w-[380px] xl:w-[420px] shrink-0">
                <ProductGallery
                  product={product}
                  activeImage={activeImage}
                  setActiveImage={setActiveImage}
                />
              </div>
              <div className="space-y-6 flex-1 min-w-0">
                <ProductInfo
                  product={product}
                  displayHarga={displayHarga}
                  totalStok={totalStok}
                  selectedVarianId={selectedVarianId}
                  onSelectVarian={setSelectedVarianId}
                  onBulkOrder={() => handleOpenModal("grosir")}
                  onOpenCartModal={() => handleOpenModal("beli")}
                  isAuthenticated={isAuthenticated}
                  userAddress={userAddress}
                  isOutOfArea={isOutOfArea}
                  onSetAddress={onSetAddress}
                />
                <ProductSpecs product={product} setQuantity={setQuantity} />
              </div>
            </div>

            <div className="lg:hidden">
              <ProductStoreCard store={store} />
            </div>
            <ProductReviewsPreview
              produkId={id}
              reviews={reviews}
              reviewsTotal={reviewsTotal}
              reviewsLoading={reviewsLoading}
              averageRating={product.rating}
            />
          </div>

          <ProductSidebar
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            displayHarga={displayHarga}
            displayStok={displayStok}
            totalStok={totalStok}
            onBuyNow={() => handleOpenModal("beli")}
            onAddToCart={() => handleOpenModal("cart")}
            onChatSeller={onChatSeller}
            onBulkOrder={() => handleOpenModal("grosir")}
            chatLoading={chatLoading}
            actionLoading={actionLoading}
            isOutOfArea={isOutOfArea}
            isAuthenticated={isAuthenticated}
            store={store}
          />
        </div>
      </div>

      <ProductMobileAction
        onChatSeller={onChatSeller}
        onOpenCartModal={() => handleOpenModal("cart")}
        onOpenBuyNowModal={() => handleOpenModal("beli")}
        chatLoading={chatLoading}
        isOutOfArea={isOutOfArea}
        isAuthenticated={isAuthenticated}
      />

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={closeAddToCartModal}
        product={product}
        initialVarianId={selectedVarianId}
        mode={modalMode}
        onConfirm={handleConfirmAddToCart}
      />

      <CartSuccessModal
        isOpen={showCartSuccessModal}
        onClose={closeCartSuccessModal}
        product={product}
        quantity={lastAddedQty}
      />
    </div>
  );
};

export default DetailProdukPage;
