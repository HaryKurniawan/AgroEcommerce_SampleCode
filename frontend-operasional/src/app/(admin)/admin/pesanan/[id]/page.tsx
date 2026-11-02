"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
  User,
  Store,
  CreditCard,
  Copy,
  CheckCircle2,
  Truck,
  ClipboardList,
} from "lucide-react";

import { formatRupiah, formatTanggal, ordersApi } from "@/lib/ecommerce-api";

const STATUS_BADGE: Record<string, string> = {
  MENUNGGU_BAYAR: "bg-orange-50 text-orange-600 border-orange-200",
  MENUNGGU_KONFIRMASI_SELLER: "bg-amber-50 text-amber-600 border-amber-200",
  DIPROSES: "bg-blue-50 text-blue-600 border-blue-200",
  DIKIRIM: "bg-sky-50 text-sky-600 border-sky-200",
  SELESAI: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DIBATALKAN: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_BAYAR: "Menunggu Bayar",
  MENUNGGU_KONFIRMASI_SELLER: "Menunggu Konfirmasi Seller",
  DIPROSES: "Sedang Diproses",
  DIKIRIM: "Dalam Pengiriman",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

interface OrderDetail {
  id: string;
  id_pesanan?: string;
  id_pesananEcom?: string;
  pesananId?: string;
  _id?: string;
  status: string;
  totalHarga?: number | string;
  total?: number | string;
  ongkir?: number | string;
  metodeBayar?: string;
  alamatKirim?: string;
  alamat?: string;
  catatan?: string;
  createdAt?: string;
  tanggal?: string;
  penerima?: string;
  teleponPenerima?: string;
  customer?: { name?: string; email?: string; phone?: string };
  konsumen?: { nama?: string; email?: string; noTelepon?: string };
  toko?: { id?: string; nama?: string };
  tokoNama?: string;
  tokoId?: string;
  items?: Array<{
    id?: string;
    jumlah?: number;
    qty?: number;
    harga?: number | string;
    grade?: string;
    produk?: {
      nama?: string;
      gambarUrl?: string;
      satuan?: string;
      toko?: { id?: string; nama?: string };
    };
    product?: {
      nama?: string;
      gambarUrl?: string;
      satuan?: string;
      store?: { id?: string; nama?: string };
    };
    nama?: string;
  }>;
  shipping?: {
    status?: string;
    kurirName?: string;
    kurirPhone?: string;
    catatan?: string;
    buktiKirimFoto?: string[];
    buktiKirimCatatan?: string;
  };
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">
        {value}
      </span>
    </div>
  );
}

