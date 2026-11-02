"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Warehouse,
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Star,
  RefreshCw,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

const FAVORITE_KEY = "seller_gudang_favorit";

interface GudangDetail {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  kapasitas?: number;
  deskripsi?: string;
}

interface RequestItem {
  id: string;
  produk?: { nama: string; varianProduk?: string };
  jumlahPermintaan: number;
  jumlahDisetujui?: number;
}

interface StockRequest {
  id: string;
  gudangId: string;
  status: string;
  catatan?: string;
  catatanGudang?: string;
  createdAt: string;
  items: RequestItem[];
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: <Clock className="w-3 h-3" />,
  },
  DIAJUKAN: {
    label: "Diajukan",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: <Clock className="w-3 h-3" />,
  },
  DISETUJUI: {
    label: "Disetujui",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  DIPROSES: {
    label: "Diproses",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  PROSES_KIRIM: {
    label: "Dikirim",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    icon: <Package className="w-3 h-3" />,
  },
  DIKIRIM: {
    label: "Dikirim",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    icon: <Package className="w-3 h-3" />,
  },
  KONFIRMASI_DITERIMA: {
    label: "Dikonfirmasi",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  SELESAI: {
    label: "Selesai",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  DITOLAK: {
    label: "Ditolak",
    color: "bg-rose-50 text-rose-500 border-rose-100",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function SellerGudangDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gudangId = params?.id as string;

  const [gudang, setGudang] = useState<GudangDetail | null>(null);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_KEY);
      setIsFavorite(saved === gudangId);
    } catch {
      /* ignore */
    }
  }, [gudangId]);

  const toggleFavorite = () => {
    try {
      if (isFavorite) {
        localStorage.removeItem(FAVORITE_KEY);
        setIsFavorite(false);
      } else {
        localStorage.setItem(FAVORITE_KEY, gudangId);
        setIsFavorite(true);
      }
    } catch {
      /* ignore */
    }
  };

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!gudangId) return;
      try {
        if (showLoading) setLoading(true);
        setError("");

        // Fetch gudang detail dan semua pengajuan stok paralel
        const [gudangRes, requestsRes] = await Promise.all([
          gudangApi.getWarehouseById(gudangId).catch(() => null),
          gudangApi.getStockRequests().catch(() => null),
        ]);

        // Gudang detail
        const gData = gudangRes?.data?.data || gudangRes?.data;
        if (gData?.id) {
          setGudang(gData);
        } else {
          // Fallback dari list gudang
          try {
            const allRes = await gudangApi.getAllWarehousesForMarketplace();
            const allData = allRes?.data?.data || allRes?.data || [];
            const found = Array.isArray(allData)
              ? allData.find((w: any) => w.id === gudangId)
              : null;
            if (found) setGudang(found);
          } catch {
            /* ignore */
          }
        }

        // Filter pengajuan stok hanya untuk gudang ini
        const allReqs = requestsRes?.data?.data || requestsRes?.data || [];
        const filtered = Array.isArray(allReqs)
          ? allReqs.filter((r: StockRequest) => r.gudangId === gudangId)
          : [];
        setRequests(filtered);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    },
    [gudangId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    const s = STATUS_MAP[status] || {
      label: status,
      color: "bg-slate-50 text-slate-500 border-slate-100",
      icon: null,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${s.color}`}
      >
        {s.icon}
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600/80 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Memuat detail gudang...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.push("/seller/gudang")}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Gudang
      </button>

      {error && (
        <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Card Detail Gudang */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  {gudang?.nama || `Gudang ${gudangId.slice(0, 8)}`}
                </h1>
                <p className="text-emerald-50/80 text-xs mt-0.5">
                  ID: {gudangId.slice(0, 12)}...
                </p>
              </div>
            </div>

            {/* Favorite toggle */}
            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? "bg-amber-400/20 border-amber-300/40 text-amber-200"
                  : "bg-white/10 border-white/20 text-white/70 hover:text-amber-300"
              }`}
              title={isFavorite ? "Hapus dari favorit" : "Jadikan favorit"}
            >
              <Star
                className={`w-4 h-4 ${isFavorite ? "fill-amber-300 text-amber-300" : ""}`}
              />
            </button>
          </div>

          {isFavorite && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 text-amber-100 text-[11px] font-medium px-3 py-1 rounded-full">
              <Star className="w-3 h-3 fill-amber-200 text-amber-200" />
              Gudang Favorit — Produk dari gudang ini ditampilkan lebih dulu
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gudang?.alamat && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">
                    Alamat
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {gudang.alamat}
                  </p>
                </div>
              </div>
            )}
            {gudang?.telepon && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">
                    Telepon
                  </p>
                  <p className="text-sm text-slate-700">{gudang.telepon}</p>
                </div>
              </div>
            )}
            {gudang?.kapasitas && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                  <Warehouse className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">
                    Kapasitas
                  </p>
                  <p className="text-sm text-slate-700">
                    {gudang.kapasitas} Ton
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-50">
            <button
              onClick={() =>
                router.push(`/seller/gudang/produk?gudangId=${gudangId}`)
              }
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Package className="w-3.5 h-3.5" />
              Lihat Daftar Produk
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Pengajuan ke Gudang Ini */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600/70" />
            Riwayat Pengajuan ke Gudang Ini
            <span className="text-[11px] font-normal text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              {requests.length} pengajuan
            </span>
          </h2>
          <button
            onClick={() => fetchData(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Belum ada pengajuan ke gudang ini
            </p>
            <button
              onClick={() =>
                router.push(`/seller/gudang/produk?gudangId=${gudangId}`)
              }
              className="mx-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 hover:bg-emerald-700"
            >
              <Package className="w-3.5 h-3.5" />
              Mulai Pengajuan
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {requests.map((req) => (
              <button
                key={req.id}
                onClick={() => router.push(`/seller/pengajuan-stok/${req.id}`)}
                className="w-full bg-white border border-slate-100 hover:border-emerald-200/60 rounded-2xl p-4 transition-all hover:shadow-sm text-left group flex items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {req.items?.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100"
                      >
                        {item.produk?.varianProduk
                          ? `${item.produk.nama?.replace(" - ", " ")} ${item.produk.varianProduk}`
                          : item.produk?.nama?.replace(" - ", " ") ||
                            "Produk"}{" "}
                        &mdash; {item.jumlahPermintaan.toLocaleString("id-ID")}{" "}
                        kg
                      </span>
                    ))}
                    {req.items?.length > 3 && (
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100">
                        +{req.items.length - 3} lainnya
                      </span>
                    )}
                  </div>
                  {req.catatanGudang && (
                    <p className="text-[11px] text-slate-400 italic truncate">
                      Catatan gudang: {req.catatanGudang}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
