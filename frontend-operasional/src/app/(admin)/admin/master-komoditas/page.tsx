"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Wheat,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FilterX,
} from "lucide-react";

import { gudangApi } from "@/lib/ecommerce-api";
import PageHeader from "@/components/ui/PageHeader";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MasterKomoditas {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga: number;
  deskripsi?: string;
  gambarUrl?: string;
  isActive?: boolean;
  _count?: { produkGudang: number };
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

function KomoditasImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
        <Wheat size={15} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
      <Image
        src={src}
        alt={alt}
        width={36}
        height={36}
        className="object-cover w-full h-full"
        unoptimized
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MasterKomoditasPage() {
  const [list, setList] = useState<MasterKomoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterKat, setFilterKat] = useState("semua");
  const [filterStatus, setFilterStatus] = useState<
    "semua" | "aktif" | "nonaktif"
  >("semua");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await gudangApi.getMasterKomoditas();
      // Unwrap standard NestJS TransformInterceptor response
      const raw = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      const dataArr = Array.isArray(raw) ? raw : (raw.data ?? []);
      setList(dataArr);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Gagal memuat data komoditas dari gudang.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = Array.from(
    new Set(list.map((k) => k.kategori).filter(Boolean)),
  );

  const filtered = list.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      k.nama.toLowerCase().includes(q) ||
      k.kategori?.toLowerCase().includes(q) ||
      k.deskripsi?.toLowerCase().includes(q);
    const matchKat = filterKat === "semua" || k.kategori === filterKat;
    const matchStatus =
      filterStatus === "aktif"
        ? k.isActive === true
        : filterStatus === "nonaktif"
          ? k.isActive === false
          : true;
    return matchSearch && matchKat && matchStatus;
  });

  const isFiltered =
    search || filterKat !== "semua" || filterStatus !== "semua";

  const clearFilters = () => {
    setSearch("");
    setFilterKat("semua");
    setFilterStatus("semua");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 animate-fade-in font-sans pb-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-normal text-slate-900 leading-tight">
            Master Komoditas
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-normal">
            {list.length} data komoditas terhubung dari Service Gudang
            (Read-Only)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-normal hover:bg-slate-100 active:scale-95 transition-all shadow-sm disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Perbarui Data
        </button>
      </div>

      {/* ── Stats Bento Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Komoditas",
            value: list.length,
            textColor: "text-slate-800",
          },
          {
            label: "Komoditas Aktif",
            value: list.filter((k) => k.isActive).length,
            textColor: "text-emerald-600",
          },
          {
            label: "Nonaktif",
            value: list.filter((k) => !k.isActive).length,
            textColor: "text-slate-500",
          },
          {
            label: "Total Kategori",
            value: categories.length,
            textColor: "text-slate-800",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-normal">
              {s.label}
            </p>
            <p className={`text-2xl font-normal mt-1.5 ${s.textColor}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 items-center text-xs text-rose-600 font-normal">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Toolbar & Filter ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kategori, deskripsi..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FilterX size={13} />
            </button>
          )}
        </div>

        {/* kategori */}
        <select
          value={filterKat}
          onChange={(e) => setFilterKat(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:border-slate-400 outline-none"
        >
          <option value="semua">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* status tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs shrink-0">
          {(["semua", "aktif", "nonaktif"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 capitalize transition-colors font-normal ${
                filterStatus === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs text-slate-400 font-normal">
              Mengambil data dari Service Gudang...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Wheat size={32} className="text-slate-300" />
            <p className="text-xs text-slate-600 font-normal">
              Tidak ada komoditas ditemukan
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-xs text-emerald-600 hover:underline mt-1 font-normal"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 border-b border-slate-200 text-[11px] font-normal uppercase tracking-wider">
                  <th className="px-5 py-3.5 w-10 font-normal">#</th>
                  <th className="px-5 py-3.5 font-normal">Komoditas</th>
                  <th className="px-5 py-3.5 font-normal">Kategori</th>
                  <th className="px-5 py-3.5 font-normal">Satuan</th>
                  <th className="px-5 py-3.5 text-right font-normal">
                    Harga Acuan
                  </th>
                  <th className="px-5 py-3.5 text-center font-normal">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((k, i) => (
                  <tr
                    key={k.id || `komoditas-${i}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* no */}
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-normal">
                      {i + 1}
                    </td>

                    {/* nama */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <KomoditasImage src={k.gambarUrl} alt={k.nama} />
                        <div>
                          <p className="text-slate-800 font-normal">{k.nama}</p>
                          {k.deskripsi && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[260px] font-normal">
                              {k.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* kategori */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-normal border border-slate-200">
                        {k.kategori || "—"}
                      </span>
                    </td>

                    {/* satuan */}
                    <td className="px-5 py-3.5 text-slate-500 font-normal">
                      {k.satuan}
                    </td>

                    {/* harga */}
                    <td className="px-5 py-3.5 text-right text-slate-800 font-normal">
                      {k.harga ? (
                        formatRupiah(k.harga)
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* status */}
                    <td className="px-5 py-3.5 text-center">
                      {k.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-normal">
                          <CheckCircle2 size={10} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-md text-[10px] font-normal">
                          <XCircle size={10} /> Nonaktif
                        </span>
                      )}
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
