"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useHomeData } from "@/hooks/product/useHomeData";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { useFilterState } from "@/hooks/product/useFilterState";

// Components
import AddToCartModal from "@/src/components/ecommerce/AddToCartModal";
import CartSuccessModal from "@/src/components/ecommerce/CartSuccessModal";
import BannerCarousel from "@/src/components/ecommerce/BannerCarousel";
import FilterBottomSheet from "@/src/components/ecommerce/FilterBottomSheet";
import { useBanners } from "@/hooks/banner/useBanners";

// Sections
import {
  StickySearchBar,
  HomeMobileHeader,
  NearbyProductsSection,
  PopularProductsSection,
} from "@/src/components/home";

const HomePage: React.FC = () => {
  const router = useRouter();

  // Hooks
  const { banners: apiBanners, loading: bannersLoading } = useBanners();
  const {
    stores,
    products,
    allProducts,
    categories,
    addresses,
    availableCities,
    selectedCity,
    setCity,
    hasSetCity,
    loading,
    isAuthenticated,
    isVerifiedB2B,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeData();

  const {
    selectedCategory,
    setSelectedCategory,
    selectedStore,
    selectedPrice,
    setSelectedPrice,
    search,
    setSearch,
    resetFilters,
  } = useFilterState();

  const {
    showAddToCartModal,
    closeAddToCartModal,
    showCartSuccessModal,
    closeCartSuccessModal,
    selectedProduct,

    lastAddedQty,
    handleAddToCart,
    handleConfirmAddToCart,
  } = useAddToCart();

  const [showStickySearch, setShowStickySearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const handleSearchSubmit = () => {
    if (search.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleApplyFilter = () => {
    let url = "/katalog?";
    if (selectedCategory) url += `category=${selectedCategory}&`;
    if (selectedStore) url += `store=${selectedStore}&`;
    if (selectedPrice !== "Semua Harga")
      url += `price=${encodeURIComponent(selectedPrice)}&`;
    if (search) url += `q=${encodeURIComponent(search)}&`;

    if (url.endsWith("?") || url.endsWith("&")) {
      url = url.slice(0, -1);
    }
    router.push(url);
  };

  useEffect(() => {
    const handleScroll = () => setShowStickySearch(window.scrollY > 140);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const demoBanners = [
    {
      id: "1",
      title: "Promo Spesial Petani Lokal 70%",
      subtitle: "Diskon besar-besaran + Gratis Ongkir untuk panen terbaik.",
      gradient: "bg-gradient-to-br from-green-600 to-emerald-800",
    },
    {
      id: "2",
      title: "High Quality Fresh Vegetables",
      subtitle: "Voucher Diskon 10% + Voucher Ongkir 20rb",
      gradient: "bg-gradient-to-bl from-teal-600 to-green-800",
    },
    {
      id: "3",
      title: "Beras Premium Organik",
      subtitle: "Kualitas terbaik langsung dari penggilingan padi pilihan.",
      gradient: "bg-gradient-to-r from-primary-600 to-green-700",
    },
  ];

  const activeBanners =
    apiBanners.length > 0
      ? apiBanners.map((b) => ({
          id: b.id,
          title: b.judul,
          subtitle: b.subjudul,
          imageUrl: b.imageUrl,
          gradient: b.gradient,
          link: b.linkUrl,
        }))
      : demoBanners;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat Agro Market...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StickySearchBar
        show={showStickySearch}
        searchQuery={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onOpenFilter={() => setShowFilter(true)}
        isVerifiedB2B={isVerifiedB2B}
        onChatClick={() => router.push("/chat")}
      />

      <main className="pb-20 lg:pb-6">
        <div className="desktop-container">
          <HomeMobileHeader
            isVerifiedB2B={isVerifiedB2B}
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onOpenFilter={() => setShowFilter(true)}
            selectedCity={selectedCity}
            availableCities={availableCities}
            onSelectCity={setCity}
          />

          <div className="px-4 lg:px-6 mt-5 pb-4 space-y-6">
            {!bannersLoading && <BannerCarousel banners={activeBanners} />}

            <NearbyProductsSection
              products={allProducts}
              stores={stores}
              addresses={addresses}
              onAddToCart={handleAddToCart}
            />

            <PopularProductsSection
              products={products}
              selectedCity={selectedCity}
              onAddToCart={handleAddToCart}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>

          <FilterBottomSheet
            isOpen={showFilter}
            onClose={() => setShowFilter(false)}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPrice={selectedPrice}
            onPriceChange={setSelectedPrice}
            onReset={resetFilters}
            onApply={handleApplyFilter}
          />

          <AddToCartModal
            isOpen={showAddToCartModal}
            onClose={closeAddToCartModal}
            product={selectedProduct}
            onConfirm={handleConfirmAddToCart}
          />

          <CartSuccessModal
            isOpen={showCartSuccessModal}
            onClose={closeCartSuccessModal}
            product={selectedProduct}
            quantity={lastAddedQty}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
