"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Package,
  Store,
  Warehouse,
  ChevronRight,
  Send,
  Truck,
  CheckCircle2,
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

// Status yang dianggap "aktif" (belum selesai / belum ditolak)
const ACTIVE_STATUSES = [
  "DIAJUKAN",
  "DIPROSES",
  "DIKIRIM",
  "KONFIRMASI_DITERIMA",
];

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  DIAJUKAN: {
    label: "Diajukan",
    className: "text-amber-700 bg-amber-50 border-amber-100",
    icon: <Clock size={12} />,
  },
  DIPROSES: {
    label: "Diproses",
    className: "text-blue-700 bg-blue-50 border-blue-100",
    icon: <Send size={12} />,
  },
  DIKIRIM: {
    label: "Dikirim",
    className: "text-indigo-700 bg-indigo-50 border-indigo-100",
    icon: <Truck size={12} />,
  },
  KONFIRMASI_DITERIMA: {
    label: "Konfirmasi Diterima",
    className: "text-emerald-700 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={12} />,
  },
};

export default function PengajuanAktifPage() {
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

      // Hanya pengajuan dengan status aktif
      const active = all.filter((r) => ACTIVE_STATUSES.includes(r.status));
      setRequests(active);
    } catch (err: any) {
      console.error("Error fetching active stock requests:", err);
      setError("Gagal memuat data pengajuan aktif.");
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
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 uppercase tracking-wider">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 w-fit uppercase tracking-wider ${cfg.className}`}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={26} className="text-emerald-600" /> Pengajuan
            Aktif
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Seluruh pengajuan stok antara seller dan gudang yang masih berjalan
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-emerald-600 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama toko, gudang, atau ID pengajuan..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", ...ACTIVE_STATUSES] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === status
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-200"
            }`}
          >
            {status === "ALL" ? "Semua" : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={40} className="animate-spin text-emerald-600" />
          <p className="text-gray-400 font-medium">Memuat pengajuan aktif...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-gray-300 w-8 h-8" />
          </div>
          <h3 className="text-gray-900 text-lg font-bold">
            Tidak Ada Pengajuan Aktif
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            {search || filterStatus !== "ALL"
              ? "Tidak ada pengajuan yang cocok dengan filter Anda."
              : "Belum ada pengajuan stok yang sedang berjalan."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Toko / Seller
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Gudang
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Item
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req) => (
                  <tr
                    key={req.id || req.id_pengajuanStok}
                    onClick={() =>
                      router.push(
                        `/admin/gudang/pengajuan/${req.id || req.id_pengajuanStok}`,
                      )
                    }
                    className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {req.toko?.nama || "Toko"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Warehouse size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {req.gudang?.nama || "Gudang"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="font-bold text-gray-900">
                          {req.items?.length ?? 0}
                        </span>
                        <span className="text-xs text-gray-500">produk</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={16} className="text-gray-300" />
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
