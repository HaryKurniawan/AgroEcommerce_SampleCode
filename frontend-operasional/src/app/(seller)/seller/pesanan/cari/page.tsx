"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  User,
  Package,
  ClipboardList,
  ChevronRight,
  Copy,
  CheckCircle,
} from "lucide-react";

import { formatRupiah, formatTanggal, ordersApi } from "@/lib/ecommerce-api";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";

export default function SearchTransactionPage() {
  const router = useRouter();
  const { store, loading: storeLoading } = useSellerDashboard();
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim();
    if (!cleanId) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await ordersApi.getById(cleanId);
      const data = res?.data?.data || res?.data;

      if (!data || !data.id) {
        setError(
          "Transaksi tidak ditemukan. Harap periksa kembali ID Transaksi Anda.",
        );
        return;
      }

      // Check if order belongs to the seller's store
      const orderTokoId =
        data.tokoId ||
        data.storeId ||
        data.toko?.id ||
        data.items?.[0]?.product?.tokoId ||
        data.item?.[0]?.produk?.tokoId;

      if (store && orderTokoId && orderTokoId !== store.id) {
        setError(
          "Transaksi tidak ditemukan. Harap periksa kembali ID Transaksi Anda.",
        );
      } else {
        setOrder(data);
      }
    } catch (err: any) {
      console.error("Search order error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Transaksi tidak ditemukan dalam database.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if it is a wholesale order
  const isGrosir = order
    ? order.isGrosir === true ||
      order.isGrosir === 1 ||
      order.isGrosir === "true" ||
      order.tipePesanan === "GROSIR" ||
      (!!order.konsumen && !order.customer) ||
      (Array.isArray(order.item) && !order.items)
    : false;

  const items = order ? order.item || order.items || [] : [];
  const status = order?.status || "UNKNOWN";

  // Normalization for customer names
  const accountName =
    order?.customer?.name || order?.konsumen?.nama || "Guest User";
  const recipientName =
    order?.penerima || order?.customer?.penerima || accountName;
  const recipientPhone =
    order?.teleponPenerima ||
    order?.customer?.teleponPenerima ||
    order?.customer?.phone ||
    order?.customer?.phoneNumber ||
    "-";

  // Status style helper
  const getStatusBadge = (s: string) => {
    switch (s) {
      case "MENUNGGU_KONFIRMASI_SELLER":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "MENUNGGU_BAYAR":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DIPROSES":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "DIKIRIM":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "SELESAI":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "DIBATALKAN":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <Search size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Cari Transaksi
          </h1>
        </div>
        <p className="text-gray-500">
          Cari dan cek status pesanan dari database menggunakan ID Transaksi
          (Grosir maupun Biasa).
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={handleSearch}
        className="flex gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm"
      >
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Masukkan ID Transaksi (misal: 65cb4fd... atau UUID penuh)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 placeholder-gray-400 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchId.trim()}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Cari <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-start gap-3 border border-red-100 shadow-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Transaksi Tidak Ditemukan</h3>
            <p className="text-xs mt-1 text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!loading && !error && !order && (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm max-w-sm">
            Masukkan ID transaksi pada form di atas untuk mengecek status
            pesanan dalam database.
          </p>
        </div>
      )}

      {/* Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-slide-up">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-200/70 border border-gray-300/40 text-gray-600 rounded flex items-center gap-1.5">
                  ID: {order.id}
                  <button
                    onClick={handleCopyId}
                    className="p-0.5 text-gray-400 hover:text-emerald-600 rounded transition-colors"
                    title="Salin ID Pesanan"
                  >
                    {copiedId ? (
                      <CheckCircle size={10} className="text-emerald-600" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(status)}`}
                >
                  {status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                Dibuat pada: {formatTanggal(order.createdAt)}
              </p>
            </div>

            <div className="shrink-0">
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  isGrosir
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isGrosir ? "📦 Pembelian Grosir" : "🛍️ Pesanan Biasa (Eceran)"}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-50">
            {/* Left Col: Customer & Shipping */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <User size={12} className="text-gray-400" />
                  Informasi Penerima
                </h4>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-sm">
                  <p className="font-bold text-gray-900">{recipientName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Telp: {recipientPhone}
                  </p>
                  {accountName !== recipientName && (
                    <p className="text-[10px] text-gray-400 mt-1 border-t border-gray-200/60 pt-1">
                      Akun Pemesan: {accountName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <MapPin size={12} className="text-gray-400" />
                  Alamat Pengiriman
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3.5 border border-gray-100 font-medium">
                  {order.alamatKirim || "Tidak ada alamat tercatat."}
                </p>
              </div>
            </div>

            {/* Right Col: Transaction info & Payment */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <User size={12} className="text-gray-400" />
                  Metode Pembayaran
                </h4>
                <p className="text-sm text-gray-900 font-bold uppercase bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  {order.metodeBayar || "-"}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <Package size={12} className="text-gray-400" />
                  Daftar Barang ({items.length} Item)
                </h4>
                <div className="max-h-[140px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 bg-gray-50/50">
                  {items.map((it: any, idx: number) => {
                    const prod = it.produk || it.product;
                    const name = prod?.nama || "Produk";
                    const qty = it.jumlah;
                    const sat = prod?.satuan || "kg";
                    const unitPrice = Number(it.harga) || 0;

                    return (
                      <div
                        key={it.id || idx}
                        className="p-2.5 flex justify-between items-center text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {name}
                          </p>
                          <p className="text-gray-400 mt-0.5">
                            {qty} {sat} × {formatRupiah(unitPrice)}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 ml-2">
                          {formatRupiah(unitPrice * qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Total & Link */}
          <div className="p-6 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Transaksi
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {formatRupiah(Number(order.totalHarga) || 0)}
              </p>
            </div>

            <button
              onClick={() => {
                const orderId =
                  order.id || order.id_pesanan || order.id_pesananEcom;
                if (isGrosir) {
                  router.push(`/seller/pesanan-grosir/${orderId}`);
                } else {
                  router.push(`/seller/pesanan/${orderId}`);
                }
              }}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100/50 active:scale-95"
            >
              Buka Detail Transaksi
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
