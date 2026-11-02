"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Warehouse,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Store,
  Calendar,
} from "lucide-react";

import { gudangApi, apiClient } from "@/lib/ecommerce-api";

interface WarehouseDetail {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  telepon?: string;
  email?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StockRequest {
  id: string;
  tokoId: string;
  gudangId: string;
  produkGudangId: string;
  jumlah: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  toko?: {
    id: string;
    nama: string;
  };
  produk?: {
    id: string;
    nama: string;
    satuan: string;
  };
}

const statusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 flex items-center gap-1 w-fit">
          <CheckCircle size={13} /> Aktif
        </span>
      );
    case "INACTIVE":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 flex items-center gap-1 w-fit">
          <XCircle size={13} /> Nonaktif
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 w-fit">
          {status}
        </span>
      );
  }
};

const requestStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 flex items-center gap-1 w-fit uppercase">
          <Clock size={11} /> Menunggu
        </span>
      );
    case "APPROVED":
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 flex items-center gap-1 w-fit uppercase">
          <CheckCircle size={11} /> Disetujui
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 flex items-center gap-1 w-fit uppercase">
          <XCircle size={11} /> Ditolak
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 w-fit uppercase">
          {status}
        </span>
      );
  }
};

export default function DetailGudangPage() {
  const router = useRouter();
  const params = useParams();
  const gudangId = params.id as string;

  const [gudang, setGudang] = useState<WarehouseDetail | null>(null);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const gudangRes = await gudangApi.getWarehouseById(gudangId);
      const gudangData = gudangRes?.data?.data || gudangRes?.data;
      setGudang(gudangData);

      try {
        const requestsRes = await apiClient.get(
          `/ecommerce/pengajuan-stok/admin/all`,
        );
        const requestsData = requestsRes?.data?.data || requestsRes?.data || [];
        const allRequests = Array.isArray(requestsData)
          ? requestsData
          : (requestsData.data ?? []);

        setRequests(
          allRequests.filter((req: any) => req.gudangId === gudangId),
        );
      } catch {
        setRequests([]);
      }
    } catch {
      setError("Gagal memuat data gudang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gudangId) fetchData();
  }, [gudangId]);

  const filteredRequests = requests.filter((req) =>
    filterStatus === "ALL" ? true : req.status === filterStatus,
  );

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-gray-400 font-medium text-sm">
          Memuat detail gudang...
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error || !gudang) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm"
        >
          <ChevronLeft size={18} /> Kembali
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle size={22} className="shrink-0" />
          <p className="text-sm font-semibold">
            {error || "Gudang tidak ditemukan."}
          </p>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Warehouse size={24} className="text-emerald-600" />
              {gudang.nama}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kode:{" "}
              <span className="font-bold text-emerald-600">{gudang.kode}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-emerald-600 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={15} />
          Segarkan
        </button>
      </div>

      {/* ── Info + Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Info Gudang */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Warehouse size={17} className="text-emerald-600" />
            Informasi Gudang
          </h3>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Status
            </p>
            {statusBadge(gudang.status)}
          </div>

          {/* Lokasi */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin size={11} /> Lokasi
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {gudang.kabupaten}, {gudang.provinsi}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
              {gudang.alamat}
            </p>
          </div>

          {/* Kontak */}
          {(gudang.telepon || gudang.email) && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Kontak
              </p>
              {gudang.telepon && (
                <a
                  href={`tel:${gudang.telepon}`}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Phone size={14} /> {gudang.telepon}
                </a>
              )}
              {gudang.email && (
                <a
                  href={`mailto:${gudang.email}`}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Mail size={14} /> {gudang.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Statistik Pengajuan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Package size={17} className="text-emerald-600" />
            Statistik Pengajuan Stok
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-500" />
                <span className="text-sm font-medium text-amber-900">
                  Menunggu
                </span>
              </div>
              <span className="text-xl font-bold text-amber-700">
                {requests.filter((r) => r.status === "PENDING").length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-900">
                  Disetujui
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {requests.filter((r) => r.status === "APPROVED").length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2">
                <XCircle size={15} className="text-red-500" />
                <span className="text-sm font-medium text-red-900">
                  Ditolak
                </span>
              </div>
              <span className="text-xl font-bold text-red-700">
                {requests.filter((r) => r.status === "REJECTED").length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Total</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                {requests.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Riwayat Pengajuan Stok ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={17} className="text-emerald-600" />
            Riwayat Pengajuan Stok
          </h3>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === status
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-200 hover:text-emerald-600"
                  }`}
                >
                  {status === "ALL"
                    ? "Semua"
                    : status === "PENDING"
                      ? "Menunggu"
                      : status === "APPROVED"
                        ? "Disetujui"
                        : "Ditolak"}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Table */}
        {filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">
              Tidak ada pengajuan stok
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Toko / Seller
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Produk
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[11px]">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">
                          {req.toko?.nama || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {req.produk?.nama?.replace(" - ", " ") || "—"}
                      </p>
                      {req.produk?.satuan && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.produk.satuan}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        {req.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {requestStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
