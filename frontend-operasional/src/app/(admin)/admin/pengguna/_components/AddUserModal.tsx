"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  MapPin,
  Warehouse,
  Search,
  Loader2,
  CheckCircle,
  Navigation,
  List,
  Building2,
  AlertCircle,
  UserPlus,
  Phone,
} from "lucide-react";

import FormModal from "@/components/ui/FormModal";
import { adminApi } from "@/lib/ecommerce-api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WarehouseOption {
  id: string;
  nama: string;
  kode: string;
  kabupaten: string;
  tipe?: string;
  lat?: number;
  lng?: number;
  jarakKm?: number;
}

export interface CreateUserPayload {
  nama: string;
  email: string;
  kataSandi: string;
  peran: string;
  gudangId?: string;
  noTelepon?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload) => Promise<void>;
  loading: boolean;
}

// ─── Roles config ─────────────────────────────────────────────────────────────

const ROLES = [
  {
    value: "KONSUMEN",
    label: "🛒 Konsumen",
    desc: "Pembeli di platform ecommerce",
  },
  {
    value: "PENJUAL",
    label: "🏪 Penjual (Seller)",
    desc: "Pemilik toko di platform",
  },
  { value: "PETANI", label: "🌾 Petani", desc: "Mitra petani Agro Jabar" },
  {
    value: "ADMIN_GUDANG",
    label: "⚙️ Admin Gudang",
    desc: "Administrator keseluruhan gudang (Global)",
  },
  {
    value: "GUDANG",
    label: "🏭 Operator Gudang",
    desc: "Pengelola operasional gudang spesifik",
  },
  { value: "KURIR", label: "🚚 Kurir", desc: "Staf pengiriman barang" },
  {
    value: "ADMIN_PETANI",
    label: "👨‍💼 Admin Petani",
    desc: "Administrator program petani",
  },
  { value: "ADMIN_CS", label: "💬 Admin CS", desc: "Customer service admin" },
];

const ROLES_NEEDING_WAREHOUSE = ["GUDANG", "PENJUAL"];

// ─── Geocoding helper (Nominatim OSM) ────────────────────────────────────────

