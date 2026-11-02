export type StatusProdukSeller = "aktif" | "nonaktif" | "habis" | "draft";
export type StatusPesananSeller =
  | "baru"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";
export type StatusBookingSeller =
  | "masuk"
  | "dikonfirmasi"
  | "selesai"
  | "ditolak";

export interface TokoSaya {
  id: string;
  nama: string;
  kabupaten: string;
  wilayah: string;
  alamat: string;
  deskripsi: string;
  rating: number;
  totalProduk: number;
  totalPesanan: number;
  totalPendapatan: number;
  foto: string;
  status: "aktif" | "nonaktif";
  noHp: string;
  email: string;
  nomorSIUP: string;
}

export interface ProdukSaya {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  satuan: string;
  terjual: number;
  rating: number;
  gambar: string;
  deskripsi: string;
  status: StatusProdukSeller;
  beratPerItem: number;
}

export interface PesananMasuk {
  id: string;
  pembeli: string;
  noHpPembeli: string;
  items: { nama: string; qty: number; harga: number }[];
  total: number;
  status: StatusPesananSeller;
  tanggal: string;
  alamat: string;
  metodeBayar: string;
  catatan?: string;
}

export interface BookingMasuk {
  id: string;
  perusahaan: string;
  pic: string;
  noHp: string;
  komoditas: string;
  jumlahKg: number;
  hargaPerKg: number;
  total: number;
  status: StatusBookingSeller;
  tanggalBooking: string;
  tanggalKirim: string;
}
