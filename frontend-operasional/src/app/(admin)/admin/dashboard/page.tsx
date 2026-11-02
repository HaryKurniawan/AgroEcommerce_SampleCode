"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Package,
  ClipboardList,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  Loader2,
  ArrowRight,
  ShoppingCart,
  Users,
  Activity,
  ArrowUpRight,
  BarChart2,
  Warehouse,
  CheckCircle2,
  XCircle,
  Clock,
  WifiOff,
  Percent,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  formatRupiah,
  formatTanggal,
  storesApi,
  productsApi,
  ordersApi,
  dashboardApi,
  gudangApi,
} from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";
import {
  AnalyticsCard,
  StatusDistributionBar,
  compute7DayChart,
  computeTrend,
} from "@/components/ecommerce/analytics/AnalyticsWidgets";

interface OrderData {
  id: string;
  id_pesanan?: string;
  id_pesananEcom?: string;
  customer?: { name?: string };
  pembeli?: string;
  tanggalDibuat?: string;
  createdAt?: string;
  totalHarga?: number | string;
  totalAmount?: number | string;
  status?: string;
}

interface ProductData {
  id: string;
  nama?: string;
  gambarUrl?: string;
  gambar?: string;
  emoji?: string;
  store?: { nama?: string };
  tokoNama?: string;
  terjual?: number | string;
  harga?: number | string;
  satuan?: string;
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dikirim: "bg-slate-100 text-slate-700 border-slate-200",
    shipped: "bg-slate-100 text-slate-700 border-slate-200",
    dibatalkan: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    diproses: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const cls = map[s] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-md border font-normal uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

const DashboardAdminPage: React.FC = () => {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [storesCount, setStoresCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [pesananHariIni, setPesananHariIni] = useState(0);
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [topProduk, setTopProduk] = useState<ProductData[]>([]);
  const [affiliationsCount, setAffiliationsCount] = useState(0);
  const [isGudangOnline, setIsGudangOnline] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const [storesRes, productsRes, ordersRes, warehousesRes, statsRes] =
          await Promise.all([
            storesApi.adminGetAll({ limit: 1 }),
            productsApi.getAll({ limit: 100, sortBy: "terjual_desc" }),
            ordersApi.adminGetAll({ limit: 200 }),
            gudangApi.getWarehouses().catch(() => null),
            dashboardApi.getStats().catch(() => null),
          ]);
        setIsGudangOnline(warehousesRes !== null);

        const storesData =
          storesRes?.data?.data?.data || storesRes?.data?.data || [];
        setStoresCount(storesRes?.data?.data?.total || storesData.length || 0);

        const productsData =
          productsRes?.data?.data?.data || productsRes?.data?.data || [];
        setProductsCount(
          productsRes?.data?.data?.total || productsData.length || 0,
        );
        const sortedProducts = [...productsData].sort(
          (a: ProductData, b: ProductData) =>
            Number(b.terjual || 0) - Number(a.terjual || 0),
        );
        setTopProduk(sortedProducts.slice(0, 5));

        const ordersData =
          ordersRes?.data?.data?.data || ordersRes?.data?.data || [];
        setAllOrders(ordersData);

        const sortedOrders = [...ordersData].sort(
          (a: OrderData, b: OrderData) =>
            new Date(b.tanggalDibuat || b.createdAt || "").getTime() -
            new Date(a.tanggalDibuat || a.createdAt || "").getTime(),
        );
        setOrders(sortedOrders.slice(0, 5));

        const today = new Date().toISOString().split("T")[0];
        const hariIniCount = ordersData.filter((o: OrderData) => {
          const d = new Date(o.tanggalDibuat || o.createdAt || "")
            .toISOString()
            .split("T")[0];
          return d === today;
        }).length;
        setPesananHariIni(hariIniCount);

        const total = ordersData
          .filter((o: OrderData) =>
            ["selesai", "SELESAI", "DELIVERED"].includes(o.status ?? ""),
          )
          .reduce(
            (sum: number, o: OrderData) =>
              sum + Number(o.totalHarga || o.totalAmount || 0),
            0,
          );
        setTotalPenjualan(total);

        if (warehousesRes) {
          const whData = warehousesRes?.data?.data || warehousesRes?.data || [];
          setAffiliationsCount(Array.isArray(whData) ? whData.length : 0);
        }

        if (statsRes?.data?.data?.overview) {
          setAdminStats(statsRes.data.data.overview);
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={26} />
          <p className="text-xs text-slate-400 font-normal">
            Memuat data dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Analytics derivations ─────────────────────────────────────────
  const chart7Day = compute7DayChart(allOrders);
  const trendPesanan = computeTrend(allOrders);

  const pendingCount = allOrders.filter((o) =>
    ["MENUNGGU_BAYAR", "DIPROSES"].includes(o.status ?? ""),
  ).length;
  const selesaiCount = allOrders.filter((o) =>
    ["SELESAI", "selesai", "DELIVERED"].includes(o.status ?? ""),
  ).length;
  const batalCount = allOrders.filter((o) =>
    ["DIBATALKAN", "dibatalkan"].includes(o.status ?? ""),
  ).length;
  const dikirimCount = allOrders.filter((o) =>
    ["DIKIRIM", "dikirim"].includes(o.status ?? ""),
  ).length;

  const avgOrderValue =
    allOrders.length > 0
      ? allOrders.reduce(
          (s, o) => s + Number(o.totalHarga || o.totalAmount || 0),
          0,
        ) / allOrders.length
      : 0;

  const conversionRate =
    allOrders.length > 0 ? (selesaiCount / allOrders.length) * 100 : 0;

  const now = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = adminStats
    ? [
        {
          label: adminStats[2]?.label || "Total Toko",
          value: adminStats[2]?.value || storesCount,
          icon: Store,
          trend: "Active",
          path: "/admin/toko",
        },
        {
          label: "Total Produk",
          value: productsCount,
          icon: Package,
          trend: "Aktif",
          path: "/admin/produk",
        },
        {
          label: adminStats[3]?.label || "Total Pesanan",
          value: adminStats[3]?.value || 0,
          icon: ShoppingCart,
          trend: "All Time",
          path: "/admin/pesanan",
        },
        {
          label: adminStats[4]?.label || "Pengajuan Stok",
          value: adminStats[4]?.value || 0,
          icon: Warehouse,
          trend: "Pending Gudang",
          path: "/admin/gudang",
        },
        {
          label: "Total GMV",
          value: formatRupiah(adminStats[5]?.value || totalPenjualan),
          icon: DollarSign,
          trend: "Rupiah",
          path: "/admin/pesanan",
        },
      ]
    : [
        {
          label: "Total Toko",
          value: storesCount,
          icon: Store,
          trend: "+2 bulan ini",
          path: "/admin/toko",
        },
        {
          label: "Total Produk",
          value: productsCount,
          icon: Package,
          trend: "Aktif",
          path: "/admin/produk",
        },
        {
          label: "Pesanan Hari Ini",
          value: pesananHariIni,
          icon: ShoppingCart,
          trend: "Masuk hari ini",
          path: "/admin/pesanan",
        },
        {
          label: "Gudang Tersedia",
          value: affiliationsCount,
          icon: Warehouse,
          trend: "Gudang aktif",
          path: "/admin/gudang",
        },
        {
          label: "Total Penjualan",
          value: formatRupiah(totalPenjualan),
          icon: DollarSign,
          trend: "Pesanan selesai",
          path: "/admin/pesanan",
        },
      ];

  const statusItems = [
    { label: "Selesai", count: selesaiCount, color: "bg-emerald-500" },
    { label: "Dikirim", count: dikirimCount, color: "bg-slate-400" },
    { label: "Pending", count: pendingCount, color: "bg-amber-400" },
    { label: "Batal", count: batalCount, color: "bg-rose-400" },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ─────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-normal text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">{now}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
          <Activity size={13} className="text-emerald-600" />
          <span className="text-xs text-slate-600 font-normal">
            Sistem Online
          </span>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3.5">
        {stats.map((s, i) => (
          <button
            key={i}
            onClick={() => router.push(s.path)}
            className="relative overflow-hidden bg-primary-600 rounded-2xl p-4 text-left group hover:bg-primary-700 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
          >
            {/* Dekorasi Siluet */}
            <div className="absolute -right-4 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -bottom-6 right-2 w-20 h-20 bg-white/5 rounded-full blur-lg group-hover:translate-x-2 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                <s.icon size={16} />
              </div>
              <ArrowUpRight
                size={13}
                className="text-primary-200 group-hover:text-white transition-colors"
              />
            </div>
            <div className="relative z-10">
              <p className="text-[19px] font-bold text-white leading-none tracking-tight">
                {s.value}
              </p>
              <p className="text-[10.5px] text-primary-100 mt-1.5 uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              <p className="text-[10px] text-primary-200/80 mt-0.5 font-medium">
                {s.trend}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Margin & Warehouse Status Bento ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Margin Monitor Quick Link */}
        <div
          onClick={() => router.push("/admin/toko/margin")}
          className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Percent size={18} />
            </div>
            <div>
              <p className="text-sm font-normal text-slate-900">
                Monitor Margin & Profit B2B
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                Pantau margin & estimasi profit seluruh toko aktif
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>

        {/* Gudang API Status Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                isGudangOnline
                  ? "bg-slate-50 text-slate-700 border-slate-100"
                  : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              {isGudangOnline ? <Warehouse size={18} /> : <WifiOff size={18} />}
            </div>
            <div>
              <p className="text-sm font-normal text-slate-900">
                Koneksi API Gudang
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isGudangOnline
                      ? "bg-emerald-500"
                      : "bg-rose-500 animate-pulse"
                  }`}
                />
                <span
                  className={`text-xs font-normal ${
                    isGudangOnline ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {isGudangOnline ? "Sistem Terhubung" : "Terputus / Offline"}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/admin/gudang"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── Analytics Section ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
            <BarChart2 size={12} className="text-slate-500" />
          </div>
          <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider">
            Analitik Platform
          </h2>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
          {/* Total Pesanan + Trend chart */}
          <AnalyticsCard
            label="Total Pesanan (7 Hari)"
            value={chart7Day.reduce((a, b) => a + b, 0)}
            subtitle="Semua status pesanan masuk"
            trend={trendPesanan}
            trendLabel="vs. kemarin"
            chartData={chart7Day}
            chartColor="#10b981"
            icon={<ShoppingCart size={15} />}
            onClick={() => router.push("/admin/pesanan")}
          />

          {/* Pending pesanan */}
          <AnalyticsCard
            label="Pesanan Menunggu"
            value={pendingCount}
            subtitle="Butuh tindakan segera"
            trend={pendingCount > 0 ? undefined : 0}
            chartData={Array(7)
              .fill(0)
              .map(
                (_, i) =>
                  allOrders.filter(
                    (o) =>
                      ["MENUNGGU_BAYAR", "DIPROSES"].includes(o.status ?? "") &&
                      Math.floor(
                        (Date.now() -
                          new Date(
                            o.tanggalDibuat || o.createdAt || "",
                          ).getTime()) /
                          86400000,
                      ) ===
                        6 - i,
                  ).length,
              )}
            chartColor="#64748b"
            icon={<Clock size={15} />}
            onClick={() => router.push("/admin/pesanan")}
          />

          {/* Avg Order Value */}
          <AnalyticsCard
            label="Rata-Rata Pesanan"
            value={formatRupiah(avgOrderValue)}
            subtitle={`Dari ${allOrders.length} total pesanan`}
            chartData={chart7Day.map(
              (c) => c * Math.round(avgOrderValue / 1000),
            )}
            chartColor="#10b981"
            icon={<TrendingUp size={15} />}
            onClick={() => router.push("/admin/pesanan")}
          />

          {/* Conversion Rate */}
          <AnalyticsCard
            label="Tingkat Konversi"
            value={`${conversionRate.toFixed(1)}%`}
            subtitle={`${selesaiCount} selesai dari ${allOrders.length} total`}
            trend={conversionRate - 50}
            trendLabel="vs target 50%"
            chartData={[
              selesaiCount,
              batalCount,
              pendingCount,
              dikirimCount,
            ].map((v) => v || 0)}
            chartColor="#64748b"
            icon={<CheckCircle2 size={15} />}
            onClick={() => router.push("/admin/laporan")}
          />
        </div>
      </div>

      {/* ── Status Distribution ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
              <BarChart2 size={12} className="text-slate-500" />
            </div>
            <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Distribusi Status Pesanan
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            {allOrders.length} Total
          </span>
        </div>
        <StatusDistributionBar items={statusItems} />

        {/* Quick count row */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
          {[
            {
              label: "Selesai",
              count: selesaiCount,
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
            {
              label: "Dikirim",
              count: dikirimCount,
              icon: TrendingUp,
              color: "text-slate-600",
            },
            {
              label: "Pending",
              count: pendingCount,
              icon: Clock,
              color: "text-amber-600",
            },
            {
              label: "Batal",
              count: batalCount,
              icon: XCircle,
              color: "text-rose-600",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <item.icon size={13} className={`${item.color} mx-auto mb-1`} />
              <p className="text-[17px] font-normal text-slate-900">
                {item.count}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-normal">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two columns: Pesanan Terbaru & Top Produk ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pesanan Terbaru */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                <ClipboardList size={12} className="text-slate-500" />
              </div>
              <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Pesanan Terbaru
              </h2>
            </div>
            <button
              onClick={() => router.push("/admin/pesanan")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-normal transition-colors"
            >
              Lihat Semua <ArrowRight size={11} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-normal">
                Belum ada pesanan masuk.
              </div>
            )}
            {orders.map((p, idx) => (
              <div
                key={p?.id || p?.id_pesanan || p?.id_pesananEcom || idx}
                className="flex items-center justify-between py-3 hover:bg-slate-50/50 -mx-1 px-1 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Users size={12} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-normal text-slate-800 leading-tight truncate max-w-[130px]">
                      {p.customer?.name || p.pembeli || "Customer"}
                    </p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 font-normal">
                      {formatTanggal(p.tanggalDibuat || p.createdAt || "")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-normal text-slate-800">
                    {formatRupiah(p.totalHarga || p.totalAmount || 0)}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Produk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={12} className="text-slate-500" />
              </div>
              <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Produk Terlaris
              </h2>
            </div>
            <button
              onClick={() => router.push("/admin/produk")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-normal transition-colors"
            >
              Lihat Semua <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-1">
            {topProduk.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-normal">
                Belum ada data produk.
              </div>
            )}
            {topProduk.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2.5 hover:bg-slate-50/50 -mx-1 px-1 rounded-xl transition-colors"
              >
                <span className="text-xs font-normal w-4 text-center flex-shrink-0 text-slate-400">
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative">
                  {p.gambarUrl || p.gambar ? (
                    <Image
                      src={(p.gambarUrl || p.gambar) as string}
                      alt={p.nama?.replace(" - ", " ") ?? ""}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      {p.emoji || "📦"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-normal text-slate-800 truncate leading-tight">
                    {p.nama?.replace(" - ", " ")}
                  </p>
                  <p className="text-[10.5px] text-slate-400 truncate mt-0.5 font-normal">
                    {p.store?.nama || p.tokoNama || "—"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-normal text-slate-800">
                    {p.terjual || 0}
                    <span className="text-slate-400"> terjual</span>
                  </p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 font-normal">
                    {formatRupiah(p.harga || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdminPage;
