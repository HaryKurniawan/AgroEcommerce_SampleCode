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

export interface ApiOrderShipping {
  status?: string;
  kurirName?: string;
  kurirPhone?: string;
  trackingHistory?: { status: string; timestamp?: string; note?: string }[];
}

export interface ApiOrderItem {
  id?: string;
  produkId?: string;
  produkNama?: string;
  jumlah: number | string;
  harga: number | string;
  satuan?: string;
  gambar?: string;
  tokoId?: string;
  storeName?: string;
  grade?: string;
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
  id: string;
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
  shipping?: ApiOrderShipping;
}

export interface ApiStoreData {
  id?: string;
  nama?: string;
  kabupaten?: string;
  wilayah?: string;
  kodePos?: string;
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
  id: string;
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
  isReviewed: boolean;
  review: {
    rating: number;
    ulasan: string | null;
  } | null;
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

export type ApiNotifCategory =
  | "Semua"
  | "Transaksi"
  | "Info"
  | "Tugas"
  | "Sistem";

export interface ApiNotification {
  id: string;
  penggunaId: string;
  judul: string;
  pesan: string;
  tipe: TipeNotifikasi;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface ApiCartItemWithGrades extends CartItem {
  grades?: { grade: "A" | "B" | "C"; harga: number; stok: number }[];
}

export interface ApiUserProfile {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  kurirTokoId?: string;
  kurirToko?: {
    id_toko?: string;
    nama?: string;
    slug?: string;
  };
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
  distanceKm: number;
  totalWeightKg: number;
  isDeliverable: boolean;
  ongkir: number | null;
  message?: string;
}
