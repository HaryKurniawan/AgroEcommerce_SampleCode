"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Loader2,
  Store,
  FileSpreadsheet,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { storesApi } from "@/lib/api/stores";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

interface StoreData {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  logoUrl?: string;
  alamat?: string;
  wilayah?: string;
  status?: string;
  createdAt: string;
}

export default function AdminLaporanPenjualanPage() {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated, user } = useAuthStore();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingStoreId, setDownloadingStoreId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN_CS") {
      toast.error("Akses ditolak. Halaman ini khusus Administrator.");
      router.push("/");
      return;
    }

    const fetchStores = async () => {
      try {
        const response = await storesApi.adminGetAll();
        const raw = response?.data?.data || response?.data || [];
        const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
        setStores(arr);
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
        toast.error("Gagal memuat daftar toko / seller");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [_hasHydrated, isAuthenticated, user, router]);

  const handleDownloadAllData = async () => {
    setDownloadingAll(true);
    const toastId = toast.loading("Menyiapkan Laporan Global Semua Seller...");
    try {
      const response = await apiClient.get(
        "/ecom-pesanan/admin/laporan/excel",
        {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
          responseType: "blob",
        },
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = `${startDate || "semua"}_ke_${endDate || "semua"}`;
      link.setAttribute(
        "download",
        `Laporan_Penjualan_Global_Admin_${dateStr}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan Penjualan Global berhasil diunduh!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Gagal mengunduh laporan global:", error);
      toast.error("Gagal mengunduh laporan global. Coba lagi.", {
        id: toastId,
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDownloadStoreReport = async (
    tokoId: string,
    storeName: string,
  ) => {
    setDownloadingStoreId(tokoId);
    const toastId = toast.loading(`Menyiapkan Laporan Toko ${storeName}...`);
    try {
      const response = await apiClient.get(
        `/ecom-pesanan/penjual/${tokoId}/laporan/excel`,
        {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
          responseType: "blob",
        },
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = `${startDate || "semua"}_ke_${endDate || "semua"}`;
      link.setAttribute(
        "download",
        `Laporan_Transaksi_Seller_${storeName.replace(/\s+/g, "_")}_${dateStr}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Laporan Toko ${storeName} berhasil diunduh!`, {
        id: toastId,
      });
    } catch (error) {
      console.error(`Gagal mengunduh laporan toko ${storeName}:`, error);
      toast.error(`Gagal mengunduh laporan toko ${storeName}. Coba lagi.`, {
        id: toastId,
      });
    } finally {
      setDownloadingStoreId(null);
    }
  };

  const applyPreset = (days: number) => {
    if (days === 0) {
      setStartDate("");
      setEndDate("");
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  if (!_hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-600" size={26} />
          <p className="text-xs text-slate-400 font-normal">
            Memuat data laporan…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* ── Page Header ─────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-600" />
            Laporan Penjualan
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Pantau seluruh transaksi toko seller dan unduh laporan spreadsheet
            terpadu.
          </p>
        </div>
      </div>

      {/* ── Filter & Download Global ─────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          {/* Date Inputs & Presets */}
          <div className="space-y-3 flex-1">
            <p className="text-xs font-normal text-slate-500 flex items-center gap-1.5">
              <Calendar size={13} className="text-primary-600" />
              Filter Rentang Tanggal Laporan
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                  Tanggal Mulai
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                  Tanggal Akhir
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "7 Hari", days: 7 },
                { label: "30 Hari", days: 30 },
                { label: "Semua Waktu", days: 0 },
              ].map((p) => (
                <button
                  key={p.days}
                  onClick={() => applyPreset(p.days)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 text-slate-600 text-xs font-normal rounded-lg border border-slate-200 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download All Button */}
          <button
            onClick={handleDownloadAllData}
            disabled={downloadingAll}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-normal py-2.5 px-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Unduh Semua Data (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Seller List ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Daftar Toko / Seller
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            {stores.length} toko terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              {/* Store Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {store.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt={store.nama}
                      className="w-10 h-10 rounded-xl border border-slate-100 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100/50 flex-shrink-0">
                      <Store size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-normal text-slate-800 truncate leading-snug">
                      {store.nama}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {store.slug}
                    </p>
                  </div>
                </div>

                {store.deskripsi && (
                  <p className="text-xs text-slate-500 line-clamp-2 font-normal">
                    {store.deskripsi}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {store.wilayah && (
                    <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                      <MapPin size={9} /> {store.wilayah}
                    </span>
                  )}
                  {store.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md border border-primary-100">
                      <CheckCircle2 size={9} /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">
                      <AlertCircle size={9} /> {store.status || "Draft"}
                    </span>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownloadStoreReport(store.id, store.nama)}
                disabled={downloadingStoreId !== null}
                className="w-full mt-4 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-normal py-2 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {downloadingStoreId === store.id ? (
                  <>
                    <Loader2 className="animate-spin" size={13} />
                    <span>Mengekspor...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={13} />
                    <span>Unduh Laporan Toko Ini</span>
                  </>
                )}
              </button>
            </div>
          ))}

          {stores.length === 0 && (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center">
              <Store size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-normal text-slate-600">
                Tidak ada seller terdaftar
              </p>
              <p className="text-xs text-slate-400 mt-1 font-normal">
                Daftar toko seller yang terdaftar akan ditampilkan di sini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