export default function AdminDetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await ordersApi.getById(id);
        let data = res?.data?.data || res?.data;
        if (data) {
          // Normalize data
          data = {
            ...data,
            shipping: data.shipping || data.pengiriman,
            customer: data.customer || {
              name: data.konsumen?.nama,
              email: data.konsumen?.email,
              phone:
                data.konsumen?.noTelepon ||
                data.konsumen?.addresses?.[0]?.telepon,
            },
            items: (data.items || data.item || []).map((it: any) => ({
              ...it,
              product: it.product || it.produk,
              produk: it.produk || it.product,
            })),
          };
        }
        setOrder(data);
      } catch {
        setError("Gagal memuat detail pesanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCopy = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStoreName = (): { name: string; id?: string } => {
    if (!order) return { name: "—" };
    if (order.toko?.nama) return { name: order.toko.nama, id: order.toko.id };
    if (order.tokoNama) return { name: order.tokoNama, id: order.tokoId };
    const allItems = order.items || [];
    for (const item of allItems) {
      if (item.produk?.toko?.nama)
        return { name: item.produk.toko.nama, id: item.produk.toko.id };
      if (item.product?.store?.nama)
        return { name: item.product.store.nama, id: item.product.store.id };
    }
    return { name: "—" };
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-gray-400 font-medium text-sm">
          Memuat detail pesanan...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 flex flex-col items-center gap-2 text-center">
        <AlertCircle size={32} className="mb-1" />
        <h2 className="text-base font-bold">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm">{error || "Data pesanan tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-1.5 bg-white rounded-lg shadow-sm text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  const statusKey = (order.status || "").toUpperCase();
  const store = getStoreName();
  const customerName =
    order.customer?.name || order.konsumen?.nama || order.penerima || "—";
  const customerEmail = order.customer?.email || order.konsumen?.email || "—";
  const orderIdRaw = String(
    order.id ||
      order.id_pesanan ||
      order.id_pesananEcom ||
      order.pesananId ||
      order._id ||
      "",
  );
  const shortId = `#${orderIdRaw.slice(-12).toUpperCase()}`;
  const totalHarga = Number(order.totalHarga || order.total || 0);
  const ongkir = Number(order.ongkir || 0);
  const subtotal = totalHarga - ongkir;

  return (
    <div className="w-full space-y-4 pb-10">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={15} /> Kembali
        </button>
      </div>

      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={20} className="text-emerald-600" />
            Detail Pesanan
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-gray-500">{shortId}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-600 transition-colors"
              title="Salin ID"
            >
              {copied ? (
                <CheckCircle2 size={11} className="text-emerald-500" />
              ) : (
                <Copy size={11} />
              )}
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${STATUS_BADGE[statusKey] || "bg-gray-50 text-gray-500 border-gray-200"}`}
        >
          {STATUS_LABEL[statusKey] || order.status}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Produk */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Package size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Daftar Produk ({order.items?.length || 0} Item)
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item, idx) => {
                const prod = item.product || item.produk;
                const name = prod?.nama || item.nama || "Produk";
                const qty = item.jumlah || item.qty || 0;
                const harga = Number(item.harga || 0);
                const satuan = prod?.satuan || "kg";
                const img = prod?.gambarUrl;

                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {img ? (
                        <Image
                          src={img}
                          alt={name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {qty} {satuan} × {formatRupiah(harga)}
                        {item.grade && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
                            {item.grade}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      {formatRupiah(harga * Number(qty))}
                    </p>
                  </div>
                );
              })}
              {(!order.items || order.items.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Tidak ada item.
                </div>
              )}
            </div>
            {/* Total */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Ongkos Kirim</span>
                <span className="font-semibold">{formatRupiah(ongkir)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
                <span className="font-bold text-gray-800">Total Tagihan</span>
                <span className="font-bold text-emerald-700">
                  {formatRupiah(totalHarga)}
                </span>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {order.catatan && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">
                Catatan Pembeli
              </p>
              <p className="text-sm text-amber-800 italic">{order.catatan}</p>
            </div>
          )}

          {/* Pengiriman */}
          {order.shipping && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Truck size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Info Pengiriman
                </span>
              </div>
              <div className="p-4 space-y-0">
                {order.shipping.kurirName && (
                  <InfoRow label="Kurir" value={order.shipping.kurirName} />
                )}
                {order.shipping.kurirPhone && (
                  <InfoRow
                    label="Telepon Kurir"
                    value={order.shipping.kurirPhone}
                  />
                )}
                {order.shipping.status && (
                  <InfoRow
                    label="Status Pengiriman"
                    value={order.shipping.status.replace(/_/g, " ")}
                  />
                )}
                {order.shipping.catatan && (
                  <InfoRow
                    label="Catatan Kurir"
                    value={order.shipping.catatan}
                  />
                )}
              </div>
              {order.shipping.buktiKirimFoto &&
                order.shipping.buktiKirimFoto.length > 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      Bukti Pengiriman
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {order.shipping.buktiKirimFoto.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                        >
                          <Image
                            src={url}
                            alt={`bukti-${i}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                    {order.shipping.buktiKirimCatatan && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        {order.shipping.buktiKirimCatatan}
                      </p>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          {/* Toko */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Store size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Toko
              </span>
            </div>
            <div className="p-4">
              {store.id ? (
                <button
                  onClick={() => router.push(`/admin/toko/${store.id}`)}
                  className="text-sm font-semibold text-emerald-600 hover:underline text-left"
                >
                  {store.name}
                </button>
              ) : (
                <p className="text-sm text-gray-500">{store.name}</p>
              )}
            </div>
          </div>

          {/* Pembeli */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <User size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pembeli
              </span>
            </div>
            <div className="p-4 space-y-0">
              <InfoRow label="Nama" value={customerName} />
              <InfoRow label="Email" value={customerEmail} />
              {(order.customer?.phone || order.konsumen?.noTelepon) && (
                <InfoRow
                  label="Telepon"
                  value={
                    order.customer?.phone || order.konsumen?.noTelepon || "—"
                  }
                />
              )}
              {order.penerima && order.penerima !== customerName && (
                <InfoRow label="Penerima" value={order.penerima} />
              )}
              {order.teleponPenerima && (
                <InfoRow label="Telp Penerima" value={order.teleponPenerima} />
              )}
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Alamat Pengiriman
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.alamatKirim || order.alamat || "Tidak ada alamat."}
              </p>
            </div>
          </div>

          {/* Pembayaran & Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <CreditCard size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pembayaran
              </span>
            </div>
            <div className="p-4 space-y-0">
              <InfoRow label="Metode" value={order.metodeBayar || "—"} />
              <InfoRow
                label="Tanggal"
                value={formatTanggal(order.createdAt || order.tanggal || "")}
              />
              <InfoRow
                label="ID Penuh"
                value={
                  <span className="font-mono text-[10px] text-gray-500 break-all">
                    {order.id}
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
