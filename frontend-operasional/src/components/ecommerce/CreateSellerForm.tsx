"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Store,
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Truck,
  Plus,
  TableProperties,
} from "lucide-react";
import dynamic from "next/dynamic";

import { usersApi } from "@/lib/ecommerce-api";
import {
  createSellerSchema,
  createCourierSchema,
} from "@/lib/validations/schemas";
import type { MapPickerValue } from "@/components/ui/MapPicker";

import { CourierPicker, CourierItem } from "./CourierPicker";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] bg-slate-100 rounded-2xl animate-pulse" />
  ),
});

interface CreateSellerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type CourierOption = "none" | "create_new" | "select_existing";

type SellerFormData = z.infer<typeof createSellerSchema>;
type CourierFormData = z.infer<typeof createCourierSchema>;

const extractList = (
  res: { data?: { data?: unknown[] } | unknown[] } | unknown,
): unknown[] => {
  const body = (res as { data?: { data?: unknown[] } | unknown[] })?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray((body as { data?: unknown[] })?.data))
    return (body as { data: unknown[] }).data;
  return [];
};

export function CreateSellerForm({
  onSuccess,
  onCancel,
}: CreateSellerFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [courierOption, setCourierOption] =
    useState<CourierOption>("create_new");
  const [couriers, setCouriers] = useState<CourierItem[]>([]);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(
    null,
  );

  // Seller form
  const sellerForm = useForm<SellerFormData>({
    resolver: zodResolver(createSellerSchema as never),
    defaultValues: {
      email: "",
      password: "",
      storeName: "",
      storeAddress: "",
      storeCity: "",
      storeProvince: "",
      storePhone: "",
      storePostalCode: "",
      storeDescription: "",
      storeLat: undefined,
      storeLng: undefined,
    },
  });

  // Map picker state
  const [mapValue, setMapValue] = useState<MapPickerValue | undefined>(
    undefined,
  );

  const handleMapChange = (val: MapPickerValue) => {
    setMapValue(val);
    sellerForm.setValue("storeLat", val.lat);
    sellerForm.setValue("storeLng", val.lng);

    const addr = val.address as Record<string, string> | undefined;
    if (addr) {
      // Auto-fill kota
      const kota =
        addr.city ||
        addr.state_district ||
        addr.municipality ||
        addr.county ||
        addr.town ||
        "";
      if (kota) sellerForm.setValue("storeCity", kota);

      // Auto-fill provinsi
      const provinsi = addr.state || "";
      if (provinsi) sellerForm.setValue("storeProvince", provinsi);

      // Auto-fill kode pos
      const kodePos = addr.postcode || "";
      if (kodePos) sellerForm.setValue("storePostalCode", kodePos);

      // Auto-fill alamat dari display name
      if (val.displayName) {
        sellerForm.setValue("storeAddress", val.displayName);
      }
    }
  };

  // Courier form
  const courierForm = useForm<CourierFormData>({
    resolver: zodResolver(createCourierSchema as never),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const fetchCouriers = useCallback(async () => {
    setCouriersLoading(true);
    try {
      const res = await usersApi.getAllCouriersForSelection();
      setCouriers(extractList(res) as CourierItem[]);
    } catch (err) {
      console.error("Error fetching couriers:", err);
    } finally {
      setCouriersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courierOption === "select_existing" && couriers.length === 0) {
      Promise.resolve().then(() => fetchCouriers());
    }
  }, [courierOption, couriers.length, fetchCouriers]);

  const handleNextStep = async () => {
    // Hanya validasi field yang relevan di Step 1
    const step1Fields = [
      "email",
      "password",
      "storeName",
      "storeAddress",
      "storeCity",
      "storeProvince",
      "storePhone",
    ] as const;
    const isValid = await sellerForm.trigger(step1Fields);
    if (isValid) {
      setStep(2);
    } else {
      // Scroll ke error pertama
      const firstError = document.querySelector(
        '[data-error="true"], .text-red-500',
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const isStep2Valid = async () => {
    if (courierOption === "none") return true;
    if (courierOption === "create_new") return await courierForm.trigger();
    if (courierOption === "select_existing") return !!selectedCourierId;
    return true;
  };

  const handleSubmit = async () => {
    const step2Ok = await isStep2Valid();
    if (!step2Ok) return;

    setError("");
    setSubmitting(true);
    const sellerData = sellerForm.getValues();
    const courierData = courierForm.getValues();

    try {
      // Bangun payload yang cocok dengan CreateSellerWithCourierDto backend
      const payload: Record<string, unknown> = {
        nama: sellerData.storeName,
        email: sellerData.email,
        kataSandi: sellerData.password,
        noTelepon: sellerData.storePhone,
        storeName: sellerData.storeName,
        storeAddress: sellerData.storeAddress,
        storeCity: sellerData.storeCity,
        storeProvince: sellerData.storeProvince,
        storePhone: sellerData.storePhone,
        storePostalCode: sellerData.storePostalCode || "",
        storeDescription: sellerData.storeDescription || "",
        storeLat: sellerData.storeLat,
        storeLng: sellerData.storeLng,
        courierOption,
      };

      // Courier payload — flat fields agar bisa dinormalisasi use case
      if (courierOption === "create_new") {
        payload.courierName = courierData.name;
        payload.courierEmail = courierData.email;
        payload.courierPassword = courierData.password;
        payload.courierPhone = courierData.phone;
      }

      if (courierOption === "select_existing" && selectedCourierId) {
        payload.courierUserId = selectedCourierId;
      }

      await usersApi.createSellerWithCourier(payload);
      onSuccess();
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: { message?: string | string[] } };
      };
      const msg = e?.response?.data?.message || "Gagal membuat akun seller";
      const isConflict =
        e?.response?.status === 409 ||
        (typeof msg === "string" &&
          (msg.toLowerCase().includes("terdaftar") ||
            msg.toLowerCase().includes("already exists") ||
            msg.toLowerCase().includes("conflict")));

      if (isConflict) {
        setFailureReason(Array.isArray(msg) ? msg.join(", ") : msg);
        setShowFailureModal(true);
      } else {
        setError(Array.isArray(msg) ? msg.join(", ") : msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const blockNumbers = (e: React.KeyboardEvent) => {
    if (/[0-9]/.test(e.key)) e.preventDefault();
  };

  const blockNonNumbers = (e: React.KeyboardEvent) => {
    if (
      !/[0-9+]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Delete"
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
          {/* Header */}
          <div className="px-8 py-5 border-b bg-primary-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Store className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                  Buat Akun Seller Baru
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${step === 1 ? "text-primary-600" : "text-slate-400"}`}
                  >
                    Buat Seller
                  </p>
                  <ChevronRight size={10} className="text-slate-300" />
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${step === 2 ? "text-primary-600" : "text-slate-400"}`}
                  >
                    Akun Kurir Seller
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-50 w-full">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-hide">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 font-bold text-xs rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Seller Info */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Account Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-4 border-primary-600 pl-3">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Informasi Akun Seller
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sellerEmail"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                          id="sellerEmail"
                          type="email"
                          {...sellerForm.register("email")}
                          className={`w-full pl-11 pr-4 py-3 border ${sellerForm.formState.errors.email ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                          placeholder="seller@agrojabar.id"
                        />
                      </div>
                      {sellerForm.formState.errors.email && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sellerPassword"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Password Akun *
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                          id="sellerPassword"
                          type="password"
                          {...sellerForm.register("password")}
                          className={`w-full pl-11 pr-4 py-3 border ${sellerForm.formState.errors.password ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                          placeholder="Min. 6 karakter"
                        />
                      </div>
                      {sellerForm.formState.errors.password && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Store Section */}
                <div className="space-y-5 pt-2">
                  <div className="flex items-center gap-3 border-l-4 border-primary-600 pl-3">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Informasi Toko
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label
                        htmlFor="storeName"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Nama Toko *
                      </label>
                      <input
                        id="storeName"
                        {...sellerForm.register("storeName")}
                        onKeyDown={blockNumbers}
                        className={`w-full px-4 py-3 border ${sellerForm.formState.errors.storeName ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                        placeholder="Contoh: Toko Sayur Segar Jaya"
                      />
                      {sellerForm.formState.errors.storeName && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storeName.message}
                        </p>
                      )}
                    </div>

                    {/* Map Picker — titik lokasi toko */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">
                        <MapPin size={12} className="inline mr-1 -mt-0.5" />
                        Titik Lokasi Toko (Pilih di Peta)
                      </label>
                      <MapPicker
                        value={mapValue}
                        onChange={handleMapChange}
                        height="220px"
                        placeholder="Cari alamat toko..."
                      />
                      {mapValue && (
                        <p className="text-[10px] text-slate-400 ml-1">
                          Koordinat: {mapValue.lat.toFixed(5)},{" "}
                          {mapValue.lng.toFixed(5)}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label
                        htmlFor="storeAddress"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Alamat Lengkap Toko *
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-4 top-4 text-slate-300"
                        />
                        <textarea
                          id="storeAddress"
                          {...sellerForm.register("storeAddress")}
                          rows={2}
                          className={`w-full pl-11 pr-4 py-3 border ${sellerForm.formState.errors.storeAddress ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50 resize-none`}
                          placeholder="Jl. Raya Bandung No. 10..."
                        />
                      </div>
                      {sellerForm.formState.errors.storeAddress && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storeAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="storeCity"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Kota / Kabupaten *
                      </label>
                      <input
                        id="storeCity"
                        {...sellerForm.register("storeCity")}
                        className={`w-full px-4 py-3 border ${sellerForm.formState.errors.storeCity ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                        placeholder="Bandung"
                      />
                      {sellerForm.formState.errors.storeCity && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storeCity.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="storeProvince"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Provinsi *
                      </label>
                      <input
                        id="storeProvince"
                        {...sellerForm.register("storeProvince")}
                        className={`w-full px-4 py-3 border ${sellerForm.formState.errors.storeProvince ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                        placeholder="Jawa Barat"
                      />
                      {sellerForm.formState.errors.storeProvince && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storeProvince.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="storePhone"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Nomor Telepon Toko *
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                          id="storePhone"
                          type="tel"
                          {...sellerForm.register("storePhone")}
                          onKeyDown={blockNonNumbers}
                          className={`w-full pl-11 pr-4 py-3 border ${sellerForm.formState.errors.storePhone ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                          placeholder="08XXXXXXXXXX"
                        />
                      </div>
                      {sellerForm.formState.errors.storePhone && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storePhone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="storePostalCode"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Kode Pos Toko
                      </label>
                      <input
                        id="storePostalCode"
                        {...sellerForm.register("storePostalCode")}
                        onKeyDown={blockNonNumbers}
                        maxLength={5}
                        className={`w-full px-4 py-3 border ${sellerForm.formState.errors.storePostalCode ? "border-red-300 ring-red-50" : "border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500"} rounded-2xl text-sm outline-none transition-all bg-slate-50/50`}
                        placeholder="40132"
                      />
                      {sellerForm.formState.errors.storePostalCode && (
                        <p className="text-[10px] text-red-500 font-medium italic ml-1">
                          {sellerForm.formState.errors.storePostalCode.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label
                        htmlFor="storeDescription"
                        className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1"
                      >
                        Deskripsi Singkat Toko
                      </label>
                      <div className="relative">
                        <FileText
                          size={16}
                          className="absolute left-4 top-4 text-slate-300"
                        />
                        <textarea
                          id="storeDescription"
                          {...sellerForm.register("storeDescription")}
                          rows={3}
                          className={`w-full pl-11 pr-4 py-3 border border-slate-100 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 rounded-2xl text-sm outline-none transition-all bg-slate-50/50 resize-none`}
                          placeholder="Apa yang toko Anda jual? (opsional)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Courier Affiliation */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 pb-2">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-1 border border-primary-100">
                    <Truck size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Akun Kurir Seller
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Setiap seller membutuhkan kurir terhubung. Silakan buat akun
                    kurir baru untuk toko Anda.
                  </p>
                </div>

                {/* Create new courier form */}
                {courierOption === "create_new" && (
                  <div className="bg-primary-50/20 rounded-2xl p-5 space-y-4 border border-primary-100/40 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xs font-semibold text-primary-700 flex items-center gap-2">
                      <User size={14} /> Entitas Kurir Baru
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label
                          htmlFor="courierName"
                          className="block text-[10px] font-semibold text-slate-600 ml-1"
                        >
                          Nama Kurir *
                        </label>
                        <input
                          id="courierName"
                          {...courierForm.register("name")}
                          onKeyDown={blockNumbers}
                          className={`w-full px-3 py-2 border ${courierForm.formState.errors.name ? "border-red-300" : "border-slate-100"} rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all`}
                          placeholder="Contoh: Budi Kurir"
                        />
                        {courierForm.formState.errors.name && (
                          <p className="text-[10px] text-red-500 font-medium italic ml-1">
                            {courierForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="courierEmail"
                          className="block text-[10px] font-semibold text-slate-600 ml-1"
                        >
                          Email Kurir *
                        </label>
                        <input
                          id="courierEmail"
                          type="email"
                          {...courierForm.register("email")}
                          className={`w-full px-3 py-2 border ${courierForm.formState.errors.email ? "border-red-300" : "border-slate-100"} rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all`}
                          placeholder="kurir@agrojabar.id"
                        />
                        {courierForm.formState.errors.email && (
                          <p className="text-[10px] text-red-500 font-medium italic ml-1">
                            {courierForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="courierPhone"
                          className="block text-[10px] font-semibold text-slate-600 ml-1"
                        >
                          Nomor Telepon Kurir *
                        </label>
                        <input
                          id="courierPhone"
                          type="tel"
                          {...courierForm.register("phone")}
                          onKeyDown={blockNonNumbers}
                          className={`w-full px-3 py-2 border ${courierForm.formState.errors.phone ? "border-red-300" : "border-slate-100"} rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all`}
                          placeholder="08XXXXXXXXXX"
                        />
                        {courierForm.formState.errors.phone && (
                          <p className="text-[10px] text-red-500 font-medium italic ml-1">
                            {courierForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="courierPassword"
                          className="block text-[10px] font-semibold text-slate-600 ml-1"
                        >
                          Password Awal Kurir *
                        </label>
                        <input
                          id="courierPassword"
                          type="password"
                          {...courierForm.register("password")}
                          className={`w-full px-3 py-2 border ${courierForm.formState.errors.password ? "border-red-300" : "border-slate-100"} rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all`}
                          placeholder="Min. 6 karakter"
                        />
                        {courierForm.formState.errors.password && (
                          <p className="text-[10px] text-red-500 font-medium italic ml-1">
                            {courierForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Courier picker */}
                {courierOption === "select_existing" && (
                  <div className="bg-primary-50/20 rounded-2xl p-5 border border-primary-100/40 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xs font-semibold text-primary-700 mb-3 flex items-center gap-2">
                      <TableProperties size={14} /> Daftar Kurir Internal
                    </h4>
                    <CourierPicker
                      couriers={couriers}
                      selectedId={selectedCourierId}
                      onSelect={setSelectedCourierId}
                      loading={couriersLoading}
                    />
                    {courierOption === "select_existing" &&
                      !selectedCourierId && (
                        <p className="mt-3 text-[10px] text-orange-500 font-semibold italic text-center">
                          ⚠️ Silakan pilih salah satu kurir dari daftar diatas
                        </p>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t bg-slate-50/50 flex items-center justify-between">
            <button
              type="button"
              onClick={step === 1 ? onCancel : () => setStep(1)}
              className="group flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-all font-display"
            >
              {step === 1 ? (
                "Batal"
              ) : (
                <>
                  <ChevronLeft
                    size={18}
                    className="group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  Kembali
                </>
              )}
            </button>

            <div className="flex gap-3">
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="group flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all transform active:scale-95"
                >
                  Selanjutnya: Akun Kurir Seller{" "}
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Check size={20} strokeWidth={3} />
                      Selesai & Daftarkan
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Failure Modal for Registered Emails */}
      {showFailureModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-lg p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-red-100">
            {/* Top decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 w-full" />

            <div className="p-8 text-center space-y-6">
              {/* Icon Container with beautiful animations and shadow */}
              <div className="w-20 h-20 bg-rose-50 border border-rose-100 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-100 relative group animate-bounce">
                <AlertCircle size={40} className="stroke-[2.5]" />
                <div className="absolute inset-0 bg-rose-500 rounded-[2rem] opacity-0 group-hover:opacity-10 transition-all duration-300 blur-md" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  Pendaftaran Gagal!
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed px-2">
                  Sistem mendeteksi adanya kendala dalam pembuatan akun. Silakan
                  periksa kembali detail yang Anda masukkan.
                </p>
              </div>

              {/* Error Detail Card */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-5 text-left flex items-start gap-4">
                <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-rose-700 uppercase tracking-widest">
                    Detail Kesalahan
                  </h4>
                  <p className="text-sm font-semibold text-slate-700 mt-1 leading-relaxed">
                    {failureReason ||
                      "Email yang Anda masukkan sudah terdaftar di sistem."}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFailureModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white text-sm font-bold rounded-2xl shadow-xl shadow-slate-100 transition-all transform active:scale-95 flex items-center justify-center gap-2 font-display"
                >
                  <X size={16} strokeWidth={2.5} />
                  Tutup & Sesuaikan Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
