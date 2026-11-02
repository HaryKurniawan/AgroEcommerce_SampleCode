import { apiClient } from "@/lib/api-client";

export type PeriodType =
  | "TODAY"
  | "WEEK"
  | "MONTH"
  | "LAST_MONTH"
  | "3_MONTHS"
  | "YEAR"
  | "CUSTOM";
export type SortByType = "terjual" | "revenue" | "transaksi";

// ── Produk Terlaris ──────────────────────────────────────────────────────────

export interface ProdukTerlarisFilter {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  kategoriId?: string;
  tokoId?: string;
  limit?: number;
  sortBy?: SortByType;
}

export interface RiwayatBulananFilter {
  month?: number;
  year?: number;
  kategoriId?: string;
  tokoId?: string;
  limit?: number;
}

export interface ProdukTerlarisItem {
  rank: number;
  produk: {
    id: string;
    nama: string;
    gambarUrl?: string;
    harga: number;
    satuan: string;
  };
  toko: { id: string; nama: string };
  jumlahTerjual: number;
  totalRevenue: number;
  jumlahTransaksi: number;
  persenDariKategori?: number;
  // Riwayat only
  prevJumlahTerjual?: number;
  trendPersen?: number;
  trendArah?: "UP" | "DOWN" | "STABLE";
}

export interface KategoriTerlarisData {
  kategori: { id: string; nama: string; icon?: string };
  topProduk: ProdukTerlarisItem[];
  totalKategoriTerjual: number;
  totalKategoriRevenue: number;
}

export interface ProdukTerlarisResponse {
  period: { label: string; startDate: string; endDate: string };
  totalKategori: number;
  data: KategoriTerlarisData[];
}

export interface RiwayatTerlarisResponse {
  period: { month: number; year: number; label: string };
  prevPeriod: { label: string };
  totalKategori: number;
  data: KategoriTerlarisData[];
}

// ── Tren Seller ──────────────────────────────────────────────────────────────

export interface TrenBulananItem {
  bulan: string;
  labelBulan: string;
  totalRevenue: number;
  totalQty: number;
  jumlahTransaksi: number;
  growthRevenuePersen: number | null;
  growthQtyPersen: number | null;
}

export interface TrenBulananResponse {
  bulanKe: number;
  tokoId: string;
  data: TrenBulananItem[];
  summary: {
    bulanTerbaik: TrenBulananItem;
    bulanTerakhir: TrenBulananItem;
    growthVsBulanLalu: number | null;
  };
}

export interface TrenProdukItem {
  rank: number;
  produk: {
    id: string;
    nama: string;
    gambarUrl?: string;
    satuan: string;
    kategori?: { id: string; nama: string };
  };
  jumlahTerjual: number;
  prevJumlahTerjual: number;
  totalRevenue: number;
  jumlahTransaksi: number;
  trendPersen: number;
  trendArah: "UP" | "DOWN" | "STABLE";
}

export interface HeatmapDataItem {
  hariMinggu: number;
  hariLabel: string;
  hariShort: string;
  sesi: "PAGI" | "SIANG" | "SORE" | "MALAM";
  jumlahPesanan: number;
  intensitas: number;
}

export interface PolaPenjualanResponse {
  tahun: number;
  tokoId: string;
  totalPesanan: number;
  heatmap: HeatmapDataItem[];
  kalender: { date: string; count: number; intensitas: number }[];
  insights: {
    hariTerlaris: { hari: number; hariLabel: string; total: number };
    hariTersepi: { hari: number; hariLabel: string; total: number };
    sesiTerbaik: string;
    hariBySales: Array<{ hari: number; hariLabel: string; total: number }>;
  };
}

export interface PertumbuhanProdukItem {
  produk: {
    id: string;
    nama: string;
    gambarUrl?: string;
    satuan: string;
    kategori?: { id: string; nama: string };
  };
  periodeA: { label: string; revenue: number; qty: number };
  periodeB: { label: string; revenue: number; qty: number };
  growthPersen: number;
  label: "NAIK_PESAT" | "STABIL" | "TURUN";
}

export interface PertumbuhanProdukResponse {
  tokoId: string;
  periodeA: { label: string };
  periodeB: { label: string };
  totalProduk: number;
  summary: { naikPesat: number; stabil: number; turun: number };
  data: PertumbuhanProdukItem[];
}

// ── Tren Komoditas Global ─────────────────────────────────────────────────────

export interface TrenKomoditasGlobalFilter {
  kodeKomoditasGlobal?: string;
  bulanKe?: number;
}

