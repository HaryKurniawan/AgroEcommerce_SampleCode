export type WilayahType =
  | "Bandung Raya"
  | "Priangan Timur"
  | "Pantura"
  | "Cekungan Bandung"
  | "Sukabumi Raya"
  | "Ciayumajakuning";

export interface Store {
  id_toko: string;
  nama: string;
  kabupaten: string;
  wilayah: WilayahType;
  deskripsi: string;
  alamat: string;
  telepon: string;
  jamOperasional: string;
  foto: string;
  banner: string;
  rating: number;
  totalProduk: number;
  totalPenjualan: number;
  komoditasUnggulan: string[];
  bergabungSejak: string;
  lat?: number;
  lng?: number;
  areaCakupanKota?: string[];
}

export interface Category {
  id_kategoriToko: string;
  nama: string;
  icon: string;
  jumlahProduk: number;
}

export interface EcomProductGrade {
  id_grade: string;
  grade: "A" | "B" | "C";
  harga: number;
  stok: number;
}

export interface VarianKemasan {
  id_varianKemasan: string;
  produkId: string;
  ukuranKg: number;
  stokKemasan: number;
  harga: number;
  biayaTambahan?: number;
  isActive: boolean;
  sku?: string;
}

export interface EcomProduct {
  id_produk: string;
  tokoId: string;
  storeName: string;
  nama: string;
  namaEtalase?: string;
  masterProdukId?: string;
  kategoriId?: string;
  kategoriNama?: string;
  harga: number;
  hargaAsli?: number;
  satuan: string;
  stok: number;
  deskripsi: string;
  gambarUrl?: string; // Live data uses gambarUrl
  fotoLainnya?: string[];
  nutrisi?: string;
  asalKebun?: string;
  tanggalPanen?: string;
  estimasiSegarHari?: number;
  rating: number;
  terjual: number;
  diskonPersen?: number;
  grade?: EcomProductGrade[];
  isGrosir?: boolean;
  kemasan?: VarianKemasan[];
  varian?: VarianKemasan[];
  // Lokasi seller (dari relasi toko / hasil enrichment)
  toko?: {
    id_toko: string;
    nama: string;
    kabupaten?: string;
  };
  storeCity?: string;
}

export interface CartItem {
  id_itemKeranjang: string;
  produkId: string;
  tokoId: string;
  storeName: string;
  produkNama: string;
  harga: number;
  gambar: string;
  satuan: string;
  jumlah: number;
  varian?: string;
  varianId?: string;
  availableVariants?: VarianKemasan[];
  stok?: number;
  stokTersediaKg?: number;
}

export type EcomOrderStatus =
  | "menunggu_bayar"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export interface EcomOrder {
  id_pesanan: string;
  item: CartItem[];
  totalHarga: number;
  ongkir: number;
  metodeBayar: string;
  alamatKirim: string;
  jadwalKirim: string;
  status: EcomOrderStatus;
  tanggalDibuat: string;
}

export interface CustomerProfile {
  id_pengguna: string;
  nama: string;
  email: string;
  telepon: string;
  foto: string;
  alamat: string[];
  tokoFavorit: string[];
}
