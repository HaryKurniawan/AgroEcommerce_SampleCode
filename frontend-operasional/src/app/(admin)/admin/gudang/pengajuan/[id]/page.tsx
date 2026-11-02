"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Store,
  Warehouse,
  MapPin,
  Phone,
  Calendar,
  Package,
  Clock,
  Send,
  Truck,
  CheckCircle2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";

interface PengajuanItem {
  id: string;
  produkGudangId: string;
  namaProduk: string;
  satuan: string;
  hargaGudang: number;
  jumlahPermintaan: number;
  jumlahDisetujui?: number | null;
  totalHargaBeli?: number | null;
  ukuranKemasanKg?: number | null;
  jumlahKemasan?: number | null;
  totalKg?: number | null;
}

interface PengajuanDetail {
  id?: string;
  id_pengajuanStok?: string;
  tokoId: string;
  gudangId: string;
  status: string;
  catatan?: string | null;
  modePengemasan?: string;
  createdAt: string;
  updatedAt: string;
  toko?: {
    id: string;
    nama: string;
    slug?: string;
    alamat?: string;
    telepon?: string;
  };
  gudang?: {
    id: string;
    kode?: string;
    nama: string;
    alamat?: string;
    kabupaten?: string;
    provinsi?: string;
    telepon?: string;
    email?: string;
  };
  items?: PengajuanItem[];
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  DIAJUKAN: {
    label: "Diajukan",
    className: "text-amber-700 bg-amber-50 border-amber-100",
    icon: <Clock size={14} />,
  },
  DIPROSES: {
    label: "Diproses",
    className: "text-blue-700 bg-blue-50 border-blue-100",
    icon: <Send size={14} />,
  },
  DIKIRIM: {
    label: "Dikirim",
    className: "text-indigo-700 bg-indigo-50 border-indigo-100",
    icon: <Truck size={14} />,
  },
  KONFIRMASI_DITERIMA: {
    label: "Konfirmasi Diterima",
    className: "text-emerald-700 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={14} />,
  },
  SELESAI: {
    label: "Selesai",
    className: "text-emerald-700 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle size={14} />,
  },
  DITOLAK: {
    label: "Ditolak",
    className: "text-red-700 bg-red-50 border-red-100",
    icon: <XCircle size={14} />,
  },
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatTanggal = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function DetailPengajuanPage() {
  const router = useRouter();
  const params = useParams();
  const pengajuanId = params.id as string;

  const [data, setData] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await gudangApi.getStockRequestById(pengajuanId);
        const detail = res?.data?.data || res?.data;
        setData(detail);
      } catch (err: any) {
        console.error("Error fetching pengajuan detail:", err);
        setError("Gagal memuat detail pengajuan.");
      } finally {
        setLoading(false);
      }
    };
    if (pengajuanId) fetchData();
  }, [pengajuanId]);

  const statusBadge = (status: string) => {
    const cfg = statusConfig[status];
    if (!cfg) {
      return (
        <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 uppercase tracking-wider">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit uppercase tracking-wider ${cfg.className}`}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <p className="text-gray-400 font-medium">Memuat detail pengajuan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm"
        >
          <ChevronLeft size={18} /> Kembali
        </button>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle size={24} className="shrink-0" />
          <p className="text-sm font-semibold">
            {error || "Pengajuan tidak ditemukan."}
          </p>
        </div>
      </div>
    );
  }

  const items = data.items ?? [];
  const totalNilai = items.reduce(
    (sum, item) =>
      sum +
      (item.totalHargaBeli ??
        item.hargaGudang * (item.jumlahDisetujui ?? item.jumlahPermintaan)),
    0,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm"
        >
          <ChevronLeft size={18} /> Kembali
        </button>
        {statusBadge(data.status)}
      </div>

      {/* Nota Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Nota Header */}
        <div className="p-6 sm:p-8 border-b border-dashed border-gray-200 bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Nota Pengajuan Stok
                </h1>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  #{data.id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Tanggal Pengajuan
              </p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5 justify-end mt-1">
                <Calendar size={14} className="text-gray-400" />
                {formatTanggal(data.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Toko & Gudang Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Toko / Seller */}
          <div className="p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Store size={14} /> Toko / Seller
            </p>
            <h3 className="font-bold text-gray-900">
              {data.toko?.nama || "Toko"}
            </h3>
            {data.toko?.alamat && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5">
                <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                {data.toko.alamat}
              </p>
            )}
            {data.toko?.telepon && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                {data.toko.telepon}
              </p>
            )}
          </div>

          {/* Gudang */}
          <div className="p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Warehouse size={14} /> Gudang Tujuan
            </p>
            <h3 className="font-bold text-gray-900">
              {data.gudang?.nama || "Gudang"}
            </h3>
            {data.gudang?.kode && (
              <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                {data.gudang.kode}
              </p>
            )}
            {data.gudang?.alamat && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5">
                <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                {data.gudang.alamat}
              </p>
            )}
            {data.gudang?.telepon && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                {data.gudang.telepon}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 pb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 pt-4 border-t border-gray-100">
            <Package size={14} /> Daftar Barang Dipesan
          </p>
        </div>

        {items.length === 0 ? (
          <div className="px-6 pb-8 text-center text-sm text-gray-500">
            Tidak ada item pada pengajuan ini.
          </div>
        ) : (
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-3 pr-4 font-bold uppercase tracking-wider text-[11px]">
                    Produk
                  </th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                    Harga Gudang
                  </th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                    Diminta
                  </th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                    Disetujui
                  </th>
                  <th className="py-3 pl-4 font-bold uppercase tracking-wider text-[11px] text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => {
                  const qty = item.jumlahDisetujui ?? item.jumlahPermintaan;
                  const subtotal =
                    item.totalHargaBeli ?? item.hargaGudang * qty;
                  return (
                    <tr key={item.id || item.produkGudangId || `item-${idx}`}>
                      <td className="py-4 pr-4">
                        <p className="font-medium text-gray-900">
                          {item.namaProduk}
                        </p>
                        <p className="text-xs text-gray-500">
                          Satuan: {item.satuan}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        {formatRupiah(item.hargaGudang)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        {item.jumlahPermintaan} {item.satuan}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {item.jumlahDisetujui !== null &&
                        item.jumlahDisetujui !== undefined ? (
                          <span className="font-bold text-emerald-700">
                            {item.jumlahDisetujui} {item.satuan}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right font-bold text-gray-900">
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-100">
                  <td
                    colSpan={4}
                    className="py-4 pr-4 text-right font-bold text-gray-500 uppercase text-xs tracking-wider"
                  >
                    Total Nilai Pengajuan
                  </td>
                  <td className="py-4 pl-4 text-right text-lg font-bold text-emerald-700">
                    {formatRupiah(totalNilai)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Catatan */}
        {data.catatan && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Catatan
              </p>
              <p className="text-sm text-gray-700">{data.catatan}</p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-gray-500">
            Terakhir diperbarui: {formatTanggal(data.updatedAt)}
          </span>
          {data.modePengemasan && (
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Mode Pengemasan: {data.modePengemasan}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
