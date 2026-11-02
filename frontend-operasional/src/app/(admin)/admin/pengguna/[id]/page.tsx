"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  MessageSquare,
  DollarSign,
  XCircle,
  Store,
  ChevronRight,
  Lock,
  MessageCircle,
  Star,
  Package,
  Building2,
  FileText,
} from "lucide-react";
import { message, Modal } from "antd";

import { formatTanggal, formatRupiah } from "@/lib/ecommerce-api";
import { storesApi } from "@/lib/api/stores";
import { ordersApi } from "@/lib/api/orders";
import { apiClient } from "@/lib/api-client";

import UserRoleBadge from "../_components/UserRoleBadge";

// Local types
interface UserDetail {
  id: string;
  nama: string;
  email: string;
  peran: string;
  noTelepon?: string;
  emailTerverifikasiPada?: string | null;
  createdAt?: string;
  namaPerusahaan?: string;
  npwpPerusahaan?: string;
  nibPerusahaan?: string;
  statusVerifikasiPerusahaan?: string;
}

interface OrderItem {
  id: string;
  createdAt: string;
  konsumenId: string;
  totalHarga: number;
  ongkir: number;
  status: string;
  item: Array<{
    id: string;
    produk?: {
      nama: string;
      toko?: {
        nama: string;
        id: string;
      };
    };
  }>;
}

interface ChatRoomItem {
  id: string;
  tipe: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantFoto: string | null;
  pesanTerakhir?: string;
  waktuPesanTerakhir?: string;
  unreadCount: number;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  percakapanId: string;
  pengirimId: string;
  isiPesan: string;
  sudahDibaca: boolean;
  createdAt: string;
}

interface StoreSummary {
  id: string;
  nama: string;
  status: string;
  kabupaten?: string;
  wilayah?: string;
  alamat?: string;
  totalProduk?: number;
  totalPesanan?: number;
  rating?: number;
}

