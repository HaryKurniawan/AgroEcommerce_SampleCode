"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import { storesApi, chatApi } from "@/lib/ecommerce-api";

interface CourierData {
  id?: string;
  id_pengguna?: string;
  name?: string | null;
  nama?: string | null;
  email: string;
  noTelepon?: string | null;
  phoneNumber?: string | null;
}

interface StoreData {
  id: string;
  nama: string;
  courierStaffId: string | null;
  courierStaff: CourierData | null;
  kurirStaffs?: CourierData[] | null;
}

export default function SellerKurirPage() {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirectingCourierId, setRedirectingCourierId] = useState<
    string | null
  >(null);

  const handleHubungiKurir = async (courierId: string) => {
    try {
      setRedirectingCourierId(courierId);
      const res = await chatApi.createConversation({
        type: "ADMIN_CS",
        targetUserId: courierId,
      });
      const data = res?.data?.data || res?.data;
      if (data?.id) {
        router.push(`/seller/chat/${data.id}`);
      } else {
        alert("Gagal memulai obrolan dengan kurir.");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Gagal memulai obrolan dengan kurir.");
    } finally {
      setRedirectingCourierId(null);
    }
  };

  const fetchStore = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await storesApi.getMyStore();
      const data = res?.data?.data || res?.data;
      setStore(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data toko.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchStore(false));
  }, [fetchStore]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-3">
        <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-400">Memuat kurir toko...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-5 bg-white border border-gray-100 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Toko Tidak Ditemukan
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Profil toko Anda tidak dapat ditemukan atau belum terdaftar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const couriers =
    store.kurirStaffs && store.kurirStaffs.length > 0
      ? store.kurirStaffs
      : store.courierStaff
        ? [store.courierStaff]
        : [];

  const getCourierId = (c: CourierData) => c.id_pengguna || c.id || "";
  const getCourierName = (c: CourierData) =>
    c.name || c.nama || "Kurir Agrojabar";

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Truck className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-semibold text-slate-800">
            Kurir Afiliasi
          </h1>
          <span className="text-[11px] font-medium text-slate-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 ml-1">
            {couriers.length} kurir
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Daftar kurir yang ditugaskan untuk mengirimkan produk toko Anda
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Courier List ──────────────────────────────────── */}
      {couriers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-gray-100 rounded-2xl">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-slate-300">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">
              Belum Ada Kurir Terafiliasi
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Toko Anda belum memiliki kurir yang ditugaskan oleh Admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {couriers.map((courier, idx) => {
            const courierId = getCourierId(courier);
            const courierName = getCourierName(courier);
            const initial = courierName.charAt(0).toUpperCase();
            const isRedirecting = redirectingCourierId === courierId;

            return (
              <div
                key={courierId || idx}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors group"
              >
                {/* Left: avatar + info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 select-none">
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                        {courierName}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-semibold rounded-full border border-emerald-100 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        AKTIF
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {courier.email}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Phone className="w-3 h-3 shrink-0" />
                        {courier.noTelepon || courier.phoneNumber || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Aktivitas */}
                  <button
                    onClick={() => router.push(`/seller/kurir/${courierId}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg text-xs font-medium transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Aktivitas
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {/* Hubungi */}
                  <button
                    onClick={() => handleHubungiKurir(courierId)}
                    disabled={isRedirecting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {isRedirecting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    Hubungi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
