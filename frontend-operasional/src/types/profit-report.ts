export interface BatchDetail {
  stokMasukId: string;
  tanggalMasuk: string;
  jumlahDigunakan: number;
  hargaBeli: number;
  totalHargaBeli: number;
}

export interface ProfitTransaction {
  id: string;
  tanggalTransaksi: string;
  nomorPesanan: string;
  pesananId: string;
  jumlahTerjual: number;
  hargaBeli: number;
  hargaJual: number;
  totalHargaBeli: number;
  totalHargaJual: number;
  keuntungan: number;
  persenKeuntungan: number;
  statusPesanan: string;
  batchDetails: BatchDetail[];
}

export interface ProfitSummary {
  totalTransaksi: number;
  totalKeuntungan: number;
  rataRataMargin: number;
  totalPenjualan: number;
  totalHargaBeli: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfitReportResponseDto {
  transaksi: ProfitTransaction[];
  summary: ProfitSummary;
  pagination: Pagination;
}

export interface TopProduct {
  produkId: string;
  namaProduk: string;
  totalKeuntungan: number;
  totalTerjual: number;
}

export interface TrendData {
  periode: string;
  keuntungan: number;
  penjualan: number;
}

export interface ProfitSummaryResponseDto {
  totalKeuntungan: number;
  totalPenjualan: number;
  totalHargaBeli: number;
  rataRataMargin: number;
  produkTerlaris: TopProduct[];
  trendKeuntungan: TrendData[];
  transaksiDetail?: {
    tanggal: string;
    nomorPesanan: string;
    namaProduk: string;
    jumlahTerjual: number;
    keuntungan: number;
  }[];
}
