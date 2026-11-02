export interface ProductItem {
  id: string;
  nama: string;
  status: string;
  gambarUrl?: string;
  category?: { nama: string };
  harga: number | string;
  stok: number | string;
  satuan?: string;
  estimasiSegarHari?: number;
  toko?: { defaultKadaluarsaBulan?: number };
  varian?: {
    id: string;
    ukuranKg: number;
    stokKemasan: number;
    isActive: boolean;
  }[];
}

export interface StockLog {
  id: string;
  produkId: string;
  produkNama: string;
  gambarUrl?: string;
  change: number;
  tipe: "MASUK" | "KELUAR" | "PERUBAHAN";
  keterangan: string;
  timestamp: string;
}

export interface BatchItem {
  id: string;
  jumlahMasuk: number;
  jumlahTersisa: number;
  tanggalMasuk: string;
  tanggalKadaluarsa: string | null;
  ukuranKemasanKg?: number;
  jumlahKemasanMasuk?: number;
  jumlahKemasanTersisa?: number;
  pengajuanStok?: {
    id?: string;
    id_pengajuanStok?: string;
  };
  pengajuanStokId?: string;
}
