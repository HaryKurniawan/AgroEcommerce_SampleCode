import { CartItem } from "../models/ecommerce";

/**
 * API Data Transfer Objects (DTO)
 * represent exactly what the backend API returns in Indonesian naming conventions.
 */

export interface ApiAddressData {
  id?: string | number;
  label?: string;
  penerima?: string;
  telepon?: string;
  alamat?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  provinsi?: string;
  kodePos?: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}

/**
 * Address selection data for wholesale purchase flow
 */
export interface AddressSelectionData {
  id: string;
  label: string; // Address name (e.g., "Home", "Office")
  penerima?: string; // Recipient name
  alamat: string; // Street address
  kota: string; // City
  provinsi?: string; // Province
  kecamatan?: string; // Sub-district
  kelurahan?: string; // District
  kodePos?: string; // Postal code
  isDefault: boolean; // Default address flag
}

/**
 * Formatted address data for display purposes
 */
export interface FormattedAddressData {
  addressName: string; // Display name for address
  addressDetails: string; // Complete formatted address string
  hasAddressName: boolean; // Whether address name exists
}

export interface ApiOrderShipping {
  status?: string;
  kurirName?: string;
  kurirPhone?: string;
  trackingHistory?: { status: string; timestamp?: string; note?: string }[];
}

export interface ApiOrderItem {
  id_itemPesanan?: string;
  produkId?: string;
  produkNama?: string;
  jumlah: number | string;
  harga: number | string;
  satuan?: string;
  gambar?: string;
  tokoId?: string;
  storeName?: string;
  grade?: string;
  varianKemasanId?: string;
  beratGram?: number | string;
  product?: {
    nama?: string;
    gambarUrl?: string;
    store?: { id?: string; nama?: string };
    harga?: number | string;
    satuan?: string;
    beratGram?: number | string;
    grades?: {
      grade: "A" | "B" | "C";
      harga: number | string;
      stok: number | string;
    }[];
  };
  // From seller dashboard
  status?: string;
  totalHarga?: number | string;
  customer?: { name: string };
  customerId?: string;
  items?: unknown[];
}

export interface ApiOrderData {
  id_pesanan: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  tokoId?: string;
  storeName?: string;
  alamatKirim?: string;
  jadwalKirim?: string;
  ongkir?: number | string;
  totalHarga?: number | string;
  metodeBayar?: string;
  items?: ApiOrderItem[];
  item?: ApiOrderItem[];
  shipping?: ApiOrderShipping;
  pengiriman?: Record<string, unknown>;
  paymentUrl?: string;
  paymentId?: string;
  fotoSebelumKirimUrl?: string | null;
  isGrosir?: boolean;
}

export interface ApiStoreData {
  id_toko?: string;
  nama?: string;
  kabupaten?: string;
  wilayah?: string;
  fotoUrl?: string;
  status?: string;
  totalProduk?: number;
  totalPesanan?: number;
  totalPenjualan?: number;
  rating?: number;
  deskripsi?: string;
  alamat?: string;
  telepon?: string;
  noHp?: string;
  noSewa?: string;
  email?: string;
  nomorSIUP?: string;
  jamOperasional?: string;
  lat?: number;
  lng?: number;
  warehouseExternalInfo?: {
    id: string;
    nama: string;
    alamat: string;
  };
  error?: boolean;
}

export interface ApiProductReview {
  id_ulasanProduk: string;
  rating: number;
  ulasan?: string;
  createdAt: string;
  user?: { name: string };
}

export interface ApiOrderReviewStatusItem {
  orderItemId: string;
  produkId: string;
  productNama: string;
  productFoto: string | null;
  productHarga: number | string;
  jumlah: number | string;
  isGrosir?: boolean;
  isReviewed: boolean;
  review: {
    rating: number;
    ulasan: string | null;
  } | null;
}

export type ApiNotifCategory = "Semua" | "Transaksi" | "Info" | "Tugas";

export interface ApiCartItem extends CartItem {
  beratGram?: number | string;
}

export interface ApiUserProfile {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  noTeleponTerverifikasiPada?: string | null;
}

export interface ApiChatMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiChatProductMeta {
  id: string;
  nama: string;
  harga: number | string;
  fotoUrl?: string | null;
  gambarUtama?: string | null;
}

export interface ApiChatOrderMeta {
  orderId: string;
  shortId: string;
  status: string;
  storeName: string;
  totalHarga: number | string;
  itemCount: number;
  firstItemName: string;
  firstItemImage: string | null;
}

export interface ApiChatConversation {
  id: string;
  type: "SELLER_CHAT" | "ADMIN_CS";
  participantA: string;
  participantB: string;
  tokoId?: string;
  tipe?: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  store: {
    id: string;
    nama: string;
    fotoUrl: string | null;
  } | null;
}

export interface ApiShippingInfo {
  tokoId: string;
  namaToko: string;
  distanceKm: number;
  totalWeightKg: number;
  isFallback: boolean;
  ongkir: number;
  isAvailable: boolean;
  keterangan: string;
}

export type TipeNotifikasi =
  | "PESANAN"
  | "PESANAN_BARU"
  | "PEMBAYARAN"
  | "ULASAN"
  | "AKUN"
  | "PROMO"
  | "SISTEM"
  | "STOK"
  | "TOKO"
  | "GROSIR"
  | "LAPORAN"
  | "BROADCAST"
  | "TUGAS_BARU"
  | "TUGAS"
  | "CHAT"
  | "ESKALASI"
  | "VERIFIKASI_TOKO"
  | "VERIFIKASI_B2B";

export interface ApiNotification {
  id: string;
  penggunaId: string;
  judul: string;
  pesan: string;
  tipe: TipeNotifikasi;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}
