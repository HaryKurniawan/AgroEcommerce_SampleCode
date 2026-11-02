export const RETAIL_KG = 1.0; // Retail = 1 kg / pack
export const MEDIUM_KG = 2.5; // Medium = 2.5 kg / pack

export interface ProductData {
  id: string;
  nama: string;
  varianProduk?: string | null;
  hargaGudang: number;
  satuan: string;
  minimalPembelianKg?: number;
  gambarUrl?: string;
}

export interface GudangData {
  id: string;
  nama: string;
  alamat: string;
}

export interface FormItem {
  produkGudangId: string;
  packRetail: number; // jumlah pack 1 kg
  packMedium: number; // jumlah pack 2.5 kg
}
