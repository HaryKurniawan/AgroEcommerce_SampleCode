"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Move,
  Maximize2,
  Minimize2,
} from "lucide-react";
import toast from "react-hot-toast";

import { bannerApi, apiClient } from "@/lib/ecommerce-api";

interface Banner {
  id: string;
  judul: string;
  subjudul?: string;
  imageUrl?: string;
  gradient?: string;
  linkUrl?: string;
  urutan: number;
  isAktif: boolean;
}

const GRADIENTS = [
  {
    value: "bg-gradient-to-br from-green-600 to-emerald-800",
    label: "Green Emerald",
  },
  {
    value: "bg-gradient-to-bl from-teal-600 to-green-800",
    label: "Teal Green",
  },
  {
    value: "bg-gradient-to-r from-emerald-500 to-teal-500",
    label: "Bright Emerald",
  },
  {
    value: "bg-gradient-to-r from-green-500 to-green-700",
    label: "Forest Green",
  },
];

export function getBannerImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.agro-ecommerce.web.id";

  let domainRoot = "https://api.agro-ecommerce.web.id";
  try {
    const parsed = new URL(backendUrl);
    domainRoot = `${parsed.protocol}//${parsed.host}`;
  } catch {
    // Abaikan error parse URL, gunakan domain fallback
  }

  // Hapus awalan /api/proxy jika tidak sengaja tersimpan ganda
  const cleanUrl = url.replace(/^\/api\/proxy/i, "");
  return `${domainRoot}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
}

export function parseBannerGradient(gradStr?: string | null) {
  if (!gradStr) {
    return {
      gradientClass: GRADIENTS[0].value,
      posX: 50,
      posY: 50,
      fit: "cover" as "cover" | "contain",
      zoom: 1,
    };
  }
  if (gradStr.includes("pos:")) {
    const posMatch = gradStr.match(/pos:(\d+)%\s+(\d+)%/);
    const fitMatch = gradStr.match(/fit:(cover|contain)/);
    const zoomMatch = gradStr.match(/zoom:([\d.]+)/);
    return {
      gradientClass: GRADIENTS[0].value,
      posX: posMatch ? parseInt(posMatch[1], 10) : 50,
      posY: posMatch ? parseInt(posMatch[2], 10) : 50,
      fit: (fitMatch ? fitMatch[1] : "cover") as "cover" | "contain",
      zoom: zoomMatch ? parseFloat(zoomMatch[1]) : 1,
    };
  }
  return {
    gradientClass: gradStr,
    posX: 50,
    posY: 50,
    fit: "cover" as "cover" | "contain",
    zoom: 1,
  };
}

export function formatBannerGradient(
  gradientClass: string,
  posX: number,
  posY: number,
  fit: string,
  zoom: number,
  hasImage: boolean,
) {
  if (hasImage) {
    return `pos:${posX}% ${posY}%|fit:${fit}|zoom:${zoom}`;
  }
  return gradientClass;
}

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [judul, setJudul] = useState("");
  const [subjudul, setSubjudul] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [gradientClass, setGradientClass] = useState(GRADIENTS[0].value);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [isAktif, setIsAktif] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasRemovedImage, setHasRemovedImage] = useState(false);

  // Drag to reposition photo preview
  const isDragging = useRef(false);
  const startDragCoords = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 50, y: 50 });

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Biarkan default agar pointer events jalan, tapi cegah drag-and-drop bawaan browser pada gambar
    if (e.cancelable) e.preventDefault();
    isDragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startDragCoords.current = { x: clientX, y: clientY };
    startPos.current = { x: posX, y: posY };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startDragCoords.current.x;
    const deltaY = clientY - startDragCoords.current.y;

    const dragScale = 0.2; // Sensitivitas geser
    let newX = startPos.current.x - deltaX * dragScale;
    let newY = startPos.current.y - deltaY * dragScale;

    newX = Math.max(0, Math.min(100, Math.round(newX)));
    newY = Math.max(0, Math.min(100, Math.round(newY)));

    setPosX(newX);
    setPosY(newY);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerApi.getAdminBanners();
      setBanners(res.data?.data || []);
    } catch (err) {
      toast.error("Gagal memuat banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner?: Banner) => {
    setHasRemovedImage(false);
    if (banner) {
      setEditingBanner(banner);
      setJudul(banner.judul);
      setSubjudul(banner.subjudul || "");
      setLinkUrl(banner.linkUrl || "");
      setIsAktif(banner.isAktif);

      const parsed = parseBannerGradient(banner.gradient);
      setGradientClass(parsed.gradientClass);
      setPosX(parsed.posX);
      setPosY(parsed.posY);
      setZoom(parsed.zoom || 1);
      setFitMode(parsed.fit);
      setIsAktif(banner.isAktif);
      setImagePreview(
        banner.imageUrl ? getBannerImageUrl(banner.imageUrl) : null,
      );
      setImageFile(null);
    } else {
      setEditingBanner(null);
      setJudul("");
      setSubjudul("");
      setLinkUrl("");
      setGradientClass(GRADIENTS[0].value);
      setPosX(50);
      setPosY(50);
      setZoom(1);
      setFitMode("cover");
      setIsAktif(true);
      setImagePreview(null);
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran maksimal 5MB");
        return;
      }
      setImageFile(file);
      setHasRemovedImage(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = editingBanner?.imageUrl;
      if (hasRemovedImage) {
        finalImageUrl = null as any;
      }

      // Upload image first if new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await apiClient.post(
          "/upload/poster/gambar",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const rawResData = uploadRes.data;
        const uploaded =
          rawResData?.data?.data?.url ||
          rawResData?.data?.url ||
          rawResData?.url ||
          (typeof rawResData?.data === "string" ? rawResData.data : undefined);

        if (uploaded) {
          finalImageUrl = uploaded;
        }
      }

      if (!imagePreview && !imageFile && hasRemovedImage) {
        finalImageUrl = null as any;
      }

      const hasImage = Boolean(finalImageUrl || imagePreview);
      const formattedGradient = formatBannerGradient(
        gradientClass,
        posX,
        posY,
        fitMode,
        zoom,
        hasImage,
      );

      const payload = {
        judul,
        subjudul,
        linkUrl,
        gradient: formattedGradient,
        isAktif,
        imageUrl: finalImageUrl ?? null,
      };

      if (editingBanner) {
        await bannerApi.updateBanner(editingBanner.id, payload);
        toast.success("Banner diperbarui");
      } else {
        await bannerApi.createBanner(payload);
        toast.success("Banner ditambahkan");
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error("Gagal menyimpan banner");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await bannerApi.deleteBanner(id);
      toast.success("Banner dihapus");
      fetchBanners();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    // Swap
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);

    // Save to server
    try {
      await bannerApi.reorderBanners(newBanners.map((b) => b.id));
      toast.success("Urutan diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui urutan");
      fetchBanners(); // revert
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="text-emerald-600" />
            Kelola Banner Promo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur banner promo, posisi foto, dan urutan yang tampil di aplikasi
            pengguna.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus size={18} />
          Tambah Banner
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">Preview Banner</th>
                <th className="p-4">Detail</th>
                <th className="p-4">Link URL</th>
                <th className="p-4 text-center">Urutan</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada banner. Silakan tambah baru.
                  </td>
                </tr>
              ) : (
                banners.map((banner, idx) => {
                  const imgUrl = getBannerImageUrl(banner.imageUrl);
                  const parsed = parseBannerGradient(banner.gradient);

                  return (
                    <tr key={banner.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        {imgUrl ? (
                          <div className="relative w-40 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
                            <img
                              src={imgUrl}
                              alt={banner.judul || "Banner"}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (
                                  !target.dataset.retried &&
                                  imgUrl.startsWith("/api/proxy/")
                                ) {
                                  target.dataset.retried = "true";
                                  target.src = imgUrl.replace(
                                    "/api/proxy/",
                                    "http://localhost:4000/",
                                  );
                                }
                              }}
                              style={{
                                objectFit: parsed.fit,
                                objectPosition: `${parsed.posX}% ${parsed.posY}%`,
                                transform: `scale(${parsed.zoom})`,
                              }}
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-40 h-20 rounded-xl ${parsed.gradientClass} flex items-center justify-center p-2 text-center shadow-xs`}
                          >
                            <span className="text-white text-[11px] font-semibold drop-shadow-xs line-clamp-2">
                              {banner.judul}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div
                          className="font-semibold text-slate-800 truncate"
                          title={banner.judul}
                        >
                          {banner.judul}
                        </div>
                        <div
                          className="text-xs text-slate-500 truncate"
                          title={banner.subjudul || ""}
                        >
                          {banner.subjudul || "-"}
                        </div>
                        {imgUrl && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Posisi: X:{parsed.posX}% Y:{parsed.posY}% (
                            {parsed.fit})
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {banner.linkUrl ? (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1 text-xs font-medium"
                          >
                            {banner.linkUrl.substring(0, 30)}...{" "}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleReorder(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="w-6 font-semibold">{idx + 1}</span>
                          <button
                            onClick={() => handleReorder(idx, "down")}
                            disabled={idx === banners.length - 1}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${banner.isAktif ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                        >
                          {banner.isAktif ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(banner)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
                </h2>
                <p className="text-xs text-slate-400">
                  Atur gambar, posisi crop, dan informasi banner promo
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-5">
              <form id="bannerForm" onSubmit={handleSave} className="space-y-5">
                {/* Image Upload & Live Preview */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Foto Banner (Opsional)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Unggah foto promo. Jika foto diunggah, foto akan tampil
                    jernih tanpa gradien. Format: PNG/JPG/WebP, Maks 5MB.
                  </p>

                  {imagePreview ? (
                    <div className="space-y-3">
                      {/* Live Crop & Position Preview Container */}
                      <div
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                        className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-md group cursor-grab active:cursor-grabbing select-none"
                      >
                        <img
                          src={imagePreview}
                          alt="Live Preview"
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (
                              !target.dataset.retried &&
                              imagePreview.startsWith("/api/proxy/")
                            ) {
                              target.dataset.retried = "true";
                              target.src = imagePreview.replace(
                                "/api/proxy/",
                                "http://localhost:4000/",
                              );
                            }
                          }}
                          style={{
                            objectFit: fitMode,
                            objectPosition: `${posX}% ${posY}%`,
                            transform: `scale(${zoom})`,
                            transformOrigin: `${posX}% ${posY}%`,
                          }}
                          className="w-full h-full transition-all duration-150 pointer-events-none select-none"
                        />
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono px-2.5 py-1 rounded-lg border border-white/10 shadow-xs pointer-events-none">
                          X: {posX}% | Y: {posY}% | Z: {zoom.toFixed(1)}x (
                          {fitMode})
                        </div>
                      </div>

                      {/* Repositioning & Crop Controls */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Move size={14} className="text-emerald-600" />
                            Atur Posisi & Pergeseran Foto
                          </span>
                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setFitMode("cover")}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                fitMode === "cover"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <Maximize2 size={12} />
                              Isi Penuh (Crop)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFitMode("contain")}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                fitMode === "contain"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <Minimize2 size={12} />
                              Muat Semua (Fit)
                            </button>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-medium mr-1">
                            Preset Posisi:
                          </span>
                          {[
                            { label: "🎯 Tengah", x: 50, y: 50 },
                            { label: "⬆️ Atas", x: 50, y: 0 },
                            { label: "⬇️ Bawah", x: 50, y: 100 },
                            { label: "⬅️ Kiri", x: 0, y: 50 },
                            { label: "➡️ Kanan", x: 100, y: 50 },
                          ].map((p) => (
                            <button
                              type="button"
                              key={p.label}
                              onClick={() => {
                                setPosX(p.x);
                                setPosY(p.y);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                                posX === p.x && posY === p.y
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>

                        {/* Sliders */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                              <span>Geser Vertikal (Y)</span>
                              <span className="font-mono text-emerald-600 font-bold">
                                {posY}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={posY}
                              onChange={(e) =>
                                setPosY(parseInt(e.target.value, 10))
                              }
                              className="w-full accent-emerald-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Atas (0%)</span>
                              <span>Bawah (100%)</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                              <span>Geser Horizontal (X)</span>
                              <span className="font-mono text-emerald-600 font-bold">
                                {posX}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={posX}
                              onChange={(e) =>
                                setPosX(parseInt(e.target.value, 10))
                              }
                              className="w-full accent-emerald-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Kiri (0%)</span>
                              <span>Kanan (100%)</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Perbesar (Zoom In/Out)</span>
                            <span className="text-emerald-600">
                              {zoom.toFixed(1)}x
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              1x
                            </span>
                            <input
                              type="range"
                              min="1"
                              max="3"
                              step="0.1"
                              value={zoom}
                              onChange={(e) =>
                                setZoom(parseFloat(e.target.value))
                              }
                              className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-slate-400">
                              3x
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-32 rounded-2xl mb-3 ${gradientClass} flex flex-col items-center justify-center border border-slate-200 shadow-inner`}
                    >
                      <span className="text-white font-bold text-sm drop-shadow-xs mb-1">
                        Preview Gradien Default (Tanpa Foto)
                      </span>
                      <span className="text-white/80 text-xs">
                        Unggah foto di bawah jika ingin menggunakan banner foto
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/avif"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setHasRemovedImage(true);
                        }}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-all shrink-0"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>

                {!imagePreview && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Warna Gradien Default (Jika Tanpa Foto)
                    </label>
                    <select
                      value={gradientClass}
                      onChange={(e) => setGradientClass(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
                    >
                      {GRADIENTS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Judul Utama (Opsional)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Kosongkan jika judul/teks sudah ada di dalam desain foto
                    banner Anda.
                  </p>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
                    placeholder="Contoh: Promo Spesial (Kosongkan jika judul sudah di dalam foto)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Subjudul
                  </label>
                  <input
                    type="text"
                    value={subjudul}
                    onChange={(e) => setSubjudul(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
                    placeholder="Contoh: Diskon besar-besaran komoditas sayur..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Link URL Tujuan
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
                    placeholder="Contoh: https://..."
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAktif}
                      onChange={(e) => setIsAktif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                  <span className="text-sm font-semibold text-slate-700">
                    Banner Aktif Tampil di Aplikasi
                  </span>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                form="bannerForm"
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
