"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Navigation,
  Loader2,
  ExternalLink,
  Phone,
  MapPin,
  Locate,
  AlertCircle,
  RefreshCw,
  Route,
  Map,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Modal, ConfigProvider } from "antd";

import { ordersApi } from "@/lib/ecommerce-api";
import { useAuthStore } from "@/store/auth-store";

/* ─── Types ─── */
interface LatLng {
  lat: number;
  lng: number;
}
interface OrderDetail {
  id: string;
  alamatKirim?: string;
  customer?: {
    name?: string;
    phoneNumber?: string;
    alamatLat?: number | null;
    alamatLng?: number | null;
    penerima?: string;
    teleponPenerima?: string;
  };
}

/* ─── Dynamic Leaflet Map (SSR disabled) ─── */
const MapView = dynamic(() => import("./_components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  ),
});

export default function KurirMapPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user, _hasHydrated } = useAuthStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [destination, setDest] = useState<LatLng | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [geocodeError, setGeoError] = useState("");
  const [routeState, setRouteState] = useState<
    "idle" | "loading" | "done" | "error" | "no-gps"
  >("idle");
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const watchId = useRef<number | null>(null);
  const mapRef = useRef<any>(null);

  /* ── Fetch order ── */
  const fetchOrder = useCallback(async () => {
    try {
      const res = await ordersApi.getCourierTasks({ limit: 100 });
      const all: any[] =
        res?.data?.data?.data?.data ||
        res?.data?.data?.data ||
        res?.data?.data ||
        [];
      return Array.isArray(all)
        ? all.find((o: any) => o.id === orderId) || null
        : null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  /* ── Geocode address ── */
  const geocodeAddress = useCallback(async (address: string) => {
    setGeocoding(true);
    setGeoError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { "Accept-Language": "id,en" } },
      );
      const data = await res.json();
      if (data?.length > 0) {
        setDest({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        setGeoError("Lokasi tidak ditemukan.");
      }
    } catch {
      setGeoError("Gagal memuat lokasi tujuan.");
    } finally {
      setGeocoding(false);
    }
  }, []);

  /* ── Start GPS watch ── */
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS tidak tersedia di perangkat ini.");
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError("");
      },
      () => setGpsError("Tidak bisa akses GPS. Aktifkan lokasi."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !user) return;
    fetchOrder().then(async (found) => {
      if (!found) return;
      setOrder(found);

      // Resolve destination coordinates
      const lat = found?.customer?.alamatLat;
      const lng = found?.customer?.alamatLng;
      if (lat && lng) {
        setDest({ lat, lng });
      } else if (found?.alamatKirim) {
        await geocodeAddress(found.alamatKirim);
      }
    });

    // Start watching GPS
    startGPS();

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [_hasHydrated, user, fetchOrder, geocodeAddress, startGPS]);

  const openGoogleMaps = () => {
    if (!order?.alamatKirim && !destination) return;
    const url = destination
      ? currentPos
        ? `https://www.google.com/maps/dir/${currentPos.lat},${currentPos.lng}/${destination.lat},${destination.lng}`
        : `https://www.google.com/maps?q=${destination.lat},${destination.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order?.alamatKirim || "")}`;
    window.open(url, "_blank");
  };

  const penerima = order?.customer?.penerima || order?.customer?.name || "—";
  const telepon =
    order?.customer?.teleponPenerima || order?.customer?.phoneNumber;
  const isReady = destination && !loading && !geocoding;

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{ height: "100dvh" }}
    >
      {/* ── Floating Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-[999] px-3 pt-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-3 border border-gray-100">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <div
            className="flex-1 min-w-0 cursor-pointer group flex flex-col justify-center"
            onClick={() => setShowAddressModal(true)}
          >
            <p className="text-[13px] font-bold text-gray-900 truncate mb-0.5 group-hover:text-emerald-600 transition-colors">
              {penerima}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {order?.alamatKirim || "Memuat..."}
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {telepon && (
              <a
                href={`tel:${telepon}`}
                className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all"
              >
                <Phone size={18} className="text-emerald-600" />
              </a>
            )}
            <button
              onClick={openGoogleMaps}
              className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all"
              title="Buka di Google Maps"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                />
                <path fill="#FBBC04" d="M12 2C8.13 2 5 5.13 5 9h7V2z" />
                <path
                  fill="#34A853"
                  d="M12 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                  opacity="0"
                />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0">
        {/* Loading overlay */}
        {(loading || geocoding) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm text-gray-500 font-medium">
              {loading ? "Memuat data pesanan..." : "Mencari lokasi tujuan..."}
            </p>
          </div>
        )}

        {/* Geocode error */}
        {!loading && !geocoding && geocodeError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 gap-3 px-8 text-center">
            <MapPin size={36} className="text-gray-300" />
            <p className="text-sm text-gray-500">{geocodeError}</p>
            <button
              onClick={openGoogleMaps}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
            >
              <ExternalLink size={15} />
              Buka Google Maps
            </button>
          </div>
        )}

        {/* Map */}
        {isReady && (
          <MapView
            key={refreshKey}
            destination={destination}
            currentPos={currentPos}
            onRouteStateChange={(s) => setRouteState(s)}
            onMapReady={(m) => {
              mapRef.current = m;
            }}
          />
        )}
      </div>

      {/* Unified Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[999] px-4 py-3 rounded-t-3xl shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)] pb-safe">
        {/* Top Row: Status Indicators */}
        <div className="flex items-center justify-between mb-3">
          {/* Route Status */}
          <div>
            {routeState === "loading" && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <Loader2 size={12} className="animate-spin flex-shrink-0" />
                Menghitung rute...
              </div>
            )}
            {routeState === "error" && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <AlertCircle size={12} className="flex-shrink-0" />
                Rute tidak tersedia
              </div>
            )}
            {routeState === "done" && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <Route size={14} className="flex-shrink-0" />
                Rute siap
              </div>
            )}
          </div>

          {/* GPS Status */}
          <div>
            {gpsError ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-full">
                <AlertCircle size={11} />
                Lokasi mati
              </div>
            ) : currentPos ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-full">
                <Locate size={11} />
                GPS Aktif
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-semibold px-2.5 py-1.5 rounded-full">
                <Loader2 size={11} className="animate-spin" />
                Mencari GPS...
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Actions */}
        {!loading && order && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArrivalModal(true)}
              className="flex-1 h-[46px] bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/30 text-[15px] font-medium rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Locate size={18} />
              Pesanan Tiba
            </button>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="w-[46px] h-[46px] flex-shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 active:scale-95 transition-all"
              title="Muat Ulang Rute"
            >
              <RefreshCw size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfigProvider theme={{ components: { Modal: { borderRadiusLG: 24 } } }}>
        <Modal
          open={showArrivalModal}
          onCancel={() => setShowArrivalModal(false)}
          footer={null}
          centered
          closeIcon={false}
          width={300}
          styles={{
            body: { padding: "20px 16px" },
            mask: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2.5 border border-emerald-100">
              <MapPin size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-[16px] text-gray-900 mb-1.5">
              Pesanan Sudah Tiba?
            </h3>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
              Konfirmasi bahwa Anda telah tiba di alamat tujuan. Setelah ini,
              Anda akan diminta untuk mengunggah foto bukti pengiriman.
            </p>
            <div className="w-full flex gap-2.5">
              <button
                onClick={() => setShowArrivalModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-[13px] hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowArrivalModal(false);
                  router.push(`/kurir/pesanan/${orderId}/bukti`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-[13px] hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20"
              >
                Ya, Lanjut
              </button>
            </div>
          </div>
        </Modal>

        {/* Address Detail Modal */}
        <Modal
          open={showAddressModal}
          onCancel={() => setShowAddressModal(false)}
          footer={null}
          centered
          closeIcon={false}
          width={300}
          styles={{
            body: { padding: "20px 16px" },
            mask: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2.5 border border-emerald-100">
              <MapPin size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-[16px] text-gray-900 mb-1">
              Detail Alamat
            </h3>
            <p className="text-[12px] font-semibold text-gray-800 mb-3">
              {penerima} {telepon ? `(${telepon})` : ""}
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-left w-full break-words">
              {order?.alamatKirim}
            </p>
            <div className="w-full">
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-[13px] hover:bg-emerald-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
}
