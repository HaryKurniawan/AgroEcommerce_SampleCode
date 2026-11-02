import { useState, useEffect, useCallback, useMemo } from "react";

import { productsApi, storesApi } from "@/lib/ecommerce-api";
import { extractArray } from "@/lib/api-helpers";

export interface ProductItem {
  id: string;
  nama: string;
  namaEtalase?: string;
  masterProdukId?: string;
  masterProduk?: {
    id: string;
    nama: string;
    allowCustomName: boolean;
    namaWajibMengandung?: string;
  };
  status: string;
  gambarUrl?: string;
  category?: { nama: string };
  deskripsi?: string;
  harga: number | string;
  stok: number | string;
  satuan?: string;
  fotoLainnya?: string[];
  grades?: Array<{ id: string; grade: string; stok: number | string }>;
  terjual?: number | string;
  rating?: number | string;
  diskonPersen?: number | string;
}

export interface StoreData {
  id: string;
  nama: string;
  // Other fields can be optional if not explicitly used yet
  [key: string]: any;
}

export const useSellerProducts = () => {
  const [store, setStore] = useState<any>(null); // Keeping any for now as store layout is complex
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(
    async (page: number = 1, limit: number = 10, showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        // ── STEP 1: Fetch toko seller ───────────────────────────────────────────
        const storeRes = await storesApi.getMyStore();
        const storeData =
          extractArray<StoreData>(storeRes)[0] ||
          storeRes?.data?.data ||
          storeRes?.data;

        setStore(storeData);

        if (!storeData?.id) {
          return;
        }

        const prodRes = await productsApi.getAllByStore(storeData.id, {
          page,
          limit,
          search,
          status: filterStatus,
        } as any);

        const dataArray = extractArray<ProductItem>(prodRes);

        const responseData = prodRes?.data?.data || prodRes?.data;
        if (responseData?.totalPages) {
          setTotalPages(responseData.totalPages);
          setTotalItems(responseData.total || 0);
        }

        const mappedArray = dataArray.map((p) => ({
          ...p,
          id: p.id || (p as any).id_produk,
        }));
        setProducts(mappedArray);
      } catch (error) {
        console.error("[useSellerProducts] ❌ Error fetch:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, filterStatus],
  );

  useEffect(() => {
    // Component will handle initial fetch to pass page and limit
  }, [fetchData]);

  const handleToggleStatus = async (product: ProductItem) => {
    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(product.id);
    try {
      await productsApi.updateStatus(product.id, newStatus);
      await fetchData();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFromEtalase = async (id: string) => {
    if (
      !confirm(
        "Yakin turunkan produk ini dari etalase? (Produk akan tetap ada di Storage)",
      )
    )
      return;
    setActionLoadingId(id);
    try {
      await productsApi.updateStatus(id, "DRAFT");
      await fetchData();
    } catch (error) {
      console.error("Failed to remove from etalase:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddToEtalase = async (id: string) => {
    setActionLoadingId(id);
    try {
      await productsApi.updateStatus(id, "ACTIVE");
      await fetchData();
    } catch (error) {
      console.error("Failed to add to etalase:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateProduct = async (
    id: string,
    data: Partial<ProductItem>,
  ) => {
    try {
      await productsApi.update(id, data);
      await fetchData();
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const filteredEtalase = useMemo(() => {
    // Backend now handles search and status filtering (except DRAFT if we want to hide it,
    // but backend handles DRAFT via status="draft", and "semua" returns all. Wait, if "semua" returns DRAFT, we might want to hide it in Etalase view?
    // Let's just return products.
    return products.filter((p) => p.status !== "DRAFT");
  }, [products]);

  const filteredStorage = useMemo(() => {
    return products;
  }, [products]);

  return {
    store,
    products,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    actionLoadingId,
    filteredEtalase,
    filteredStorage,
    handleToggleStatus,
    handleRemoveFromEtalase,
    handleAddToEtalase,
    handleUpdateProduct,
    refresh: fetchData,
    totalPages,
    totalItems,
  };
};