async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(address + ", Jawa Barat, Indonesia");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=id`,
      {
        headers: {
          "Accept-Language": "id",
          "User-Agent": "AgroJabar-Admin/1.0",
        },
      },
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Sub-component: Warehouse Tab ────────────────────────────────────────────

const WarehouseSelector = ({
  selectedId,
  onChange,
}: {
  selectedId: string;
  onChange: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");

  // Auto tab state
  const [addressInput, setAddressInput] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [nearbyWarehouses, setNearbyWarehouses] = useState<WarehouseOption[]>(
    [],
  );
  const [geoError, setGeoError] = useState("");

  // Manual tab state
  const [manualSearch, setManualSearch] = useState("");
  const [allWarehouses, setAllWarehouses] = useState<WarehouseOption[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Load all warehouses when switching to manual tab
  useEffect(() => {
    let isMounted = true;
    if (activeTab === "manual" && allWarehouses.length === 0) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        if (!isMounted) return;
        setIsLoadingAll(true);
        adminApi
          .getWarehouses()
          .then((res) => {
            if (!isMounted) return;
            const data = res?.data?.data ?? res?.data ?? [];
            setAllWarehouses(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            if (isMounted) setAllWarehouses([]);
          })
          .finally(() => {
            if (isMounted) setIsLoadingAll(false);
          });
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [activeTab, allWarehouses.length]);

  const handleAutoSearch = async () => {
    if (!addressInput.trim()) return;
    setIsGeocoding(true);
    setGeoError("");
    setNearbyWarehouses([]);

    const coords = await geocodeAddress(addressInput);
    if (!coords) {
      setGeoError(
        'Alamat tidak ditemukan. Coba tulis lebih spesifik (contoh: "Jl. Soekarno Hatta No 1, Bandung").',
      );
      setIsGeocoding(false);
      return;
    }

    try {
      const res = await adminApi.findNearestWarehouses(
        coords.lat,
        coords.lng,
        5,
      );
      const warehouses = res?.data?.data ?? [];
      setNearbyWarehouses(Array.isArray(warehouses) ? warehouses : []);
      if (warehouses.length === 0)
        setGeoError("Tidak ada gudang ditemukan di dekat alamat ini.");
    } catch {
      setGeoError("Gagal mencari gudang terdekat. Coba lagi.");
    }
    setIsGeocoding(false);
  };

  const filteredManual = allWarehouses.filter(
    (w) =>
      !manualSearch ||
      w.nama.toLowerCase().includes(manualSearch.toLowerCase()) ||
      w.kabupaten?.toLowerCase().includes(manualSearch.toLowerCase()) ||
      w.kode?.toLowerCase().includes(manualSearch.toLowerCase()),
  );

  const renderWarehouseCard = (w: WarehouseOption, showDistance = false) => (
    <button
      key={w.id}
      type="button"
      onClick={() => onChange(w.id)}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
        selectedId === w.id
          ? "border-emerald-500 bg-emerald-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selectedId === w.id
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <Building2 size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${selectedId === w.id ? "text-emerald-900" : "text-gray-800"}`}
          >
            {w.nama}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {w.kabupaten} ·{" "}
            <span className="font-mono text-[10px]">{w.kode}</span>
            {showDistance && typeof w.jarakKm === "number" && (
              <span className="ml-1 text-emerald-600 font-semibold">
                · {w.jarakKm.toFixed(1)} km
              </span>
            )}
          </p>
        </div>
        {selectedId === w.id && (
          <CheckCircle size={17} className="text-emerald-600 flex-shrink-0" />
        )}
      </div>
    </button>
  );

  return (
    <div className="mt-2">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("auto")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "auto"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Navigation size={13} />
          Deteksi Otomatis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "manual"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <List size={13} />
          Pilih dari Daftar
        </button>
      </div>

      {/* ── Auto Tab ── */}
      {activeTab === "auto" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAutoSearch())
                }
                placeholder="Contoh: Jl. Soekarno Hatta, Bandung"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAutoSearch}
              disabled={isGeocoding || !addressInput.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-1.5 min-w-[80px] justify-center"
            >
              {isGeocoding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Search size={14} /> Cari
                </>
              )}
            </button>
          </div>

          {geoError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {geoError}
            </div>
          )}

          {nearbyWarehouses.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Gudang terdekat ({nearbyWarehouses.length} ditemukan)
              </p>
              {nearbyWarehouses.map((w) => renderWarehouseCard(w, true))}
            </div>
          )}

          {!isGeocoding && nearbyWarehouses.length === 0 && !geoError && (
            <p className="text-xs text-gray-400 text-center py-4 italic">
              Masukkan alamat lalu klik &quot;Cari&quot; untuk menemukan gudang
              terdekat.
            </p>
          )}
        </div>
      )}

      {/* ── Manual Tab ── */}
      {activeTab === "manual" && (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              placeholder="Cari nama gudang atau kabupaten..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none transition-all"
            />
          </div>

          {isLoadingAll ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-emerald-500" />
            </div>
          ) : filteredManual.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 italic">
              {manualSearch
                ? "Gudang tidak ditemukan."
                : "Belum ada gudang terdaftar."}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {filteredManual.map((w) => renderWarehouseCard(w, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Sub-component: Courier Selector ──────────────────────────────────────────

const CourierSelector = ({
  selectedId,
  onChange,
  onNewCourier,
  isNew,
}: {
  selectedId: string;
  onChange: (id: string) => void;
  onNewCourier: (isNew: boolean) => void;
  isNew: boolean;
}) => {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!isNew && couriers.length === 0) {
      setLoading(true);
      adminApi
        .getAllCouriersForSelection()
        .then((res) => {
          if (isMounted) setCouriers(res.data?.data || []);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isNew, couriers.length]);

  const filtered = couriers.filter(
    (c) =>
      c.nama?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-2 space-y-3">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onNewCourier(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isNew
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <UserPlus size={13} />
          Kurir Baru
        </button>
        <button
          type="button"
          onClick={() => onNewCourier(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            !isNew
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <List size={13} />
          Pilih Kurir
        </button>
      </div>

      {!isNew && (
        <>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kurir..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange(c.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedId === c.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-100 bg-white hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.nama}
                      </p>
                      <p className="text-[11px] text-gray-400">{c.email}</p>
                    </div>
                    {selectedId === c.id && (
                      <CheckCircle size={16} className="text-emerald-600" />
                    )}
                  </div>
                </button>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4 italic">
                {search
                  ? "Kurir tidak ditemukan."
                  : "Belum ada kurir terdaftar."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    kataSandi: "",
    noTelepon: "",
    peran: "KONSUMEN",
    gudangId: "",
    courierId: "",
    isNewCourier: true,
  });

  const needsWarehouse = ROLES_NEEDING_WAREHOUSE.includes(formData.peran);
  const selectedRole = ROLES.find((r) => r.value === formData.peran);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateUserPayload = {
      nama: formData.nama,
      email: formData.email,
      kataSandi: formData.kataSandi,
      peran: formData.peran,
    };
    if (formData.noTelepon) {
      payload.noTelepon = formData.noTelepon;
    }
    if (needsWarehouse && formData.gudangId) {
      payload.gudangId = formData.gudangId;
    }
    // Handle courier association for PENJUAL or creation for KURIR
    if (formData.peran === "KURIR" && !formData.isNewCourier) {
      // Logic for existing courier selection
    }
    onSubmit(payload);
  };

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Akun Pengguna"
      subtitle="Isi data di bawah ini untuk mendaftarkan akun baru ke platform."
      headerColor="bg-emerald-600"
      onSubmit={handleSubmit}
      submitLabel="Daftarkan Akun"
      submitLoading={loading}
      maxWidth="max-w-xl"
    >
      {/* Nama */}
      <div>
        <label
          htmlFor="user-fullname"
          className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
        >
          Nama Lengkap
        </label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="user-fullname"
            type="text"
            value={formData.nama}
            onChange={(e) => set("nama", e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none text-sm transition-all"
            placeholder="Contoh: Ahmad Subarjo"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="user-email"
          className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none text-sm transition-all"
            placeholder="email@agrojabar.id"
            required
          />
        </div>
      </div>

      {/* No Telepon */}
      <div>
        <label
          htmlFor="user-phone"
          className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
        >
          No. Telepon
        </label>
        <div className="relative">
          <Phone
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="user-phone"
            type="tel"
            value={formData.noTelepon}
            onChange={(e) => set("noTelepon", e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none text-sm transition-all"
            placeholder="Contoh: 08123456789"
          />
        </div>
      </div>

      {/* Kata Sandi */}
      <div>
        <label
          htmlFor="user-password"
          className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="user-password"
            type="password"
            value={formData.kataSandi}
            onChange={(e) => set("kataSandi", e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none text-sm transition-all"
            placeholder="Minimal 6 karakter"
            minLength={6}
            required
          />
        </div>
      </div>

      {/* Peran */}
      <div>
        <label
          htmlFor="user-role"
          className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
        >
          Peran / Role
        </label>
        <div className="relative">
          <Briefcase
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            id="user-role"
            value={formData.peran}
            onChange={(e) => set("peran", e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white outline-none text-sm transition-all appearance-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {selectedRole && (
          <p className="mt-1.5 ml-1 text-[11px] text-gray-400">
            {selectedRole.desc}
          </p>
        )}
      </div>

      {/* Warehouse Selector — untuk GUDANG / PENJUAL */}
      {needsWarehouse && (
        <div className="border border-emerald-100 bg-emerald-50/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Warehouse size={16} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-gray-800">
              {formData.peran === "PENJUAL"
                ? "Affiliasi Gudang"
                : "Pilih Gudang"}
            </h4>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Wajib diisi
            </span>
          </div>
          <WarehouseSelector
            selectedId={formData.gudangId}
            onChange={(id) => set("gudangId", id)}
          />
        </div>
      )}

      {/* Courier Selector — untuk KURIR role */}
      {formData.peran === "KURIR" && (
        <div className="border border-emerald-100 bg-emerald-50/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <List size={16} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-gray-800">
              Konfigurasi Kurir
            </h4>
          </div>
          <CourierSelector
            selectedId={formData.courierId}
            onChange={(id) => set("courierId", id)}
            isNew={formData.isNewCourier}
            onNewCourier={(isNew) =>
              set("isNewCourier", isNew ? "true" : "false")
            }
          />
        </div>
      )}
    </FormModal>
  );
};

export default AddUserModal;
