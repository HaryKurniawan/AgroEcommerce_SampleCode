"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  ChevronDown,
  Building2,
  ArrowRight,
  CheckCircle2,
  Save,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { addressesApi } from "@/lib/ecommerce-api";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/src/hooks/query-keys";
import { useAuthStore } from "@/src/store/auth-store";
import { useLocationFilter } from "@/src/hooks/product/useLocationFilter";

export default function UnifiedOnboardingModal() {
  const {
    isAuthenticated,
    _hasHydrated,
    user,
    showOnboarding,
    dismissOnboarding,
  } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Address & Location State
  const { availableCities, selectedCity, setCity } = useLocationFilter();
  const [localCity, setLocalCity] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedCity) {
      setLocalCity(selectedCity);
    }
  }, [selectedCity]);

  // B2B Form State
  const [b2bData, setB2bData] = useState({
    namaPerusahaan: "",
    npwpPerusahaan: "",
    nibPerusahaan: "",
  });
  const [isSubmittingB2b, setIsSubmittingB2b] = useState(false);
  const [b2bError, setB2bError] = useState<string | null>(null);

  // Auth & API Checks
  const isKonsumen = user?.role === "KONSUMEN";
  const shouldCheckAddress = _hasHydrated && isAuthenticated && isKonsumen;

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.getAll(),
    enabled: shouldCheckAddress,
  });

  const addresses = Array.isArray(addressesData?.data?.data)
    ? addressesData.data.data
    : Array.isArray(addressesData?.data)
      ? addressesData.data
      : [];
  const hasValidAddress = addresses.some(
    (addr: any) => addr.alamat && addr.kota,
  );

  const isFormPage = pathname === "/profil/alamat/form";
  const isLoginPage = pathname === "/login";

  // Modal State Machine
  type Step =
    | "onboarding_1"
    | "onboarding_2"
    | "onboarding_b2b_form"
    | "mandatory_address_city"
    | "mandatory_address_complete"
    | null;
  const [step, setStep] = useState<Step>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    const nextStep: Step = null;

    const needsAddress =
      shouldCheckAddress &&
      !isLoadingAddresses &&
      !hasValidAddress &&
      !isFormPage &&
      !isLoginPage;

    // 1. Show Mandatory Address First
    if (needsAddress) {
      setStep(
        selectedCity ? "mandatory_address_complete" : "mandatory_address_city",
      );
      return;
    }

    // 2. Show Onboarding after address is resolved (and not on form pages)
    if (showOnboarding && !isFormPage && !isLoginPage) {
      setStep((prev) =>
        prev === "onboarding_1" || prev === "onboarding_2"
          ? prev
          : "onboarding_1",
      );
      return;
    }

    setStep(null);
  }, [
    _hasHydrated,
    showOnboarding,
    shouldCheckAddress,
    isLoadingAddresses,
    hasValidAddress,
    isFormPage,
    isLoginPage,
    selectedCity,
  ]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (step) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [step]);

  if (!step) return null;

  const handleNextOnboarding = () => {
    if (step === "onboarding_1" || step === "onboarding_b2b_form") {
      setStep("onboarding_2");
    } else {
      dismissOnboarding();
    }
  };

  const handleSkipOnboarding = () => {
    dismissOnboarding();
  };

  const handleSubmitB2b = async (e: React.FormEvent) => {
    e.preventDefault();
    if (b2bData.nibPerusahaan.length !== 13) {
      setB2bError("NIB harus 13 digit");
      return;
    }
    setB2bError(null);
    setIsSubmittingB2b(true);
    try {
      await apiClient.patch("/pengguna/profile/upgrade-b2b", b2bData);
      // Pindah ke step berikutnya (onboarding_2)
      setStep("onboarding_2");
    } catch (error: any) {
      setB2bError(
        error.response?.data?.message || "Gagal menyimpan data perusahaan",
      );
    } finally {
      setIsSubmittingB2b(false);
    }
  };

  // UI Renderers for each step
  const renderOnboarding1 = () => (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center pt-2 pb-4">
        <Image
          src="/onboarding-b2b.png"
          alt="B2B"
          width={180}
          height={150}
          className="object-contain"
          priority
        />
      </div>
      <div className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 mb-3 border border-emerald-100/60">
        <span>🏢</span> Pembeli Institusi
      </div>
      <h3 className="text-lg font-medium text-gray-900 text-center mb-2 tracking-tight">
        Beli Lebih Banyak, Hemat Lebih Besar
      </h3>
      <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed px-2">
        Nikmati harga grosir dan kuota besar langsung dari petani pilihan.
      </p>
      <div className="w-full space-y-2">
        <button
          onClick={() => {
            setStep("onboarding_b2b_form");
          }}
          className="w-full py-3 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm hover:bg-primary-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Building2 size={16} />
          Daftar Verifikasi B2B
        </button>
        <button
          onClick={handleNextOnboarding}
          className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );

  const renderB2BForm = () => (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep("onboarding_1")}
          className="p-1 -ml-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <h3 className="text-lg font-medium text-gray-900 tracking-tight">
          Form Verifikasi B2B
        </h3>
      </div>

      {b2bError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{b2bError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitB2b} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
            Nama Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={b2bData.namaPerusahaan}
            onChange={(e) =>
              setB2bData({ ...b2bData, namaPerusahaan: e.target.value })
            }
            placeholder="Contoh: PT Agro Jabar Maju"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
            NPWP Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={b2bData.npwpPerusahaan}
            onChange={(e) =>
              setB2bData({ ...b2bData, npwpPerusahaan: e.target.value })
            }
            placeholder="Masukkan Nomor NPWP"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
            NIB <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={13}
            value={b2bData.nibPerusahaan}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setB2bData({ ...b2bData, nibPerusahaan: val });
            }}
            placeholder="13 Digit NIB"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmittingB2b}
            className="w-full py-3 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm hover:bg-primary-700 active:scale-[0.99] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
          >
            {isSubmittingB2b ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Save size={16} /> Simpan Data Perusahaan
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleNextOnboarding}
            className="w-full mt-2 py-2.5 bg-transparent text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </form>
    </div>
  );

  const renderOnboarding2 = () => (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center pt-2 pb-4">
        <Image
          src="/images/maps.svg"
          alt="Maps"
          width={180}
          height={150}
          className="object-contain"
          priority
        />
      </div>
      <div className="bg-blue-50 text-blue-700 text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 mb-3 border border-blue-100/60">
        <MapPin size={13} /> Lokasi Anda
      </div>
      <h3 className="text-lg font-medium text-gray-900 text-center mb-2 tracking-tight">
        Temukan Toko Tani Terdekat
      </h3>
      <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed px-2">
        Isi alamat agar kami rekomendasikan produk segar terdekat dari lokasimu.
      </p>
      <div className="w-full space-y-2">
        <button
          onClick={() => {
            dismissOnboarding();
            router.push("/profil/alamat");
          }}
          className="w-full py-3 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm hover:bg-primary-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <MapPin size={16} />
          Isi Alamat Sekarang
        </button>
        <button
          onClick={handleSkipOnboarding}
          className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          Lewati
        </button>
      </div>
    </div>
  );

  const renderMandatoryAddressCity = () => (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-5 border border-primary-100/60 shadow-sm">
        <MapPin size={24} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2 text-center tracking-tight">
        Pilih Kota Domisili Anda
      </h3>
      <p className="text-xs text-gray-500 mb-8 text-center leading-relaxed px-1 font-normal">
        Silakan pilih kota tempat tinggal Anda untuk melihat layanan yang
        tersedia di area Anda.
      </p>

      <div className="w-full relative mb-7 text-left z-50">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between bg-gray-50/70 border ${
            isDropdownOpen
              ? "border-primary-500 bg-white ring-2 ring-primary-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-white"
          } text-gray-700 text-xs sm:text-sm font-normal rounded-xl px-4 py-3.5 focus:outline-none transition-all cursor-pointer`}
        >
          <span>{localCity || "Pilih Kota Tersedia"}</span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180 text-primary-600" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 z-50">
              <ul className="max-h-52 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-200">
                <li
                  onClick={() => {
                    setLocalCity("");
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs sm:text-sm rounded-lg cursor-pointer transition-colors ${
                    !localCity
                      ? "bg-primary-50/80 text-primary-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Pilih Kota Tersedia
                </li>
                {availableCities.map((cityObj) => (
                  <li
                    key={cityObj.name}
                    onClick={() => {
                      setLocalCity(cityObj.name);
                      setCity(cityObj.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3.5 py-2.5 text-xs sm:text-sm rounded-lg cursor-pointer transition-colors ${
                      localCity === cityObj.name
                        ? "bg-primary-50/80 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50 font-normal"
                    }`}
                  >
                    {cityObj.name}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => {
          if (localCity) {
            if (localCity !== selectedCity) setCity(localCity);
            router.push(
              `/profil/alamat/form?city=${encodeURIComponent(localCity)}&redirect=/`,
            );
          }
        }}
        disabled={!localCity}
        className="w-full py-3 bg-primary-600 text-white font-medium text-xs sm:text-sm rounded-xl hover:bg-primary-700 transition-all shadow-sm active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-1.5"
      >
        Lanjut Isi Alamat
        <ArrowRight size={16} />
      </button>
    </div>
  );

  const renderMandatoryAddressComplete = () => (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100/60">
        <CheckCircle2 size={24} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1.5 text-center tracking-tight">
        Lengkapi Alamat Anda
      </h3>
      <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed px-1">
        Anda telah memilih area{" "}
        <span className="font-medium text-gray-700">{selectedCity}</span>.
        Silakan lengkapi detail alamat pengiriman Anda.
      </p>

      <div className="w-full space-y-2">
        <button
          onClick={() => {
            if (localCity !== selectedCity && localCity) setCity(localCity);
            router.push(
              `/profil/alamat/form?city=${encodeURIComponent(
                selectedCity || localCity,
              )}&redirect=/`,
            );
          }}
          className="w-full py-3 bg-primary-600 text-white font-medium text-xs sm:text-sm rounded-xl hover:bg-primary-700 transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          Lanjut Isi Alamat
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => {
            setCity("");
            setLocalCity("");
            setStep("mandatory_address_city");
          }}
          className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          Ganti Area Pengiriman
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 touch-none overscroll-none select-none">
      <div className="relative bg-white w-full max-w-[330px] rounded-3xl py-8 px-6 sm:py-9 sm:px-6 shadow-xl border border-gray-100/80 animate-in fade-in zoom-in-95 duration-200 select-auto">
        {step === "onboarding_1" && renderOnboarding1()}
        {step === "onboarding_b2b_form" && renderB2BForm()}
        {step === "onboarding_2" && renderOnboarding2()}
        {step === "mandatory_address_city" && renderMandatoryAddressCity()}
        {step === "mandatory_address_complete" &&
          renderMandatoryAddressComplete()}
      </div>
    </div>
  );
}
