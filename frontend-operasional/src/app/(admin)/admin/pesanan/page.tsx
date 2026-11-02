"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Store,
  ChevronRight,
} from "lucide-react";

import { ordersApi, formatRupiah, formatTanggal } from "@/lib/ecommerce-api";

interface OrderItem {
  produk?: {
    nama?: string;
    gambarUrl?: string;
    toko?: { id?: string; nama?: string };
  };
  product?: {
    nama?: string;
    gambarUrl?: string;
    store?: { id?: string; nama?: string };
  };
  nama?: string;
  jumlah?: number | string;
  qty?: number | string;
  harga?: number | string;
}

interface OrderData {
  id: string;
  id_pesanan?: string;
  status: string;
  createdAt?: string;
  tanggal?: string;
  customer?: { name?: string; email?: string };
  konsumen?: { nama?: string; email?: string };
  pembeli?: string;
  penerima?: string;
  alamatKirim?: string;
  alamat?: string;
  tokoNama?: string;
  tokoId?: string;
  toko?: { id?: string; nama?: string };
  items?: OrderItem[];
  item?: OrderItem[];
  metodeBayar?: string;
  totalHarga?: number | string;
  total?: number | string;
  ongkir?: number | string;
}

const STATUS_TABS = [
  { id: "semua", label: "Semua" },
  { id: "menunggu_bayar", label: "Menunggu Bayar" },
  { id: "diproses", label: "Diproses" },
  { id: "dikirim", label: "Dikirim" },
  { id: "selesai", label: "Selesai" },
  { id: "dibatalkan", label: "Dibatalkan" },
];

const STATUS_BADGE: Record<string, string> = {
  MENUNGGU_BAYAR: "bg-orange-50 text-orange-600 border-orange-200",
  DIPROSES: "bg-amber-50 text-amber-600 border-amber-200",
  DIKIRIM: "bg-blue-50 text-blue-600 border-blue-200",
  SELESAI: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DIBATALKAN: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_BAYAR: "Menunggu Bayar",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function getStoreName(order: OrderData): { name: string; id?: string } {
  // Try direct toko field first
  if (order.toko?.nama) return { name: order.toko.nama, id: order.toko.id };

  // Try tokoNama
  if (order.tokoNama) return { name: order.tokoNama, id: order.tokoId };

  // Try items (support both items and item array keys)
  const allItems = order.items || order.item || [];
  for (const item of allItems) {
    if (item.produk?.toko?.nama)
      return { name: item.produk.toko.nama, id: item.produk.toko.id };
    if (item.product?.store?.nama)
      return { name: item.product.store.nama, id: item.product.store.id };
  }

  return { name: "—" };
}

function getCustomerName(order: OrderData): string {
  return (
    order.konsumen?.nama ||
    order.customer?.name ||
    order.penerima ||
    order.pembeli ||
    "—"
  );
}

export default function ManajemenPesananPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError("");

        const payload: { limit: number; status?: string } = { limit: 200 };
        if (filterStatus !== "semua") {
          payload.status = filterStatus.toUpperCase();
        }

        const res = await ordersApi.adminGetAll(payload);
        const data = res?.data?.data || res?.data;

        if (data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch {
        setError("Gagal memuat data pesanan.");
      } finally {
        setLoading(false);
      }
    },
    [filterStatus],
  );

  useEffect(() => {
    Promise.resolve().then(() => fetchOrders(false));
  }, [filterStatus, fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.id || "").toLowerCase().includes(q) ||
      getCustomerName(o).toLowerCase().includes(q) ||
      getStoreName(o).name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={24} className="text-emerald-600" />
            Manajemen Pesanan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Lacak dan pantau seluruh transaksi masuk pada platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <ShoppingBag size={14} className="text-emerald-600" />
            <span className="text-sm font-bold text-emerald-800">
              {filteredOrders.length} Pesanan
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex overflow-x-auto w-full md:w-auto hide-scrollbar gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, pembeli, atau toko..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <Loader2 size={32} className="animate-spin text-emerald-600 mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            Memuat data pesanan...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-10 flex flex-col items-center justify-center text-center">
          <AlertCircle size={36} className="text-red-500 mb-3" />
          <h3 className="text-base font-bold text-red-700 mb-1">
            Gagal Memuat Data
          </h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold text-xs hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Pesanan Kosong
          </h3>
          <p className="text-gray-400 text-sm">
            Tidak ada pesanan yang sesuai dengan filter saat ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    ID Pesanan
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Pembeli
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Toko
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Produk
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const store = getStoreName(order);
                  const customer = getCustomerName(order);
                  const orderId = order.id || order.id_pesanan;
                  const shortId = orderId
                    ? `#${orderId.slice(-8).toUpperCase()}`
                    : "—";
                  const allItems = order.items || order.item || [];
                  const firstItem = allItems[0];
                  const productName =
                    firstItem?.produk?.nama?.replace(" - ", " ") ||
                    firstItem?.product?.nama?.replace(" - ", " ") ||
                    firstItem?.nama ||
                    "—";
                  const moreItems =
                    allItems.length > 1
                      ? `+${allItems.length - 1} lainnya`
                      : null;
                  const statusKey = (order.status || "").toUpperCase();

                  return (
                    <tr
                      key={orderId || Math.random().toString()}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/pesanan/${orderId}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-700">
                          {shortId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-[120px]">
                          {customer}
                        </p>
                        {order.customer?.email && (
                          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                            {order.customer.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {store.id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/toko/${store.id}`);
                            }}
                            className="flex items-center gap-1 text-emerald-600 hover:underline font-semibold"
                          >
                            <Store size={11} />
                            <span className="truncate max-w-[120px]">
                              {store.name}
                            </span>
                          </button>
                        ) : (
                          <span className="text-gray-400">{store.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 truncate max-w-[140px]">
                          {productName}
                        </p>
                        {moreItems && (
                          <p className="text-[10px] text-gray-400">
                            {moreItems}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${STATUS_BADGE[statusKey] || "bg-gray-50 text-gray-500 border-gray-200"}`}
                        >
                          {STATUS_LABEL[statusKey] || order.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatRupiah(order.totalHarga || order.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {formatTanggal(
                          order.createdAt ||
                            order.tanggal ||
                            new Date().toISOString(),
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/pesanan/${order.id}`);
                          }}
                          className="flex items-center gap-0.5 text-emerald-600 hover:underline font-semibold ml-auto"
                        >
                          Detail <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
