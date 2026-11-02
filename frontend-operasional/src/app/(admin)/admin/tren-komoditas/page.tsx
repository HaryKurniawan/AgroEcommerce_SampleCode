"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  RefreshCw,
  BarChart3,
  Users,
  Package,
} from "lucide-react";

import {
  analyticsApi,
  type TrenKomoditasGlobalItem,
  type TrenKomoditasGlobalResponse,
} from "@/lib/api/analytics";

type SortKey = "terjual" | "tren" | "harga" | "seller";

export default function TrenKomoditasGlobalPage() {
  const [data, setData] = useState<TrenKomoditasGlobalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("terjual");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await analyticsApi.getTrenKomoditasGlobal();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data tren komoditas global");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedData = React.useMemo(() => {
    if (!data?.data) return [];
    const items = [...data.data];
    switch (sortBy) {
      case "terjual":
        return items.sort(
          (a, b) => b.jumlahTerjualKgBulanIni - a.jumlahTerjualKgBulanIni,
        );
      case "tren":
        return items.sort(
          (a, b) => (b.trendPersen ?? 0) - (a.trendPersen ?? 0),
        );
      case "harga":
        return items.sort(
          (a, b) => b.hargaJualRataRataPerKg - a.hargaJualRataRataPerKg,
        );
      case "seller":
        return items.sort(
          (a, b) => b.jumlahSellerMenjual - a.jumlahSellerMenjual,
        );
      default:
        return items;
    }
  }, [data, sortBy]);

  const totalKomoditas = data?.data.length ?? 0;
  const totalTerjualKg =
    data?.data.reduce((s, d) => s + d.jumlahTerjualKgBulanIni, 0) ?? 0;
  const komoditasNaik =
    data?.data.filter((d) => d.trendArah === "UP").length ?? 0;
  const komoditasTurun =
    data?.data.filter((d) => d.trendArah === "DOWN").length ?? 0;

  const fmtKg = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)} ton` : `${n.toFixed(1)} kg`;
  const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const maxQty = Math.max(
    ...(sortedData.map((d) => d.jumlahTerjualKgBulanIni) ?? [1]),
    1,
  );

  const TrendIcon = ({ arah }: { arah: string }) => {
    if (arah === "UP")
      return <TrendingUp size={12} className="text-primary-600" />;
    if (arah === "DOWN")
      return <TrendingDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-slate-400" />;
  };

  const trendBadge = (arah: string, persen: number | null) => {
    const colors =
      arah === "UP"
        ? "bg-primary-50 border-primary-100 text-primary-700"
        : arah === "DOWN"
          ? "bg-red-50 border-red-100 text-red-600"
          : "bg-slate-50 border-slate-100 text-slate-400";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-normal ${colors}`}
      >
        <TrendIcon arah={arah} />
        {arah === "UP" && "+"}
        {persen !== null ? `${persen.toFixed(1)}%` : "-"}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans pb-10">
      {/* ── Page Header ─────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-600" />
            Tren Komoditas Global
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Agregat penjualan komoditas lintas seluruh toko — sinyal permintaan
            pasar
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      {/* ── Period Info ─────────────────── */}
      {data && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <TrendingUp size={13} className="text-primary-600 flex-shrink-0" />
          <p className="text-xs font-normal text-primary-700">
            Periode: <span className="text-primary-900">{data.periode}</span> vs{" "}
            <span className="text-primary-600">{data.periodeSebelumnya}</span>
            <span className="text-primary-400 ml-2">
              · Dihasilkan: {new Date(data.generatedAt).toLocaleString("id-ID")}
            </span>
          </p>
        </div>
      )}

      {/* ── Summary Cards ─────────────────── */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Package,
              label: "Komoditas",
              value: totalKomoditas,
              color: "text-slate-800",
            },
            {
              icon: BarChart3,
              label: "Total Terjual",
              value: fmtKg(totalTerjualKg),
              color: "text-slate-800",
            },
            {
              icon: TrendingUp,
              label: "Naik",
              value: komoditasNaik,
              color: "text-primary-600",
            },
            {
              icon: TrendingDown,
              label: "Turun",
              value: komoditasTurun,
              color: "text-red-500",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <card.icon size={13} className="text-slate-400" />
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <p className={`text-xl font-normal ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ─────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={26} className="animate-spin text-primary-600" />
            <p className="text-xs text-slate-400 font-normal">
              Memuat data tren komoditas...
            </p>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────── */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl flex items-center justify-between">
          <p className="text-xs font-normal">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs text-primary-600 hover:underline font-normal"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Data ─────────────────── */}
      {!loading &&
        !error &&
        data &&
        (data.data.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl">
            <BarChart3 size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-normal text-slate-500">
              Belum ada data tren komoditas
            </p>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Pastikan ada transaksi SELESAI dan produk dipetakan ke kode
              komoditas global
            </p>
          </div>
        ) : (
          <>
            {/* ── Bar Chart Visual ─────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="text-xs font-normal text-slate-500 uppercase tracking-wider mb-4">
                Grafik Qty Terjual Bulan Ini
              </h2>
              <div className="space-y-2.5">
                {sortedData.map((item) => {
                  const widthPct = Math.max(
                    2,
                    (item.jumlahTerjualKgBulanIni / maxQty) * 100,
                  );
                  return (
                    <div
                      key={item.kodeKomoditasGlobal}
                      className="flex items-center gap-3"
                    >
                      <div className="w-28 flex-shrink-0 truncate">
                        <p className="text-[11px] font-normal text-slate-700 truncate">
                          {item.komoditasNama}
                        </p>
                      </div>
                      <div className="flex-1 h-5 bg-slate-50 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-primary-500 rounded-md transition-all duration-700"
                          style={{ width: `${widthPct}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-normal">
                          {fmtKg(item.jumlahTerjualKgBulanIni)}
                        </span>
                      </div>
                      <div className="w-16 flex-shrink-0 text-right">
                        {trendBadge(item.trendArah, item.trendPersen)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Sort & Table ─────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                Urutkan:
              </span>
              {(
                [
                  { key: "terjual", label: "Qty Terjual" },
                  { key: "tren", label: "Tren %" },
                  { key: "harga", label: "Harga Rata²" },
                  { key: "seller", label: "Jml Seller" },
                ] as { key: SortKey; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-all ${
                    sortBy === opt.key
                      ? "bg-primary-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                        Komoditas
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider text-right">
                        Terjual (Bln Ini)
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider text-right">
                        Terjual (Bln Lalu)
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider text-center">
                        Tren
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider text-right">
                        Harga Rata²/kg
                      </th>
                      <th className="px-5 py-3 text-[10px] font-normal text-slate-400 uppercase tracking-wider text-center">
                        Seller
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedData.map((item, idx) => (
                      <tr
                        key={item.kodeKomoditasGlobal}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center text-xs font-normal ${
                              idx === 0
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : idx === 1
                                  ? "bg-slate-100 text-slate-600"
                                  : idx === 2
                                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                                    : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-normal text-slate-800">
                            {item.komoditasNama}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.kodeKomoditasGlobal}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs font-normal text-slate-700">
                          {fmtKg(item.jumlahTerjualKgBulanIni)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs font-normal text-slate-400">
                          {fmtKg(item.jumlahTerjualKgBulanLalu)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {trendBadge(item.trendArah, item.trendPersen)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs font-normal text-slate-700">
                          {fmtRp(item.hargaJualRataRataPerKg)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-600">
                            <Users size={11} className="text-slate-400" />
                            {item.jumlahSellerMenjual}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ))}
    </div>
  );
}
