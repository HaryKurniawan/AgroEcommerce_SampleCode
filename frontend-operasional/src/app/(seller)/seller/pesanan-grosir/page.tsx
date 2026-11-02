"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  AlertCircle,
  ChevronRight,
  Copy,
  ArrowUpDown,
  ChevronDown,
  TrendingDown,
} from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { useSellerGrosirOrders } from "@/hooks/seller/useSellerGrosirOrders";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";
import { formatRupiah, formatTanggal } from "@/lib/ecommerce-api";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type OrderGrosirDto = {
  id: string;
  status: string;
  totalHarga?: number;
  alamatKirim?: string;
  createdAt: string;
  konsumen?: { nama?: string; email?: string };
  item?: Array<{
    id: string;
    jumlah: number;
    harga: number;
    grade?: string;
    produk?: { nama: string; hargaBeli?: number };
  }>;
};

function CustomSortDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative min-w-[150px] h-[38px] group" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full flex items-center justify-between gap-2 bg-white border shadow-sm rounded-xl px-3.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer ${
          isOpen
            ? "border-emerald-500 ring-4 ring-emerald-500/10"
            : "border-slate-200 hover:border-emerald-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown
            size={14}
            className={`transition-colors ${isOpen ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}`}
          />
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute z-50 mt-1 w-full right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-h-60 overflow-y-auto py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                value === opt.value
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const GrosirOrdersPage: React.FC = () => {
  const router = useRouter();
  const { store, loading: storeLoading } = useSellerDashboard();
  const { orders, isLoading: ordersLoading } = useSellerGrosirOrders(
    store?.id ?? "",
  );
  const [filterStatus, setFilterStatus] = useState("semua");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [diskonGrosirPersen, setDiskonGrosirPersen] = useState<number>(0);
  const [newDiskonGrosirPersen, setNewDiskonGrosirPersen] = useState<number>(0);
  const [savingDiskon, setSavingDiskon] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRes = await apiClient.get("/toko/harga/config");
        const curDiskon = configRes.data.data.diskonGrosirPersen ?? 0;
        setDiskonGrosirPersen(curDiskon);
        setNewDiskonGrosirPersen(curDiskon);
      } catch (err) {
        console.error("Failed to fetch store config", err);
      }
    };
    if (store?.id) {
      fetchConfig();
    }
  }, [store?.id]);

  const handleSaveDiskonGrosir = async () => {
    if (newDiskonGrosirPersen < 0 || newDiskonGrosirPersen > 50) {
      setMessage({
        type: "error",
        text: "Diskon grosir harus antara 0% dan 50%.",
      });
      return;
    }
    setSavingDiskon(true);
    setMessage(null);
    try {
      await apiClient.patch("/toko/harga/config", {
        diskonGrosirPersen: Number(newDiskonGrosirPersen),
      });
      setDiskonGrosirPersen(Number(newDiskonGrosirPersen));
      setMessage({
        type: "success",
        text: "Diskon grosir berhasil diperbarui!",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui diskon grosir.",
      });
    } finally {
      setSavingDiskon(false);
    }
  };

  const loading = storeLoading || (store?.id && ordersLoading);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600/80 animate-spin" />
      </div>
    );
  }

  if (!store || store.error) {
    return (
      <div className="bg-amber-50/50 text-amber-700 p-6 rounded-2xl flex items-center gap-3 border border-amber-100/60 max-w-2xl mx-auto mt-8">
        <AlertCircle size={20} className="text-amber-500 shrink-0" />
        <div className="space-y-0.5">
          <h3 className="font-medium text-sm text-amber-800">
            Toko Tidak Ditemukan
          </h3>
          <p className="text-xs text-amber-600/90 leading-relaxed font-medium">
            Anda harus memiliki toko untuk melihat daftar pesanan grosir.
          </p>
        </div>
      </div>
    );
  }

  const typedOrders: OrderGrosirDto[] = orders ?? [];

  const filtered = typedOrders
    .filter((o) => {
      if (filterStatus === "semua") {
        return !["SELESAI", "DIBATALKAN"].includes(o.status);
      }
      return o.status === filterStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  const statusColor = (s: string) => {
    switch (s) {
      case "MENUNGGU_KONFIRMASI_SELLER":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "MENUNGGU_BAYAR":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "DIPROSES":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "DIKIRIM":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "SELESAI":
        return "bg-slate-50 text-slate-400 border-slate-100";
      case "DIBATALKAN":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <Package size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-800">
              Pembelian Grosiran
            </h1>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
        >
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      {/* Diskon Grosir Setting */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
          <div className="p-2.5 bg-emerald-50 rounded-2xl">
            <TrendingDown size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-800">
              Pengaturan Diskon Grosiran
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Potongan harga otomatis yang diberikan kepada pembeli grosiran
              (min. 300 kg total).
            </p>
          </div>
          {diskonGrosirPersen > 0 && (
            <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full shrink-0">
              Aktif {diskonGrosirPersen}%
            </span>
          )}
          {diskonGrosirPersen === 0 && (
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 font-bold px-2.5 py-1 rounded-full shrink-0">
              Tidak Aktif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Diskon Saat Ini
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-emerald-600">
                {diskonGrosirPersen}%
              </span>
              <span className="text-xs text-slate-400">
                potongan dari subtotal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              {diskonGrosirPersen === 0
                ? "Tidak ada diskon untuk pembelian grosiran saat ini."
                : `Setiap pembeli grosiran mendapat potongan ${diskonGrosirPersen}% dari total pesanan.`}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Ubah Diskon Grosir
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={newDiskonGrosirPersen}
                  onChange={(e) =>
                    setNewDiskonGrosirPersen(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  %
                </span>
              </div>
              <button
                onClick={handleSaveDiskonGrosir}
                disabled={savingDiskon}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
              >
                {savingDiskon ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <TrendingDown size={13} />
                )}
                {savingDiskon ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Rentang 0%–50%. Isi 0 untuk menonaktifkan diskon grosir.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SegmentedControl
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { id: "semua", label: "Aktif" },
            { id: "MENUNGGU_KONFIRMASI_SELLER", label: "Perlu Konfirmasi" },
            { id: "MENUNGGU_BAYAR", label: "Menunggu Bayar" },
            { id: "DIPROSES", label: "Diproses" },
            { id: "DIKIRIM", label: "Dikirim" },
            { id: "SELESAI", label: "Selesai" },
          ].map((tab) => {
            const count =
              tab.id === "semua"
                ? typedOrders.filter(
                    (o) => !["SELESAI", "DIBATALKAN"].includes(o.status),
                  ).length
                : typedOrders.filter((o) => o.status === tab.id).length;
            const isActive = filterStatus === tab.id;

            return {
              value: tab.id,
              label: (
                <div className="flex items-center gap-2">
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              ),
            };
          })}
        />

        <CustomSortDropdown
          value={sortOrder}
          onChange={(val) => setSortOrder(val as "desc" | "asc")}
          options={[
            { value: "desc", label: "Urutkan: Terbaru" },
            { value: "asc", label: "Urutkan: Terlama" },
          ]}
        />
      </div>

      {/* Main Content Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 max-w-xl mx-auto space-y-5">
          <div className="w-14 h-14 bg-slate-100/50 border-2 border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-slate-700">
              Tidak Ada Pesanan
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto px-4 leading-relaxed font-medium">
              Tidak ada pesanan grosir yang ditemukan sesuai dengan filter saat
              ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((order, idx) => {
            const orderId =
              order?.id || order?.id_pesanan || order?.id_pesananEcom;
            return (
              <div
                key={orderId || idx}
                onClick={() => router.push(`/seller/pesanan-grosir/${orderId}`)}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/60 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Header strip */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-medium text-slate-800">
                      {order.konsumen?.nama || "Guest User"}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ${statusColor(order.status)}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatRupiah(Number(order.totalHarga || 0))}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-400">
                    <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                      #
                      {orderId
                        ? String(orderId).slice(0, 8).toUpperCase()
                        : "..."}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId)
                          navigator.clipboard.writeText(String(orderId));
                      }}
                      title="Salin ID"
                      className="text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      <Copy size={11} />
                    </button>
                    <span>•</span>
                    <span>{formatTanggal(order.createdAt)}</span>
                  </div>

                  {/* Items */}
                  {order.item && order.item.length > 0 ? (
                    <div className="space-y-2.5">
                      {order.item.slice(0, 2).map((item, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-sm flex-shrink-0 border border-slate-100">
                            <Package size={14} className="text-slate-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-700 truncate">
                              {item.produk?.nama?.replace(" - ", " ") || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.jumlah} kg ×{" "}
                              {formatRupiah(Number(item.harga))}
                            </p>
                          </div>
                          <p className="text-[12px] font-medium text-slate-600 whitespace-nowrap">
                            {formatRupiah(
                              Number(item.jumlah) * Number(item.harga),
                            )}
                          </p>
                        </div>
                      ))}
                      {order.item.length > 2 && (
                        <p className="text-[11px] text-slate-400 pl-12">
                          +{order.item.length - 2} produk lainnya
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Data produk tidak tersedia
                    </p>
                  )}
                </div>

                {/* Footer actions */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-2 px-5 py-3 bg-slate-50/60 border-t border-slate-100/80"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Aksi grosir khusus dapat ditambahkan di sini nantinya */}
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/seller/pesanan-grosir/${orderId}`)
                    }
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors whitespace-nowrap"
                  >
                    Detail <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrosirOrdersPage;
