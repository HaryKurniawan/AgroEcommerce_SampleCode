"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/src/hooks/query-keys";
import { addressesApi } from "@/lib/ecommerce-api";

// Components
import ProductCard from "@/src/components/ecommerce/ProductCard";
import AddToCartModal from "@/src/components/ecommerce/AddToCartModal";
import CartSuccessModal from "@/src/components/ecommerce/CartSuccessModal";
import { ProductGridSkeleton } from "@/src/components/ecommerce/Skeleton";
import EmptyState from "@/src/components/ecommerce/EmptyState";
import FilterBottomSheet from "@/src/components/ecommerce/FilterBottomSheet";

// Hooks
import { useAuthStore } from "@/src/store/auth-store";
import { useCityStore } from "@/src/store/city-store";
import {
  enrichProductsWithCity,
  filterProductsByCity,
  storeIdsForCity,
} from "@/lib/location";
import {
  useAddToCart,
  useFilterState,
  useFetchProducts,
  useKatalogInit,
  type SortOption,
} from "@/hooks";

// Page Components
import KatalogHeader from "../../components/katalog/KatalogHeader";
import FilterSidebar from "../../components/katalog/FilterSidebar";
import KatalogToolbar from "../../components/katalog/KatalogToolbar";
import ActiveFilterChips from "../../components/katalog/ActiveFilterChips";

const KatalogContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const isVerifiedB2B = user?.isVerifiedB2B === true;

  // Hooks
  const filters = useFilterState({
    initialSearch: searchParams.get("q") || "",
    initialCategory: searchParams.get("category") || "",
    initialStore: searchParams.get("store") || "",
    initialPrice: searchParams.get("price") || "Semua Harga",
    initialSort: (searchParams.get("sortBy") as SortOption) || "populer",
  });

  const {
    products,
    total,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchProducts({
    search: filters.search,
    kategoriId: filters.selectedCategory,
    tokoId: filters.selectedStore,
    sortBy: filters.sortBy,
    limit: 20,
  });

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

  const { categories, stores, loading: initLoading } = useKatalogInit();
  const [showFilter, setShowFilter] = useState(false);

  const { selectedCity } = useCityStore();

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.getAll().catch(() => ({ data: [] })),
    select: (res) => res?.data?.data || res?.data || [],
    enabled: !!user,
  });
  const addresses = addressesQuery.data || [];

  // Tambahkan label kota seller ke produk (untuk ditampilkan di card)
  const productsWithCity = useMemo(
    () => enrichProductsWithCity(products, stores),
    [products, stores],
  );

  const displayProducts = useMemo(() => {
    // 1. Filter berdasarkan lokasi terpilih dari dropdown (jika ada)
    let result = filterProductsByCity(productsWithCity, stores, selectedCity);

    // 2. Mode "terdekat": filter berdasarkan kota alamat default user
    if (filters.sortBy === "terdekat" && addresses.length && stores.length) {
      const primaryAddress =
        addresses.find((a: any) => a.isDefault) || addresses[0];
      const userKota = primaryAddress?.kota;
      if (userKota) {
        const validTokoIds = storeIdsForCity(stores, userKota);
        if (validTokoIds.size > 0) {
          result = result.filter((p) => validTokoIds.has(p.tokoId));
        }
      }
    }

    return result;
  }, [productsWithCity, filters.sortBy, addresses, stores, selectedCity]);

  // Sync URL search param back to search state if it changes externally
  const q_param = searchParams.get("q") || "";
  useEffect(() => {
    if (q_param !== filters.search) {
      filters.setSearch(q_param);
    }
  }, [q_param, filters]);

  return (
    <div className="w-full">
      <KatalogHeader
        total={total}
        search={filters.search}
        setSearch={filters.setSearch}
        onOpenFilter={() => setShowFilter(true)}
        activeFiltersCount={filters.activeFiltersCount}
        categories={categories}
        selectedCategory={filters.selectedCategory}
        onCategoryChange={filters.setSelectedCategory}
        isVerifiedB2B={isVerifiedB2B}
      />

      <div className="desktop-container flex flex-col lg:flex-row gap-6 px-4 lg:px-6 mt-4 lg:mt-8 pb-10">
        <FilterSidebar
          categories={categories}
          stores={stores}
          selectedCategory={filters.selectedCategory}
          onCategoryChange={filters.setSelectedCategory}
          selectedStore={filters.selectedStore}
          onStoreChange={filters.setSelectedStore}
        />

        <div className="flex-1 min-w-0">
          <KatalogToolbar
            total={total}
            search={filters.search}
            sortBy={filters.sortBy}
            onSortChange={filters.setSortBy}
          />

          <ActiveFilterChips
            selectedStore={filters.selectedStore}
            setSelectedStore={filters.setSelectedStore}
            selectedPrice={filters.selectedPrice}
            setSelectedPrice={filters.setSelectedPrice}
            sortBy={filters.sortBy}
            setSortBy={filters.setSortBy}
            stores={stores}
            onReset={filters.resetFilters}
          />

          {loading || initLoading ? (
            <ProductGridSkeleton count={8} />
          ) : displayProducts.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id_produk}
                    product={product}
                    onAddToCart={handleAddToCart}
                    showCart={false}
                  />
                ))}
              </div>
              {hasNextPage && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => fetchNextPage && fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full md:w-auto px-8 py-3.5 rounded-xl border border-primary-200 text-primary-600 font-medium text-sm hover:bg-primary-50 active:bg-primary-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isFetchingNextPage
                      ? "Memuat..."
                      : "Muat Lebih Banyak Produk"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              illustration="/empty-search.svg"
              title="Produk tidak ditemukan"
              description="Coba kata kunci yang berbeda atau hapus filter aktif untuk melihat lebih banyak produk."
              actionLabel="Reset Pencarian"
              onAction={filters.resetFilters}
            />
          )}
        </div>
      </div>

      <FilterBottomSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        categories={categories}
        stores={stores}
        selectedCategory={filters.selectedCategory}
        onCategoryChange={filters.setSelectedCategory}
        selectedStore={filters.selectedStore}
        onStoreChange={filters.setSelectedStore}
        selectedPrice={filters.selectedPrice}
        onPriceChange={filters.setSelectedPrice}
        onReset={filters.resetFilters}
        showSortOptions
        sortBy={filters.sortBy}
        onSortChange={filters.setSortBy}
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
  );
};

const KatalogPage: React.FC = () => {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <KatalogContent />
    </Suspense>
  );
};

export default KatalogPage;
