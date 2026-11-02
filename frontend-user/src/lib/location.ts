/**
 * Location helpers
 *
 * Logika lokasi dipusatkan di sini agar konsisten antara:
 * - Filter produk per kota di home & katalog
 * - Penentuan "kota tersedia" (available cities) untuk dropdown
 * - Pencocokan kota pembeli vs area cakupan toko (selaras dengan validasi
 *   ongkir di backend: kota toko (kabupaten) + areaCakupanKota)
 *
 * Catatan: pada model Toko, field `kabupaten` adalah kota toko, dan
 * `areaCakupanKota` adalah daftar kota yang dilayani pengiriman.
 */

import type { EcomProduct, Store as EcomStore } from "@/types";

/** Nilai khusus untuk menampilkan semua lokasi (tanpa filter). */
export const ALL_CITIES = "__ALL__";

/** Normalisasi nama kota: lowercase, trim, buang prefix "kota"/"kab"/"kabupaten". */
export const normalizeCity = (value?: string | null): string => {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/^kota\s+/i, "")
    .replace(/^kab\.?\s+/i, "")
    .replace(/^kabupaten\s+/i, "");
};

/** Apakah sebuah toko melayani/berada di kota tertentu. */
export const storeMatchesCity = (
  store: Pick<EcomStore, "kabupaten" | "areaCakupanKota">,
  city: string,
): boolean => {
  const target = normalizeCity(city);
  if (!target) return false;

  if (normalizeCity(store.kabupaten) === target) return true;

  if (Array.isArray(store.areaCakupanKota)) {
    return store.areaCakupanKota.some((c) => normalizeCity(c) === target);
  }
  return false;
};

/** Daftar id toko yang cocok dengan kota tertentu. */
export const storeIdsForCity = (
  stores: EcomStore[],
  city: string,
): Set<string> => {
  return new Set(
    stores.filter((s) => storeMatchesCity(s, city)).map((s) => s.id_toko),
  );
};

export interface AvailableCity {
  name: string;
  sellerCount: number;
}

/** Hitung daftar kota yang punya seller aktif (untuk dropdown lokasi). */
export const computeAvailableCities = (
  stores: EcomStore[],
): AvailableCity[] => {
  const cityMap = new Map<string, number>();
  stores.forEach((store) => {
    if (store.kabupaten) {
      cityMap.set(store.kabupaten, (cityMap.get(store.kabupaten) || 0) + 1);
    }
  });
  return Array.from(cityMap.entries())
    .map(([name, count]) => ({ name, sellerCount: count }))
    .sort((a, b) => b.sellerCount - a.sellerCount);
};

/**
 * Tambahkan label kota seller ke setiap produk (storeCity) berdasarkan
 * relasi toko bawaan atau pencocokan tokoId ke daftar stores.
 */
export const enrichProductsWithCity = (
  products: EcomProduct[],
  stores: EcomStore[],
): EcomProduct[] => {
  if (!Array.isArray(products) || products.length === 0) return products;

  const cityByTokoId = new Map<string, string>();
  stores.forEach((s) => {
    if (s.id_toko && s.kabupaten) cityByTokoId.set(s.id_toko, s.kabupaten);
  });

  return products.map((p) => {
    if (p.storeCity) return p;
    const city = p.toko?.kabupaten || cityByTokoId.get(p.tokoId) || "";
    return city ? { ...p, storeCity: city } : p;
  });
};

/**
 * Filter produk berdasarkan kota terpilih.
 * - Jika city kosong atau ALL_CITIES => kembalikan semua produk.
 * - Jika tidak ada store yang cocok => fallback kembalikan semua (hindari list kosong).
 */
export const filterProductsByCity = (
  products: EcomProduct[],
  stores: EcomStore[],
  city: string | null | undefined,
): EcomProduct[] => {
  if (!city || city === ALL_CITIES) return products;

  const validTokoIds = storeIdsForCity(stores, city);
  if (validTokoIds.size === 0) return products;

  return products.filter((p) => validTokoIds.has(p.tokoId));
};
