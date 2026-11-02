"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  Package,
  Store,
  Warehouse,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

interface StockRequestItem {
  id: string;
  produkGudangId: string;
  namaProduk: string;
  satuan: string;
  hargaGudang: number;
  jumlahPermintaan: number;
  jumlahDisetujui?: number;
}

interface StockRequest {
  id?: string;
  id_pengajuanStok?: string;
  tokoId: string;
  gudangId: string;
  status: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
  toko?: { id: string; nama: string; slug?: string };
  gudang?: {
    id: string;
    kode?: string;
    nama: string;
    alamat?: string;
    telepon?: string;
  };
  items?: StockRequestItem[];
}

const HISTORY_STATUSES = ["SELESAI", "DITOLAK"];

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  SELESAI: {
    label: "Selesai",
    className: "text-primary-700 bg-primary-50 border-primary-100",
    icon: <CheckCircle size={10} />,
  },
  DITOLAK: {
    label: "Ditolak",
    className: "text-red-600 bg-red-50 border-red-100",
    icon: <XCircle size={10} />,
  },
};

export default function RiwayatPengajuanPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const res = await gudangApi.getAdminAllStockRequests();
      const raw = res?.data?.data || res?.data || [];
      const all: StockRequest[] = Array.isArray(raw) ? raw : (raw.data ?? []);
      const history = all.filter((r) => HISTORY_STATUSES.includes(r.status));
      setRequests(history);
    } catch (err: any) {
      console.error("Error fetching stock request history:", err);
      setError("Gagal memuat riwayat pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      r.toko?.nama?.toLowerCase().includes(term) ||
      r.gudang?.nama?.toLowerCase().includes(term) ||
      r.id?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const statusBadge = (status: string) => {
    const cfg = statusConfig[status];
    if (!cfg) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-normal text-slate-500 bg-slate-50 border border-slate-100 uppercase tracking-wider">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[10px] font-normal border inline-flex items-center gap-1 uppercase tracking-wider ${cfg.className}`}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* ── Page Header ─────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
            <History size={18} className="text-primary-600" />
            Riwayat Pengajuan
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Riwayat seluruh pengajuan stok yang telah selesai atau ditolak.
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      {/* ── Error ─────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl flex items-center gap-2.5">
          <AlertCircle size={15} className="shrink-0" />
          <p className="text-xs font-normal">{error}</p>
        </div>
      )}

      {/* ── Search & Filter ─────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama toko, gudang, atau ID pengajuan..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Filter Status */}
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", ...HISTORY_STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-normal transition-all ${
                filterStatus === status
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {status === "ALL"
                ? "Semua"
                : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={26} className="animate-spin text-primary-600" />
          <p className="text-xs text-slate-400 font-normal">
            Memuat riwayat pengajuan...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
            <History className="text-slate-300 w-6 h-6" />
          </div>
          <h3 className="text-slate-700 text-sm font-normal">
            Belum Ada Riwayat
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 font-normal max-w-xs mx-auto">
            {search || filterStatus !== "ALL"
              ? "Tidak ada riwayat yang cocok dengan filter Anda."
              : "Belum ada pengajuan stok yang selesai atau ditolak."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    Toko / Seller
                  </th>
                  <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    Gudang
                  </th>
                  <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((req) => (
                  <tr
                    key={req.id || req.id_pengajuanStok}
                    onClick={() =>
                      router.push(
                        `/admin/gudang/pengajuan/${req.id || req.id_pengajuanStok}`,
                      )
                    }
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Store
                          size={13}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="text-xs font-normal text-slate-800">
                          {req.toko?.nama || "Toko"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Warehouse
                          size={13}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="text-xs font-normal text-slate-600">
                          {req.gudang?.nama || "Gudang"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Package
                          size={13}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="text-xs font-normal text-slate-800">
                          {req.items?.length ?? 0}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          produk
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(req.status)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-normal">
                      {new Date(req.updatedAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight
                        size={14}
                        className="text-slate-300 ml-auto"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
