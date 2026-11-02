export type WilayahType =
  | "Bandung Raya"
  | "Priangan Timur"
  | "Pantura"
  | "Cekungan Bandung"
  | "Sukabumi Raya"
  | "Ciayumajakuning";

export interface Store {
  id: string;
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
  id: string;
  nama: string;
  icon: string;
  jumlahProduk: number;
}

export interface EcomProductGrade {
  id: string;
  grade: "A" | "B" | "C";
  harga: number;
  stok: number;
}

export interface EcomProduct {
  id: string;
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
}

export interface CartItem {
  id: string;
  produkId: string;
  tokoId: string;
  storeName: string;
  produkNama: string;
  harga: number;
  gambar: string;
  satuan: string;
  jumlah: number;
  grade: "A" | "B" | "C";
}

export type EcomOrderStatus =
  | "menunggu_bayar"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export interface EcomOrder {
  id: string;
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
  id: string;
  nama: string;
  email: string;
  telepon: string;
  foto: string;
  alamat: string[];
  tokoFavorit: string[];
}
