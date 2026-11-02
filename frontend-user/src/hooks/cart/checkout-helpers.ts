/**
 * Checkout Helper Functions & Types
 * Shared utilities untuk checkout flow
 */

import type { ApiOrderItem, ApiShippingInfo } from "@/types";

// ===== TYPES =====

export interface RawGrade {
  grade: string;
  harga: number | string;
}

export interface RawStore {
  id: string;
  nama: string;
}

export interface RawCartItem {
  id: string;
  produkId?: string;
  jumlah: number | string;
  grade?: string;
  varianKemasanId?: string;
  produk?: {
    nama?: string;
    satuan?: string;
    gambarUrl?: string;
    harga?: number | string;
    beratGram?: number | string;
    toko?: RawStore;
    grade?: RawGrade[];
  };
}

export interface StoreGroup {
  tokoId: string;
  storeName: string;
  items: ApiOrderItem[];
  totalWeightGram: number;
  subtotal: number;
}

// ===== HELPER FUNCTIONS =====

/**
 * Map raw cart items ke ApiOrderItem
 */
export function mapCartItemsToOrderItems(
  itemsRaw: any[],
  selectedIds: string[] | null,
): ApiOrderItem[] {
  return itemsRaw
    .filter((i: any) => {
      const itemId = i.id_itemKeranjang || i.id_itemKeranjang;
      return !selectedIds || selectedIds.includes(itemId);
    })
    .map((item: any) => {
      const itemId = item.id_itemKeranjang || item.id_itemKeranjang;
      const productData = item.produk;
      const grades = productData?.grade || [];
      const currentGrade = grades.find((g: RawGrade) => g.grade === item.grade);
      const displayPrice = currentGrade
        ? currentGrade.harga
        : productData?.harga || 0;

      return {
        id: itemId,
        produkId: item.produkId || item.id_produk || "",
        produkNama: productData?.nama || "Unknown Product",
        harga: Number(displayPrice),
        jumlah: Number(item.jumlah),
        satuan: productData?.satuan || "pcs",
        gambar: productData?.gambarUrl || "",
        tokoId:
          productData?.toko?.id || productData?.toko?.id_toko || "unknown",
        storeName: productData?.toko?.nama || "Unknown Store",
        grade: item.grade || "A",
        varianKemasanId: item.varianKemasanId,
        beratGram: productData?.beratGram || 1000,
      };
    });
}

/**
 * Group items by store
 */
export function groupItemsByStore(items: ApiOrderItem[]): StoreGroup[] {
  const groups: StoreGroup[] = [];

  items.forEach((item) => {
    if (!item.tokoId) return;

    let group = groups.find((g) => g.tokoId === item.tokoId);
    if (!group) {
      group = {
        tokoId: item.tokoId,
        storeName: item.storeName || "Unknown Store",
        items: [],
        totalWeightGram: 0,
        subtotal: 0,
      };
      groups.push(group);
    }

    group.items.push(item);
    group.totalWeightGram += Number(item.beratGram || 0) * Number(item.jumlah);
    group.subtotal += Number(item.harga) * Number(item.jumlah);
  });

  return groups;
}

/**
 * Create default shipping info for stores
 */
export function createDefaultShipping(groups: StoreGroup[]): ApiShippingInfo[] {
  return groups.map((group) => ({
    tokoId: group.tokoId,
    namaToko: group.storeName,
    ongkir: 0,
    isAvailable: true,
    distanceKm: 0,
    totalWeightKg: group.totalWeightGram / 1000,
    isFallback: false,
    keterangan: "Default shipping cost",
  }));
}

/**
 * Calculate total shipping cost
 */
export function calculateTotalShipping(
  shippingInfos: ApiShippingInfo[],
  groupedByStore: StoreGroup[],
): { totalOngkir: number; allDeliverable: boolean } {
  let totalOngkir = 0;
  let allDeliverable = true;

  shippingInfos.forEach((info) => {
    if (info.isAvailable) {
      totalOngkir += info.ongkir ?? 0;
    } else {
      allDeliverable = false;
    }
  });

  // If no shipping info yet, use default 0 per store
  if (shippingInfos.length === 0 && groupedByStore.length > 0) {
    totalOngkir = groupedByStore.length * 0;
  }

  return { totalOngkir, allDeliverable };
}

/**
 * Calculate total items price
 */
export function calculateTotalItems(items: ApiOrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + Number(item.harga) * Number(item.jumlah),
    0,
  );
}
