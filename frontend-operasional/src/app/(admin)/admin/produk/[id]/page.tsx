"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Store,
  Clock,
  ArrowLeft,
  Star,
  Info,
  MessageSquare,
  AlertCircle,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { message } from "antd";

import {
  productsApi,
  reviewsApi,
  formatRupiah,
  formatTanggal,
} from "@/lib/ecommerce-api";

type ReviewData = {
  id: string;
  rating: number;
  ulasan: string | null;
  reportStatus: string | null;
  reportReason: string | null;
  isHidden: boolean;
  createdAt: string;
  user: { id: string; name: string };
};

interface ProductData {
  id: string;
  nama: string;
  harga: number;
  stok?: number;
  satuan?: string;
  status: string;
  gambarBase64?: string;
  gambarUtama?: string;
  gambarUrl?: string;
  fotoLainnya?: string[];
  deskripsi?: string;
  nutrisi?: string;
  kategoriNama?: string;
  storeName?: string;
  store?: { nama: string };
  rating?: number;
  estimasiSegarHari?: number;
  asalKebun?: string;
  diskonPersen?: number;
  grades?: Array<{ grade: string; stok: number }>;
}

export default function AdminDetailProdukPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<"info" | "ulasan">("info");

  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!id) return;
      try {
        if (showLoading) setLoading(true);
        setError("");

        // Fetch Product Details
        const prodRes = await productsApi.getById(id);
        const prodData = prodRes?.data?.data || prodRes?.data;
        setProduct(prodData);

        // Fetch Reviews (Admin route includes hidden ones)
        try {
          const revRes = await reviewsApi.adminGetProductReviews(id, {
            limit: 50,
          });
          const revData = revRes?.data?.data || revRes?.data;
          if (revData && Array.isArray(revData.data)) {
            setReviews(revData.data);
            setReviewsTotal(revData.total || 0);
          } else if (Array.isArray(revData)) {
            setReviews(revData);
            setReviewsTotal(revData.length);
          }
        } catch (err) {
          console.warn("Gagal memuat ulasan", err);
        }
      } catch (err) {
        setError("Gagal memuat detail produk.");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    Promise.resolve().then(() => fetchData(false)); // Already loading by default
  }, [fetchData]);

  const handleTakedown = async (reviewId: string) => {
    try {
      if (
        !confirm(
          "Apakah Anda yakin ingin menyembunyikan (takedown) ulasan ini dari publik?",
        )
      )
        return;
      await reviewsApi.adminTakedown(reviewId);
      message.success("Ulasan berhasil disembunyikan.");
      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? { ...r, isHidden: true, reportStatus: "TAKEDOWN_APPROVED" }
            : r,
        ),
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menyembunyikan ulasan.";
      message.error(errorMsg);
    }
  };

  const handleRestore = async (reviewId: string) => {
    try {
      if (
        !confirm(
          "Apakah Anda yakin ingin menampilkan kembali ulasan ini ke publik?",
        )
      )
        return;
      await reviewsApi.adminRejectTakedown(reviewId);
      message.success("Ulasan berhasil dipulihkan.");
      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? { ...r, isHidden: false, reportStatus: "TAKEDOWN_REJECTED" }
            : r,
        ),
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memulihkan ulasan.";
      message.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <p className="text-gray-400 font-medium">Memuat detail produk...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-[32px] border border-red-100 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={40} className="mb-2" />
        <h2 className="text-xl font-bold">Data Tidak Ditemukan</h2>
        <p className="text-sm font-medium">
          {error || "Produk tidak ditemukan"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-white rounded-xl shadow-sm text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  const stockTotal = product.grades
    ? product.grades.reduce((a, c) => a + (c.stok || 0), 0)
    : product.stok || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Info */}
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white relative">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-emerald-50 hover:text-white transition-colors text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-2xl hover:bg-white/20"
          >
            <ArrowLeft size={16} /> Kembali ke Toko
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-[32px] overflow-hidden shadow-inner border border-white/20 flex-shrink-0 relative">
                {product.gambarUrl ||
                product.gambarBase64 ||
                product.gambarUtama ? (
                  <Image
                    src={
                      product.gambarUrl ||
                      product.gambarBase64 ||
                      product.gambarUtama ||
                      ""
                    }
                    alt={product.nama?.replace(" - ", " ")}
                    className="object-cover"
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <Package size={40} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">
                  {product.nama?.replace(" - ", " ")}
                </h1>
                <p className="text-emerald-100 text-sm flex items-center gap-1.5 opacity-90 mb-3">
                  <Store size={16} />{" "}
                  {product.store?.nama || product.storeName || "Toko"}{" "}
                  {product.kategoriNama
                    ? `• Kategori: ${product.kategoriNama}`
                    : ""}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${
                      product.status === "ACTIVE"
                        ? "bg-emerald-400/20 text-emerald-50 border border-emerald-400/30"
                        : "bg-red-400/20 text-red-50 border border-red-400/30"
                    }`}
                  >
                    {product.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Stats in Header */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 min-w-[150px]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-100/80 tracking-wider mb-0.5">
                    Harga
                  </p>
                  <p className="font-bold text-lg">
                    {formatRupiah(product.harga || 0)}
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 min-w-[150px]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-100/80 tracking-wider mb-0.5">
                    Rating Produk
                  </p>
                  <div className="flex items-center gap-1 font-bold text-lg text-amber-300">
                    <Star size={18} className="fill-amber-300" />{" "}
                    {Number(product.rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 px-8 border-b border-gray-100 overflow-x-auto">
          {[
            { id: "info", label: "Informasi Produk", icon: Info },
            {
              id: "ulasan",
              label: `Ulasan (${reviewsTotal})`,
              icon: MessageSquare,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "info" | "ulasan")}
              className={`flex items-center gap-2 py-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="animate-in fade-in duration-300">
        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Galeri Foto Produk */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package size={20} className="text-emerald-500" /> Foto Produk
              </h3>
              {(() => {
                const fotos = [
                  product.gambarUrl ||
                    product.gambarBase64 ||
                    product.gambarUtama,
                  ...(product.fotoLainnya || []),
                ].filter(Boolean) as string[];
                if (fotos.length === 0) {
                  return (
                    <div className="py-16 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col items-center justify-center text-gray-300">
                      <Package size={48} />
                      <p className="text-sm text-gray-400 mt-3 font-medium">
                        Belum ada foto produk
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fotos.map((src, idx) => (
                      <div
                        key={idx}
                        className="aspect-square relative rounded-[20px] overflow-hidden border border-gray-100 bg-gray-50 group"
                      >
                        <Image
                          src={src}
                          alt={`${product.nama?.replace(" - ", " ")} foto ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Utama
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info size={20} className="text-emerald-500" /> Deskripsi
                  Produk
                </h3>
                <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {product.deskripsi ||
                    "Tidak ada deskripsi produk yang dicantumkan."}
                </div>

                {product.nutrisi && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-sm mb-2 text-gray-900">
                      Kandungan Nutrisi
                    </h4>
                    <p className="text-sm text-gray-600">{product.nutrisi}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package size={20} className="text-emerald-500" /> Detail
                    Fisik & Stok
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Total Stok Tersedia
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        {stockTotal} {product.satuan}
                      </span>
                    </div>
                    {product.grades && product.grades.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                          Rincian Per Grade
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {product.grades.map((g) => (
                            <div
                              key={g.grade}
                              className={`p-3 rounded-2xl border ${g.stok > 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} text-center`}
                            >
                              <div
                                className={`text-xl font-bold ${g.stok > 0 ? "text-emerald-600" : "text-red-500"}`}
                              >
                                {g.grade}
                              </div>
                              <div
                                className={`text-xs font-medium mt-1 ${g.stok > 0 ? "text-emerald-800" : "text-red-700"}`}
                              >
                                {g.stok} {product.satuan}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-emerald-500" /> Keterangan
                    Tambahan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-xs font-bold text-gray-500 tracking-wide">
                        Estimasi Kesegaran
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {product.estimasiSegarHari
                          ? `${product.estimasiSegarHari} Hari`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-xs font-bold text-gray-500 tracking-wide">
                        Asal Kebun / Daerah
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {product.asalKebun || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-xs font-bold text-gray-500 tracking-wide">
                        Diskon Aktif
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {product.diskonPersen
                          ? `${product.diskonPersen}%`
                          : "Tidak ada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ULASAN TAB */}
        {activeTab === "ulasan" && (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare size={20} className="text-emerald-500" />{" "}
                Manajemen Ulasan
              </h3>
              <div className="text-[11px] font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
                Total {reviews.length} Ulasan
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[24px] border border-gray-100/50">
                <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 text-lg">
                  Belum ada ulasan
                </h4>
                <p className="text-sm text-gray-500 mt-2">
                  Produk ini belum menerima ulasan dari pembeli.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`p-6 rounded-[24px] border transition-all ${
                      review.isHidden
                        ? "bg-red-50/50 border-red-100 opacity-75"
                        : review.reportStatus === "REPORTED"
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-bold text-gray-900">
                            {review.user?.name || "Anonim"}
                          </h5>
                          <span className="text-xs text-gray-400 font-medium">
                            {formatTanggal(review.createdAt)}
                          </span>
                          {review.isHidden && (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <EyeOff size={10} /> Disembunyikan
                            </span>
                          )}
                          {review.reportStatus === "REPORTED" &&
                            !review.isHidden && (
                              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                Dilaporkan Seller
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-0.5 mb-3 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-amber-400"
                                  : "fill-gray-200 text-gray-200"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {review.ulasan || (
                            <span className="text-gray-400 italic">
                              Pengguna tidak meninggalkan komentar teks.
                            </span>
                          )}
                        </p>

                        {review.reportReason && (
                          <div className="mt-4 p-3 bg-white/50 border border-gray-200 rounded-xl">
                            <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">
                              Alasan Laporan Seller:
                            </p>
                            <p className="text-xs text-gray-800">
                              {review.reportReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {review.isHidden ? (
                          <button
                            onClick={() => handleRestore(review.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors text-xs font-bold"
                          >
                            <Eye size={14} /> Tampilkan (Restore)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTakedown(review.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors text-xs font-bold"
                          >
                            <EyeOff size={14} /> Takedown
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