export default function PenggunaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // States
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"transaksi" | "toko" | "chat">(
    "transaksi",
  );

  // Role specific states
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [conversations, setConversations] = useState<ChatRoomItem[]>([]);
  const [storeData, setStoreData] = useState<StoreSummary | null>(null);

  // Common UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleResendVerification = async () => {
    if (!userData?.email) return;
    try {
      setResendingEmail(true);
      await apiClient.post("/auth/resend-verification", {
        email: userData.email,
      });
      message.success(`Email verifikasi dikirim ulang ke ${userData.email}`);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Gagal mengirim ulang verifikasi",
      );
    } finally {
      setResendingEmail(false);
    }
  };

  // Audit Modal States
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomItem | null>(null);
  const [roomMessages, setRoomMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Determine role helpers
  const mappedRole = useMemo(() => {
    if (!userData) return "";
    return userData.peran === "KONSUMEN"
      ? "USER"
      : userData.peran === "PENJUAL"
        ? "SELLER"
        : userData.peran === "KURIR"
          ? "COURIER"
          : userData.peran === "ADMIN_CS"
            ? "CS"
            : userData.peran;
  }, [userData]);

  // Guard against static sub-routes falling through to dynamic [id] route
  useEffect(() => {
    if (id === "logs") {
      router.replace("/admin/pengguna/logs");
    } else if (id === "tambah") {
      router.replace("/admin/pengguna/tambah");
    }
  }, [id, router]);

  // Fetch complete details
  const fetchAllData = useCallback(async () => {
    if (!id || id === "logs" || id === "tambah") return;
    try {
      setLoading(true);
      setError("");

      // 1. Fetch User Profile
      const userRes = await apiClient.get(`/pengguna/${id}`);
      const user = userRes?.data?.data || userRes?.data;
      if (!user) {
        throw new Error("Data pengguna tidak ditemukan.");
      }
      setUserData(user);

      const role =
        user.peran === "KONSUMEN"
          ? "USER"
          : user.peran === "PENJUAL"
            ? "SELLER"
            : user.peran === "KURIR"
              ? "COURIER"
              : user.peran === "ADMIN_CS"
                ? "CS"
                : user.peran;

      // 2. Fetch specific role content
      if (role === "SELLER") {
        setActiveTab("toko");
        try {
          const storeRes = await storesApi.adminGetAll({ limit: 100 });
          const raw = storeRes?.data?.data || storeRes?.data || [];
          const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
          const matchedStore = arr.find(
            (s: any) => s.penjual?.penggunaId === id,
          );
          if (matchedStore) {
            setStoreData(matchedStore);
          }
        } catch (err) {
          console.warn("Gagal memuat detail toko seller:", err);
        }

        try {
          const chatRes = await apiClient.get(
            `/chat/admin/conversations/user/${id}`,
          );
          setConversations(chatRes?.data?.data || chatRes?.data || []);
        } catch (err) {
          console.warn("Gagal memuat histori chat seller:", err);
        }
      } else if (role === "USER" || role === "KONSUMEN") {
        setActiveTab("transaksi");
        try {
          const ordersRes = await ordersApi.adminGetAll({ limit: 1000 });
          const raw = ordersRes?.data?.data || ordersRes?.data || [];
          const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
          const userOrders = arr.filter(
            (ord: OrderItem) => ord.konsumenId === id,
          );
          setOrders(userOrders);
        } catch (err) {
          console.warn("Gagal memuat histori transaksi pembeli:", err);
        }

        try {
          const chatRes = await apiClient.get(
            `/chat/admin/conversations/user/${id}`,
          );
          setConversations(chatRes?.data?.data || chatRes?.data || []);
        } catch (err) {
          console.warn("Gagal memuat histori chat pembeli:", err);
        }
      } else if (role === "CS") {
        setActiveTab("chat");
        try {
          const chatRes = await apiClient.get("/chat/admin/conversations");
          const arr = chatRes?.data?.data || chatRes?.data || [];
          if (Array.isArray(arr)) {
            const csConversations = arr
              .filter(
                (conv: any) =>
                  conv.partisipanA === id || conv.partisipanB === id,
              )
              .map((c: any) => ({
                id: c.id,
                tipe: "ADMIN_CS",
                otherParticipantId: c.customer?.id || "",
                otherParticipantName: c.customer?.name || "Pelanggan",
                otherParticipantFoto: null,
                pesanTerakhir: c.lastMessage,
                waktuPesanTerakhir: c.lastMessageAt,
                unreadCount: c.unreadCount,
                updatedAt: c.updatedAt,
              }));
            setConversations(csConversations);
          }
        } catch (err) {
          console.warn("Gagal memuat histori layanan CS:", err);
        }
      }
    } catch (err: any) {
      console.error("Error fetching details:", err);
      setError(err?.message || "Gagal memuat data detail pengguna.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Open read-only message logs
  const openChatAudit = async (room: ChatRoomItem) => {
    setSelectedRoom(room);
    setAuditModalOpen(true);
    setLoadingMessages(true);
    setRoomMessages([]);
    try {
      const res = await apiClient.get(`/chat/conversations/${room.id}`);
      const payload = res?.data?.data || res?.data;
      if (payload && payload.pesan) {
        setRoomMessages(payload.pesan);
      }
    } catch (err) {
      console.error("Gagal memuat pesan log chat:", err);
      message.error("Gagal mengambil isi obrolan.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Compute stats for buyer
  const consumerStats = useMemo(() => {
    if (orders.length === 0)
      return { total: 0, spent: 0, completed: 0, cancelled: 0 };
    let spent = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      if (["COMPLETED", "DELIVERED"].includes(o.status)) {
        spent += o.totalHarga;
        completed++;
      } else if (o.status === "CANCELLED") {
        cancelled++;
      }
    });

    return { total: orders.length, spent, completed, cancelled };
  }, [orders]);

  // Initials helper
  const initials = useMemo(() => {
    if (!userData?.nama) return "U";
    return userData.nama
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-slate-400 font-normal text-xs">
          Memuat data audit detail pengguna...
        </p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-base font-normal text-slate-800">
            Terjadi Kesalahan
          </h2>
          <p className="text-xs font-normal text-slate-500 leading-relaxed">
            {error || "Pengguna tidak ditemukan"}
          </p>
          <button
            onClick={() => router.push("/admin/pengguna")}
            className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-normal text-xs hover:bg-slate-50 transition-colors"
          >
            Kembali ke Daftar Pengguna
          </button>
        </div>
      </div>
    );
  }

  const roleLabel =
    userData.peran === "KONSUMEN"
      ? "KONSUMEN (Pelanggan)"
      : userData.peran === "PENJUAL"
        ? "PENJUAL (Seller)"
        : userData.peran === "KURIR"
          ? "KURIR (Delivery)"
          : userData.peran === "ADMIN_CS"
            ? "ADMIN CS (Support)"
            : userData.peran;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6 animate-fade-in font-sans">
      {/* Top Action Bar & Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2.5">
              <User className="text-emerald-600 stroke-[1.5]" size={22} />{" "}
              Detail Audit Pengguna
            </h1>
            <p className="text-slate-400 mt-1 text-xs font-normal">
              Laporan profil lengkap, transaksi e-commerce, dan audit histori
              chat untuk peran {roleLabel}.
            </p>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Card 1: Profil Pengguna (Left Column - 4/12) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 font-normal text-lg">
              {initials}
            </div>

            <div>
              <h2 className="text-base font-normal text-slate-900 leading-snug">
                {userData.nama || "—"}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5 font-normal">
                {userData.email}
              </p>
            </div>

            <div className="pt-1">
              <UserRoleBadge role={userData.peran} />
            </div>
          </div>

          {/* Contact & Detail Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-normal uppercase tracking-wider">
                Informasi Kontak
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                  <Mail size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-normal">
                    Email
                  </p>
                  <p className="text-slate-700 font-normal truncate mt-0.5">
                    {userData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                  <Phone size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-normal">
                    Nomor Telepon
                  </p>
                  <p className="text-slate-700 font-normal mt-0.5">
                    {userData.noTelepon || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                  <Calendar size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-normal">
                    Bergabung Pada
                  </p>
                  <p className="text-slate-700 font-normal mt-0.5">
                    {userData.createdAt
                      ? formatTanggal(userData.createdAt)
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs pt-1">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-normal">
                    Status Verifikasi
                  </p>
                  <div className="mt-1">
                    {userData.emailTerverifikasiPada ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-normal border border-emerald-200">
                        Email Terverifikasi
                      </span>
                    ) : (
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-normal border border-amber-200">
                          Email Belum Verifikasi
                        </span>
                        <button
                          onClick={handleResendVerification}
                          disabled={resendingEmail}
                          className="text-[11px] font-normal text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50 flex items-center gap-1"
                        >
                          {resendingEmail ? (
                            <>
                              <Loader2 size={10} className="animate-spin" />{" "}
                              Mengirim...
                            </>
                          ) : (
                            "Kirim Ulang Link"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* B2B Info */}
              {userData.statusVerifikasiPerusahaan === "DISETUJUI" && (
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[11px] text-slate-400 font-normal uppercase tracking-wider block mb-2">
                    Informasi Perusahaan B2B
                  </span>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0 mt-0.5">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-400 font-normal">
                        Nama Perusahaan
                      </p>
                      <p className="text-slate-700 font-normal mt-0.5">
                        {userData.namaPerusahaan || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0 mt-0.5">
                      <FileText size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-400 font-normal">
                        NPWP / NIB
                      </p>
                      <p className="text-slate-700 font-normal mt-0.5">
                        {userData.npwpPerusahaan || "—"}{" "}
                        <span className="text-slate-300 mx-1">|</span>{" "}
                        {userData.nibPerusahaan || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Content Area (Right Column - 8/12) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Bento Stats Tiles (For Consumer / User Role) */}
          {mappedRole === "USER" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-normal">Total Pesanan</span>
                  <ShoppingBag size={15} className="text-emerald-600" />
                </div>
                <p className="text-xl font-normal text-slate-900">
                  {consumerStats.total}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-normal">
                    Belanja Sukses
                  </span>
                  <DollarSign size={15} className="text-blue-500" />
                </div>
                <p className="text-xl font-normal text-slate-900 truncate">
                  {formatRupiah(consumerStats.spent)}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-normal">Selesai</span>
                  <CheckCircle2 size={15} className="text-emerald-500" />
                </div>
                <p className="text-xl font-normal text-slate-900">
                  {consumerStats.completed}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-normal">Dibatalkan</span>
                  <XCircle size={15} className="text-rose-500" />
                </div>
                <p className="text-xl font-normal text-slate-900">
                  {consumerStats.cancelled}
                </p>
              </div>
            </div>
          )}

          {/* Bento Main Tab Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            {/* Minimalist Tab Navigation Bar */}
            {(mappedRole === "USER" || mappedRole === "SELLER") && (
              <div className="flex items-center gap-6 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {mappedRole === "USER" && (
                  <button
                    onClick={() => setActiveTab("transaksi")}
                    className={`pb-3 text-xs flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                      activeTab === "transaksi"
                        ? "text-slate-900 font-normal"
                        : "text-slate-400 hover:text-slate-600 font-normal"
                    }`}
                  >
                    <ShoppingBag size={14} className="stroke-[1.5]" /> Daftar
                    Transaksi
                    {activeTab === "transaksi" && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900" />
                    )}
                  </button>
                )}

                {mappedRole === "SELLER" && (
                  <button
                    onClick={() => setActiveTab("toko")}
                    className={`pb-3 text-xs flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                      activeTab === "toko"
                        ? "text-slate-900 font-normal"
                        : "text-slate-400 hover:text-slate-600 font-normal"
                    }`}
                  >
                    <Store size={14} className="stroke-[1.5]" /> Informasi Toko
                    {activeTab === "toko" && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("chat")}
                  className={`pb-3 text-xs flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                    activeTab === "chat"
                      ? "text-slate-900 font-normal"
                      : "text-slate-400 hover:text-slate-600 font-normal"
                  }`}
                >
                  <MessageSquare size={14} className="stroke-[1.5]" /> Histori
                  Obrolan Chat
                  {activeTab === "chat" && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900" />
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: ORDERS LIST */}
            {activeTab === "transaksi" && mappedRole === "USER" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-normal text-slate-400 uppercase tracking-wider">
                    Histori Transaksi Belanja
                  </h3>
                  <span className="text-xs text-slate-400 font-normal">
                    {orders.length} Transaksi
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-xl border border-slate-100">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-normal text-xs">
                      Belum Ada Transaksi
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pengguna ini belum pernah melakukan transaksi pembelian.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xs rounded-xl border border-slate-200">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-400 border-b border-slate-200 text-[11px] font-normal uppercase tracking-wider">
                          <th className="px-5 py-3 font-normal">
                            ID Transaksi
                          </th>
                          <th className="px-5 py-3 font-normal">Tanggal</th>
                          <th className="px-5 py-3 font-normal">
                            Toko / Seller
                          </th>
                          <th className="px-5 py-3 font-normal">Total</th>
                          <th className="px-5 py-3 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((ord) => {
                          const storeName =
                            ord.item?.[0]?.produk?.toko?.nama || "Agro Market";
                          return (
                            <tr
                              key={
                                ord.id ||
                                (ord as any).id_pesanan ||
                                Math.random().toString()
                              }
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-5 py-3 font-mono text-slate-700 font-normal">
                                #
                                {String(ord.id || (ord as any).id_pesanan || "")
                                  .slice(-8)
                                  .toUpperCase()}
                              </td>
                              <td className="px-5 py-3 text-slate-500 font-normal">
                                {formatTanggal(ord.createdAt)}
                              </td>
                              <td className="px-5 py-3 text-slate-700 font-normal">
                                <span className="flex items-center gap-1.5">
                                  <Store
                                    size={13}
                                    className="text-slate-400 flex-shrink-0"
                                  />
                                  {storeName}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-800 font-normal">
                                {formatRupiah(ord.totalHarga)}
                              </td>
                              <td className="px-5 py-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-normal rounded-md uppercase tracking-wide border ${
                                    ["COMPLETED", "DELIVERED"].includes(
                                      ord.status,
                                    )
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : ord.status === "CANCELLED"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SELLER STORE INFO */}
            {activeTab === "toko" && mappedRole === "SELLER" && (
              <div className="space-y-6">
                {storeData ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center text-lg font-normal">
                          {storeData.nama?.charAt(0) || "🏪"}
                        </div>
                        <div>
                          <h3 className="text-sm font-normal text-slate-900">
                            {storeData.nama}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                            <Store size={12} className="text-slate-400" />
                            {storeData.kabupaten || "Daerah Belum Diset"}
                            {storeData.wilayah ? ` • ${storeData.wilayah}` : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-normal uppercase tracking-wider border ${
                          storeData.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {storeData.status === "ACTIVE"
                          ? "Aktif"
                          : "Menunggu / Nonaktif"}
                      </span>
                    </div>

                    {/* Quick Store Stats */}
                    <div className="grid grid-cols-3 gap-3.5">
                      <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-center">
                        <Package
                          size={15}
                          className="text-slate-400 mx-auto mb-1"
                        />
                        <p className="text-lg font-normal text-slate-900">
                          {storeData.totalProduk || 0}
                        </p>
                        <p className="text-[10px] font-normal text-slate-400 uppercase mt-0.5">
                          Produk Aktif
                        </p>
                      </div>

                      <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-center">
                        <ShoppingBag
                          size={15}
                          className="text-slate-400 mx-auto mb-1"
                        />
                        <p className="text-lg font-normal text-slate-900">
                          {storeData.totalPesanan || 0}
                        </p>
                        <p className="text-[10px] font-normal text-slate-400 uppercase mt-0.5">
                          Total Pesanan
                        </p>
                      </div>

                      <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-center">
                        <Star
                          size={15}
                          className="text-amber-400 fill-amber-400 mx-auto mb-1"
                        />
                        <p className="text-lg font-normal text-slate-900">
                          {Number(storeData.rating || 0).toFixed(1)}
                        </p>
                        <p className="text-[10px] font-normal text-slate-400 uppercase mt-0.5">
                          Rating Toko
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs font-normal text-slate-600">
                      <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-1 font-normal">
                        Alamat Toko
                      </p>
                      <p className="text-slate-700">
                        {storeData.alamat || "Alamat belum diset."}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/admin/toko/${storeData.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-normal transition-colors"
                    >
                      <span>Masuk ke Dashboard Toko</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-slate-100">
                    <Store size={32} className="text-slate-300 mx-auto mb-2" />
                    <h4 className="font-normal text-slate-800 text-xs">
                      Toko Belum Dibuat
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Seller ini telah disetujui bergabung namun belum
                      mendaftarkan toko fisiknya di platform.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: CHAT LOGS */}
            {activeTab === "chat" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-normal text-slate-400 uppercase tracking-wider">
                    Audit Log Obrolan Chat
                  </h3>
                  <span className="text-xs text-slate-400 font-normal">
                    {conversations.length} Percakapan
                  </span>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-xl border border-slate-100">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-normal text-xs">
                      Tidak Ada Log Obrolan
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pengguna ini tidak memiliki rekam percakapan chat aktif di
                      database.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xs rounded-xl border border-slate-200">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-400 border-b border-slate-200 text-[11px] font-normal uppercase tracking-wider">
                          <th className="px-5 py-3 font-normal">
                            Lawan Bicara
                          </th>
                          <th className="px-5 py-3 font-normal">Tipe</th>
                          <th className="px-5 py-3 font-normal">
                            Pesan Terakhir
                          </th>
                          <th className="px-5 py-3 font-normal">Waktu</th>
                          <th className="px-5 py-3 text-right font-normal">
                            Tindakan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {conversations.map((room) => {
                          const isCS = room.tipe === "ADMIN_CS";
                          return (
                            <tr
                              key={room.id}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-5 py-3 text-slate-800 font-normal">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-normal">
                                    {room.otherParticipantName?.charAt(0) ||
                                      "P"}
                                  </span>
                                  <span>{room.otherParticipantName}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-normal rounded-md uppercase tracking-wider border ${
                                    isCS
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200"
                                  }`}
                                >
                                  {isCS ? "Layanan CS" : "Transaksi Penjual"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-500 font-normal max-w-xs truncate">
                                {room.pesanTerakhir || (
                                  <span className="italic text-slate-300">
                                    Belum ada obrolan
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-slate-400 font-normal">
                                {room.waktuPesanTerakhir
                                  ? formatTanggal(room.waktuPesanTerakhir)
                                  : formatTanggal(room.updatedAt)}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => openChatAudit(room)}
                                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-normal transition-colors border border-slate-200"
                                >
                                  Lihat Isi Chat
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AUDIT LOG DIALOG MODAL (READ-ONLY VIEW) ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageCircle className="text-emerald-600" size={18} />
            <div>
              <p className="text-xs font-normal text-slate-800">
                Log Audit Obrolan:{" "}
                {selectedRoom?.otherParticipantName || "Unknown"}
              </p>
              <p className="text-[10px] text-slate-400 font-normal">
                ID Kamar: {selectedRoom?.id}
              </p>
            </div>
          </div>
        }
        open={auditModalOpen}
        onCancel={() => setAuditModalOpen(false)}
        footer={null}
        width={600}
        centered
        styles={{
          body: { padding: "16px" },
        }}
      >
        <div className="space-y-4">
          {/* Read Only Locked Warning Banner */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-normal leading-relaxed">
            <Lock size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Mode Audit Terkunci: Anda memantau isi percakapan secara read-only
              tanpa otorisasi modifikasi pesan.
            </span>
          </div>

          {/* Messages View Area */}
          <div className="h-[360px] overflow-y-auto bg-slate-50/50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="animate-spin text-emerald-600" size={24} />
                <p className="text-[11px] text-slate-400 font-normal">
                  Mengunduh isi pesan...
                </p>
              </div>
            ) : roomMessages.length === 0 ? (
              <div className="text-center my-auto text-slate-300 py-8">
                <MessageSquare
                  className="mx-auto text-slate-200 mb-1"
                  size={28}
                />
                <p className="text-xs font-normal">
                  Tidak ada pesan log di dalam kamar obrolan ini.
                </p>
              </div>
            ) : (
              roomMessages.map((msg) => {
                const isSentByTarget = msg.pengirimId === id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${
                      isSentByTarget
                        ? "self-end items-end"
                        : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                        isSentByTarget
                          ? "bg-slate-900 text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.isiPesan}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-normal">
                      {formatTanggal(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setAuditModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-normal hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