export interface TrenKomoditasGlobalItem {
  kodeKomoditasGlobal: string;
  komoditasNama: string;
  jumlahTerjualKgBulanIni: number;
  jumlahTerjualKgBulanLalu: number;
  trendArah: "UP" | "DOWN" | "STABLE";
  trendPersen: number | null;
  hargaJualRataRataPerKg: number;
  jumlahSellerMenjual: number;
}

export interface TrenKomoditasGlobalResponse {
  periode: string;
  periodeSebelumnya: string;
  generatedAt: string;
  data: TrenKomoditasGlobalItem[];
}

// ── API Functions ─────────────────────────────────────────────────────────────

function buildParams(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

export const analyticsApi = {
  // Produk terlaris
  getProdukTerlaris: async (
    filters: ProdukTerlarisFilter,
  ): Promise<ProdukTerlarisResponse> => {
    const q = buildParams(filters as Record<string, any>);
    const res = await apiClient.get(`/analytics/produk-terlaris?${q}`);
    return res.data?.data ?? res.data;
  },

  getRiwayatTerlaris: async (
    filters: RiwayatBulananFilter,
  ): Promise<RiwayatTerlarisResponse> => {
    const q = buildParams(filters as Record<string, any>);
    const res = await apiClient.get(`/analytics/produk-terlaris/riwayat?${q}`);
    return res.data?.data ?? res.data;
  },

  // Tren seller
  getTrenBulanan: async (
    tokoId: string,
    bulanKe = 6,
  ): Promise<TrenBulananResponse> => {
    let url = `/analytics/tren/bulanan?bulanKe=${bulanKe}`;
    if (tokoId) url += `&tokoId=${tokoId}`;
    const res = await apiClient.get(url);
    return res.data?.data ?? res.data;
  },

  getTrenProdukBulanan: async (
    tokoId?: string,
    month?: number,
    year?: number,
    limit = 10,
  ): Promise<{ period: any; prevPeriod: any; data: TrenProdukItem[] }> => {
    const q = buildParams({ tokoId, month, year, limit });
    const res = await apiClient.get(`/analytics/tren/produk-bulanan?${q}`);
    return res.data?.data ?? res.data;
  },

  getTrenProdukBulananRaw: async (
    queryStr: string,
  ): Promise<{ period: any; prevPeriod: any; data: TrenProdukItem[] }> => {
    const res = await apiClient.get(
      `/analytics/tren/produk-bulanan?${queryStr}`,
    );
    return res.data?.data ?? res.data;
  },

  getPolaPenjualan: async (
    tokoId: string,
    year?: number,
    month?: number,
  ): Promise<PolaPenjualanResponse> => {
    let url = `/analytics/tren/pola`;
    const queryParams = new URLSearchParams();
    if (tokoId) queryParams.append("tokoId", tokoId);
    if (year) queryParams.append("year", String(year));
    if (month) queryParams.append("month", String(month));
    const qs = queryParams.toString();
    if (qs) url += `?${qs}`;
    const res = await apiClient.get(url);
    return res.data?.data ?? res.data;
  },

  getPesananHarian: async (tokoId: string, date: string): Promise<any> => {
    let url = `/analytics/tren/pola/pesanan-harian?date=${date}`;
    if (tokoId) url += `&tokoId=${tokoId}`;
    const res = await apiClient.get(url);
    return res.data?.data ?? res.data;
  },

  getPertumbuhanProduk: async (
    tokoId: string,
  ): Promise<PertumbuhanProdukResponse> => {
    let url = `/analytics/tren/pertumbuhan-produk`;
    if (tokoId) url += `?tokoId=${tokoId}`;
    const res = await apiClient.get(url);
    return res.data?.data ?? res.data;
  },

  getPertumbuhanProdukRaw: async (
    queryStr: string,
  ): Promise<PertumbuhanProdukResponse> => {
    const res = await apiClient.get(
      `/analytics/tren/pertumbuhan-produk?${queryStr}`,
    );
    return res.data?.data ?? res.data;
  },

  // Tren Komoditas Global (agregat lintas toko — admin only)
  getTrenKomoditasGlobal: async (
    filters?: TrenKomoditasGlobalFilter,
  ): Promise<TrenKomoditasGlobalResponse> => {
    const q = buildParams((filters ?? {}) as Record<string, any>);
    const res = await apiClient.get(
      `/analytics/tren-komoditas-global${q ? `?${q}` : ""}`,
    );
    return res.data?.data ?? res.data;
  },
};
