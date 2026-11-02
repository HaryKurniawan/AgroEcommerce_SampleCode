"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useProductDetail } from "@/src/hooks/produk/useProductDetail";
import { useBulkOrder } from "@/src/hooks/produk/useBulkOrder";
import { useAuthStore } from "@/src/store/auth-store";
import { addressesApi } from "@/lib/ecommerce-api";
import { apiClient } from "@/src/lib/api-client";
import {
  formatAddressDetails,
  getSelectedAddress,
} from "@/src/lib/address-utils";
import { ProductDetailSkeleton } from "@/src/components/ecommerce/Skeleton";
import {
  BulkOrderStep1Quantity,
  BulkOrderStep2Packaging,
  BulkOrderStep2Details,
  BulkOrderStep3Address,
  BulkOrderProgressIndicator,
  BulkOrderSummary,
} from "@/src/components/bulk-order";
import { PaymentMethodSection } from "@/src/components/checkout";
import type { ApiAddressData } from "@/types";

export default function BeliGrosirPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const {
    product,
    loading: productLoading,
    isOutOfArea,
  } = useProductDetail(id, isAuthenticated);
  const { handleBulkOrderSubmit, bulkOrderLoading, isSuccess } =
    useBulkOrder(product);

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<
    unknown,
    Error,
    ApiAddressData[]
  >({
    queryKey: ["addresses", "list"],
    queryFn: () => addressesApi.getAll(),
    select: (res: any): ApiAddressData[] => {
      const rawBody = res?.data;
      return Array.isArray(rawBody?.data)
        ? rawBody.data
        : Array.isArray(rawBody)
          ? rawBody
          : [];
    },
    enabled: isAuthenticated && _hasHydrated,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch config grosir dari toko
  const { data: grosirConfig } = useQuery<{
    diskonGrosirPersen: number;
    ongkosKirimGrosir: number;
  }>({
    queryKey: ["toko", "harga", "config", "grosir-config", product?.tokoId],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/toko/harga/config`);
        return {
          diskonGrosirPersen: res.data?.data?.diskonGrosirPersen ?? 0,
          ongkosKirimGrosir: res.data?.data?.ongkosKirimGrosir ?? 0,
        };
      } catch {
        return { diskonGrosirPersen: 0, ongkosKirimGrosir: 0 };
      }
    },
    enabled: isAuthenticated && _hasHydrated && !!product?.tokoId,
    staleTime: 5 * 60 * 1000,
  });

  const diskonGrosirPersen = grosirConfig?.diskonGrosirPersen || 0;
  const ongkosKirimGrosir = grosirConfig?.ongkosKirimGrosir || 0;

  // State management
  const [jumlah, setJumlah] = useState<number>(300);
  const [catatan, setCatatan] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useManual, setUseManual] = useState(false);
  const [manualAlamat, setManualAlamat] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [packagingSpecs, setPackagingSpecs] = useState<
    Array<{ ukuranKg: number; jumlahBungkus: number }>
  >([]);
  const [metodeBayar, setMetodeBayar] = useState<string>("TRANSFER");
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const [tanggalPengiriman, setTanggalPengiriman] = useState<string>(
    defaultDate.toISOString().split("T")[0],
  );

  const STORAGE_KEY = `bulk-order-${id}`;

  // Read state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.jumlah) setJumlah(parsed.jumlah);
          if (parsed.catatan !== undefined) setCatatan(parsed.catatan);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.packagingSpecs) setPackagingSpecs(parsed.packagingSpecs);
          if (parsed.metodeBayar) setMetodeBayar(parsed.metodeBayar);
          if (parsed.tanggalPengiriman)
            setTanggalPengiriman(parsed.tanggalPengiriman);
        }
      } catch (e) {
        // ignore
      }

      // Override metode bayar jika ada dari URL (kembali dari pilih pembayaran)
      const paymentParam = searchParams.get("paymentMethod");
      if (paymentParam) {
        setMetodeBayar(paymentParam);
        // Clear param to keep URL clean, using replaceState to avoid reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }

      setIsStateLoaded(true);
    }
  }, [id, searchParams]);

  // Save state to localStorage on change
  useEffect(() => {
    if (isStateLoaded && typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          jumlah,
          catatan,
          currentStep,
          packagingSpecs,
          metodeBayar,
          tanggalPengiriman,
        }),
      );
    }
  }, [
    jumlah,
    catatan,
    currentStep,
    packagingSpecs,
    metodeBayar,
    tanggalPengiriman,
    id,
    isStateLoaded,
  ]);

  // Clear state on success
  useEffect(() => {
    if (isSuccess && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isSuccess, id]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      const defaultId = String(defaultAddr?.id ?? addresses[0].id);
      // Use a callback to avoid setState in effect
      const timer = setTimeout(() => {
        setSelectedAddressId(defaultId);
        setUseManual(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [addresses.length]);

  // Loading states
  if (!_hasHydrated || productLoading) return <ProductDetailSkeleton />;
  if (!isAuthenticated) {
    router.push(`/auth/login?redirect=/produk/${id}/beli-grosir`);
    return null;
  }

  // Out of area guard
  if (isOutOfArea) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="font-display font-bold text-xl text-gray-900 mb-2">
            Lokasi di Luar Jangkauan
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Maaf, pengajuan grosir hanya tersedia untuk area tertentu. Silakan
            hubungi penjual untuk informasi lebih lanjut.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-2xl hover:bg-primary-700 transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Form validation
  const minGrosir = Math.max(100, (product?.stok || 0) + 1);

  const isFormValid =
    jumlah >= minGrosir &&
    (useManual ? manualAlamat.trim().length > 0 : selectedAddressId !== "") &&
    metodeBayar !== "";

  const isStepValid =
    currentStep === 1
      ? jumlah >= minGrosir
      : currentStep === 2
        ? true // packaging is optional
        : isFormValid;

  // Handle submit
  const handleSubmit = async () => {
    let finalAlamat = "";
    if (useManual) {
      finalAlamat = manualAlamat;
    } else {
      const addr = getSelectedAddress(addresses, selectedAddressId);
      if (addr) {
        finalAlamat = formatAddressDetails(addr);
      }
    }
    await handleBulkOrderSubmit({
      jumlah,
      alamatKirim: finalAlamat,
      catatan,
      metodeBayar,
      packagingSpecs: packagingSpecs.length > 0 ? packagingSpecs : undefined,
      diskonGrosirPersen:
        diskonGrosirPersen > 0 ? diskonGrosirPersen : undefined,
      tanggalPermintaanKirim: new Date(tanggalPengiriman).toISOString(),
    });
  };

  // Step labels
  const STEPS = ["Jumlah Pesanan", "Pilih Kemasan", "Rincian & Pengiriman"];

  return (
    <div className="min-h-screen bg-gray-50/80 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
        {/* Progress Indicator */}
        <BulkOrderProgressIndicator currentStep={currentStep} steps={STEPS} />

        <div
          className={
            currentStep === 3
              ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
              : "max-w-2xl mx-auto"
          }
        >
          {/* Left: Form Steps */}
          <div
            className={
              currentStep === 3 ? "lg:col-span-2 space-y-5" : "space-y-5"
            }
          >
            {/* Step 1: Quantity */}
            {currentStep === 1 && (
              <BulkOrderStep1Quantity
                product={product}
                jumlah={jumlah}
                onJumlahChange={setJumlah}
                tanggalPengiriman={tanggalPengiriman}
                onTanggalPengirimanChange={setTanggalPengiriman}
              />
            )}

            {/* Step 2: Packaging */}
            {currentStep === 2 && (
              <BulkOrderStep2Packaging
                jumlah={jumlah}
                packagingSpecs={packagingSpecs}
                onPackagingSpecsChange={setPackagingSpecs}
                satuan={product?.satuan}
              />
            )}

            {/* Step 3: Details & Address */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <BulkOrderStep3Address
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  useManual={useManual}
                  manualAlamat={manualAlamat}
                  addressesLoading={addressesLoading}
                  onAddressSelect={setSelectedAddressId}
                  onManualAddressToggle={setUseManual}
                  onManualAlamatChange={setManualAlamat}
                  onNavigateToForm={() => router.push("/profil/alamat")}
                />
                <BulkOrderStep2Details
                  catatan={catatan}
                  onCatatanChange={setCatatan}
                />
                <PaymentMethodSection
                  selectedMethod={metodeBayar}
                  onSelect={setMetodeBayar}
                />
              </div>
            )}
          </div>

          {/* Right: Summary */}
          {currentStep === 3 && (
            <div className="lg:col-span-1">
              <BulkOrderSummary
                product={product}
                jumlah={jumlah}
                packagingSpecs={packagingSpecs}
                diskonGrosirPersen={diskonGrosirPersen}
                ongkosKirimGrosir={ongkosKirimGrosir}
                currentStep={currentStep}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() =>
              currentStep > 1
                ? setCurrentStep((prev) => prev - 1)
                : router.push(`/produk/${id}/grosir`)
            }
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
          >
            Kembali
          </button>

          <button
            onClick={() =>
              currentStep < 3
                ? setCurrentStep((prev) => prev + 1)
                : handleSubmit()
            }
            disabled={!isStepValid || bulkOrderLoading}
            className="flex-1 max-w-xs px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {bulkOrderLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : currentStep < 3 ? (
              "Lanjut"
            ) : (
              "Ajukan Sekarang"
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative p-8 text-center border border-gray-100">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-white" />
              </div>
            </div>

            <h2 className="font-display font-semibold text-xl text-gray-900 mb-3 tracking-tight">
              Pengajuan Berhasil!
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Pengajuan sudah kami terima! Tunggu konfirmasi dari penjual, ya —
              setelah disetujui kamu bisa langsung lanjut ke pembayaran.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.replace("/pesanan")}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm transition-all"
              >
                Lihat Status Pengajuan
              </button>
              <button
                onClick={() => router.replace("/")}
                className="w-full py-3.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl font-semibold text-sm transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
