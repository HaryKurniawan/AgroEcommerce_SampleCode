"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  FileText,
  Star,
  Package,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Eye,
  EyeOff,
  Key,
  MessageSquare,
  BookOpen,
} from "lucide-react";

import { useProfilToko } from "@/hooks/seller/useProfilToko";
import { formatRupiah, apiClient } from "@/lib/ecommerce-api";
import { storesApi } from "@/lib/api/stores";

const ProfilTokoPage: React.FC = () => {
  const {
    store,
    loading,
    errorText,
    isEditing,
    setIsEditing,
    saving,
    toast,
    formData,
    setFormData,
    handleSave,
    handleCancel,
  } = useProfilToko();

  const [isTelegramEditing, setIsTelegramEditing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [telegramForm, setTelegramForm] = useState({ token: "", chatId: "" });
  const [savingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramToast, setTelegramToast] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [editingSection, setEditingSection] = useState<
    "informasi" | "kontak" | "telegram" | null
  >(null);
  const [isClosing, setIsClosing] = useState(false);

  const openEdit = (section: "informasi" | "kontak" | "telegram") => {
    setEditingSection(section);
    setIsClosing(false);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsClosing(true);
    setTimeout(() => {
      handleCancel();
      setEditingSection(null);
      setIsClosing(false);
    }, 300);
  };

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setEditingSection(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isEditing]);

  const showTelegramToast = (msg: string) => {
    setTelegramToast(msg);
    setTimeout(() => setTelegramToast(""), 3000);
  };

  const handleTelegramEdit = () => {
    setTelegramForm({
      token: (store as any)?.telegramBotToken || "",
      chatId: (store as any)?.telegramChatId || "",
    });
    setShowToken(false);
    openEdit("telegram");
  };

  const handleTelegramSave = async () => {
    if (!store?.id) return;
    setIsSavingTelegram(true);
    try {
      await storesApi.update(store.id, {
        telegramBotToken: telegramForm.token,
        telegramChatId: telegramForm.chatId,
      });

      showTelegramToast("✅ Konfigurasi Telegram berhasil disimpan!");
      handleCloseEdit();
      window.location.reload();
    } catch (err: any) {
      showTelegramToast(
        `❌ ${err?.response?.data?.message || "Gagal menyimpan konfigurasi Telegram"}`,
      );
    }
    setIsSavingTelegram(false);
  };

  const handleTelegramTestOnly = async () => {
    setIsTestingTelegram(true);
    try {
      const testRes = await apiClient.post("/toko/telegram-test", {
        telegramBotToken: telegramForm.token,
        telegramChatId: telegramForm.chatId,
      });

      if (!testRes.data) {
        showTelegramToast("❌ Token atau Chat ID tidak valid");
      } else {
        showTelegramToast("✅ Pesan tes berhasil dikirim ke Telegram Anda!");
      }
    } catch (err: any) {
      showTelegramToast(
        `❌ ${err?.response?.data?.message || "Token atau Chat ID tidak valid"}`,
      );
    }
    setIsTestingTelegram(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (errorText || !store) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3">
        <AlertCircle size={24} />
        <div>
          <h3 className="font-bold">Terjadi Kesalahan</h3>
          <p className="text-sm">{errorText || "Gagal memuat profil toko."}</p>
        </div>
      </div>
    );
  }

  const t = store;

  const statusConfig: Record<
    string,
    { color: string; bg: string; label: string }
  > = {
    ACTIVE: { color: "text-emerald-700", bg: "bg-emerald-100", label: "Aktif" },
    PENDING: { color: "text-amber-700", bg: "bg-amber-100", label: "Menunggu" },
    INACTIVE: { color: "text-gray-600", bg: "bg-gray-100", label: "Nonaktif" },
    SUSPENDED: {
      color: "text-red-700",
      bg: "bg-red-100",
      label: "Ditangguhkan",
    },
  };
  const stStatus = statusConfig[t.status || ""] || statusConfig["ACTIVE"];
  const hasTelegram =
    !!(t as any).telegramBotToken && !!(t as any).telegramChatId;

  return (
    <div className="relative min-h-full bg-gray-50/50">
      {/* ── Global Toast ── */}
      {(toast || telegramToast) && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down">
          <CheckCircle size={16} className="text-emerald-400" />
          {toast || telegramToast}
        </div>
      )}

      {/* ── Sliding Drawer for Edit ── */}
      {isEditing && editingSection && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
            onClick={handleCloseEdit}
          />

          {/* Drawer Panel */}
          <div
            className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col ${isClosing ? "animate-[slideOut_0.3s_ease-in_forwards]" : "animate-[slideIn_0.3s_ease-out]"}`}
          >
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
              @keyframes slideOut {
                from { transform: translateX(0); }
                to { transform: translateX(100%); }
              }
            `}</style>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSection === "informasi" && "Edit Informasi Toko"}
                {editingSection === "kontak" && "Edit Kontak & Info"}
                {editingSection === "telegram" && "Edit Notifikasi Telegram"}
              </h2>
              <button
                onClick={handleCloseEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Edit Informasi Toko */}
              {editingSection === "informasi" && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Store size={14} className="text-emerald-600" /> Informasi
                    Toko
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.deskripsi}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            deskripsi: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Masukkan deskripsi toko..."
                        className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none resize-none bg-emerald-50/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        Jam Operasional
                      </label>
                      <input
                        type="text"
                        value={formData.jamOperasional}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            jamOperasional: e.target.value,
                          }))
                        }
                        placeholder="Contoh: Senin - Jumat, 08:00 - 17:00"
                        className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none bg-emerald-50/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Kontak & Info */}
              {editingSection === "kontak" && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Phone size={14} className="text-emerald-600" /> Kontak &
                    Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.telepon}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            telepon: e.target.value,
                          }))
                        }
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none bg-emerald-50/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        SIUP / Izin Usaha
                      </label>
                      <input
                        type="text"
                        value={formData.nomorSIUP}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            nomorSIUP: e.target.value,
                          }))
                        }
                        placeholder="Masukkan Nomor SIUP"
                        className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none bg-emerald-50/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Notifikasi Telegram */}
              {editingSection === "telegram" && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Send size={14} className="text-emerald-600" /> Telegram Bot
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        Bot Token <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showToken ? "text" : "password"}
                          value={telegramForm.token}
                          onChange={(e) =>
                            setTelegramForm((f) => ({
                              ...f,
                              token: e.target.value,
                            }))
                          }
                          placeholder="Masukkan Bot Token Anda"
                          className="w-full px-3.5 py-2.5 pr-10 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none bg-emerald-50/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                        Chat ID / User ID{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={telegramForm.chatId}
                        onChange={(e) =>
                          setTelegramForm((f) => ({
                            ...f,
                            chatId: e.target.value,
                          }))
                        }
                        placeholder="Contoh: 123456789"
                        className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none bg-emerald-50/30"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTelegramTestOnly}
                      disabled={
                        isTestingTelegram ||
                        !telegramForm.token ||
                        !telegramForm.chatId
                      }
                      className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-semibold text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {isTestingTelegram ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      {isTestingTelegram
                        ? "Mengirim Tes..."
                        : "Uji Coba Kirim Pesan"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
              <button
                onClick={handleCloseEdit}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-white transition-all text-center"
              >
                Batal
              </button>
              <button
                onClick={
                  editingSection === "telegram"
                    ? handleTelegramSave
                    : handleSave
                }
                disabled={
                  saving ||
                  (editingSection === "telegram" &&
                    (savingTelegram ||
                      !telegramForm.token ||
                      !telegramForm.chatId))
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-60 shadow-sm"
              >
                {saving || savingTelegram ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving || savingTelegram ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Store Hero Card ── */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-5 text-white mb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white rounded-full" />
          <div className="absolute -bottom-16 right-32 w-36 h-36 bg-white rounded-full" />
          <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white rounded-full" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm overflow-hidden flex-shrink-0 border-2 border-white/30">
            {t.fotoUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={t.fotoUrl}
                  alt={t.nama || "Toko"}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <Store size={28} className="text-white/80" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-bold text-xl line-clamp-1">{t.nama}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stStatus.bg} ${stStatus.color}`}
              >
                {stStatus.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200 text-sm">
              <MapPin size={12} />
              <span>
                {t.kabupaten || "Hanya Online"}
                {t.wilayah ? ` · ${t.wilayah}` : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-2 mt-4">
          {[
            {
              icon: <Package size={15} />,
              val: t.totalProduk ?? 0,
              label: "Produk",
            },
            {
              icon: <ShoppingBag size={15} />,
              val: t.totalPesanan ?? 0,
              label: "Pesanan",
            },
            { icon: <Star size={15} />, val: t.rating ?? 0, label: "Rating" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/10"
            >
              <div className="flex justify-center mb-1 text-emerald-200">
                {s.icon}
              </div>
              <p className="text-lg font-bold">{s.val}</p>
              <p className="text-[11px] text-emerald-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue Strip ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Penjualan</p>
            <p className="text-lg font-bold text-emerald-700">
              {formatRupiah(t.totalPenjualan || 0)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Omset kumulatif sejak bergabung</p>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-4">
        {/* 1. Informasi Toko — tall card, spans 2 rows on right */}
        <div className="lg:col-span-1 lg:row-span-2 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Store size={14} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                Informasi Toko
              </h3>
            </div>
            <button
              onClick={() => openEdit("informasi")}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-lg hover:bg-emerald-100 transition-all"
            >
              <Edit2 size={11} /> Edit
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {/* Nama Toko — big emphasis */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">
                Nama Toko
              </p>
              <p className="text-base font-bold text-gray-800">{t.nama}</p>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">
                Read Only
              </span>
            </div>
            {/* Deskripsi */}
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                Deskripsi
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {t.deskripsi || (
                  <span className="text-gray-300 italic">
                    Belum ada deskripsi
                  </span>
                )}
              </p>
            </div>
            {/* Jam Operasional */}
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Clock size={10} /> Jam Operasional
              </p>
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl ${t.jamOperasional ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"}`}
              >
                <Clock
                  size={16}
                  className={
                    t.jamOperasional ? "text-amber-600" : "text-gray-400"
                  }
                />
                <p
                  className={`text-sm font-medium ${t.jamOperasional ? "text-amber-700" : "text-gray-500"}`}
                >
                  {t.jamOperasional || "Belum diset"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kontak & Info — top right, compact */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Phone size={13} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                Kontak & Info
              </h3>
            </div>
            <button
              onClick={() => openEdit("kontak")}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-lg hover:bg-emerald-100 transition-all"
            >
              <Edit2 size={11} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {/* Telepon */}
            <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mb-1">
                <Phone size={12} className="text-emerald-600" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">
                Telepon
              </p>
              <p className="text-sm text-gray-700 truncate">
                {t.telepon || (t as any).noHp || "—"}
              </p>
            </div>
            {/* Email */}
            <div className="col-span-1 bg-gray-100 border border-gray-200 rounded-xl p-3 flex flex-col gap-1 opacity-80">
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mb-1">
                <Mail size={12} className="text-gray-500" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">
                Email
              </p>
              <p className="text-sm text-gray-600 truncate">
                {(t as any).penjual?.pengguna?.email || (t as any).email || "—"}
              </p>
              <span className="text-[9px] text-gray-400 italic">read only</span>
            </div>
            {/* SIUP */}
            <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mb-1">
                <FileText size={12} className="text-purple-600" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">
                SIUP
              </p>
              <p className="text-sm text-gray-700 truncate">
                {(t as any).nomorSIUP || "—"}
              </p>
              {(t as any).nomorSIUP && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full w-fit">
                  ✓ Terdaftar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Lokasi + Telegram — bottom right, 2-col */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lokasi Toko */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <MapPin size={13} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                Lokasi
              </h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
              {t.alamat || "Alamat belum diset"}
            </p>
            {t.lat && t.lng ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 flex-1 min-h-[140px] relative">
                <iframe
                  title="store-map-preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: "none" }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.lng - 0.008}%2C${t.lat - 0.005}%2C${t.lng + 0.008}%2C${t.lat + 0.005}&layer=mapnik&marker=${t.lat}%2C${t.lng}`}
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${t.lat}&mlon=${t.lng}#map=16/${t.lat}/${t.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-emerald-600 px-2 py-1 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors"
                >
                  Buka ↗
                </a>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 flex-1 min-h-[140px] flex flex-col items-center justify-center gap-2 bg-gray-50/50">
                <MapPin size={22} className="text-gray-300" />
                <p className="text-xs text-gray-400">Lokasi belum diset</p>
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Send size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800">Telegram</h3>
                  <p className="text-[10px] text-gray-400">Notif pesanan</p>
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-1 rounded-full border ${hasTelegram ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}
              >
                {hasTelegram ? "✅ Aktif" : "⚠️ Off"}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 flex-1">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-center gap-2">
                <Key size={14} className="text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    Bot Token
                  </p>
                  <p className="font-mono text-xs text-gray-700 truncate">
                    {hasTelegram
                      ? `••••${(t as any).telegramBotToken?.slice(-4)}`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-center gap-2">
                <MessageSquare size={14} className="text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    Chat ID
                  </p>
                  <p className="font-mono text-xs text-gray-700 truncate">
                    {(t as any).telegramChatId || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTelegramEdit}
                className="mt-auto flex items-center justify-center gap-1.5 w-full px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all"
              >
                <Edit2 size={11} /> Konfigurasi
              </button>
              <button
                onClick={() => setTutorialOpen(!tutorialOpen)}
                className="flex items-center justify-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
              >
                <BookOpen size={10} />{" "}
                {tutorialOpen ? "Sembunyikan" : "Cara dapat Token?"}
              </button>
              {tutorialOpen && (
                <div className="px-3 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-800 space-y-1.5">
                  <p>
                    <strong>1.</strong> Cari <strong>@BotFather</strong> di
                    Telegram →{" "}
                    <a
                      href="https://t.me/botfather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#0088cc] font-bold"
                    >
                      Klik di sini
                    </a>
                  </p>
                  <p>
                    <strong>2.</strong> Ketik{" "}
                    <code className="bg-blue-100 px-1 rounded">/newbot</code> →
                    dapat Token
                  </p>
                  <p>
                    <strong>3.</strong> Start chat bot tersebut
                  </p>
                  <p>
                    <strong>4.</strong> Cari <strong>@userinfobot</strong> →
                    dapat Chat ID
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilTokoPage;
