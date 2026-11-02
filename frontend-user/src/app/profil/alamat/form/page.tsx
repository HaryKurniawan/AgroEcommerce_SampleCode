"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  AlertCircle,
  Home,
  Briefcase,
  Warehouse,
  MoreHorizontal,
  CheckCircle2,
  User,
  Phone,
} from "lucide-react";

import { useAlamatForm } from "@/src/hooks/alamat/useAlamatForm";
import ActionModal from "@/src/components/ActionModal";

// Dynamic import for SSR safety
const MapPicker = dynamic(() => import("@/src/components/ui/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl h-64 bg-gray-100 animate-pulse flex items-center justify-center">
      <Loader2 size={24} className="text-gray-300 animate-spin" />
    </div>
  ),
});

const LABEL_OPTIONS = ["Rumah", "Kantor", "Gudang", "Lainnya"];

const getLabelIcon = (label: string) => {
  switch (label) {
    case "Rumah":
      return <Home size={14} />;
    case "Kantor":
      return <Briefcase size={14} />;
    case "Gudang":
      return <Warehouse size={14} />;
    default:
      return <MoreHorizontal size={14} />;
  }
};

function AlamatFormPageContent() {
  const {
    router,
    editId,
    loading,
    actionLoading,
    error,
    addressesLength,
    formData,
    handleSubmit,
    handleMapChange,
    mapValue,
    register,
    errors,
    setValue,
    cityWarning,
    clearCityWarning,
    defaultCity,
    successOpen,
    setSuccessOpen,
    successUrl,
  } = useAlamatForm();

  // Removed Modal.warning useEffect as we are using ActionModal now
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-sm text-gray-400">Memuat data...</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-white pb-28 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 lg:top-16 z-40">
        <div className="relative flex items-center justify-center max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-display font-semibold text-[17px] text-gray-900 py-1">
            {editId ? "Edit Alamat" : "Tambah Alamat"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mb-6 animate-in slide-in-from-top-4 duration-300">
            <AlertCircle size={20} />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white space-y-7">
          <div>
            <div className="text-[15px] font-semibold text-gray-800 mb-5 flex items-center gap-2 ml-1">
              <MapPin size={18} className="text-primary-500" />
              Titik Pengiriman di Peta
            </div>
            <Suspense
              fallback={
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              }
            >
              <MapPicker
                value={mapValue}
                onChange={handleMapChange}
                height="280px"
                placeholder="Cari alamat atau kecamatan..."
                defaultCity={defaultCity}
              />
            </Suspense>
          </div>

          <div className="h-px bg-gray-50 w-full" />

          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3 block ml-1">
              Label Alamat
            </div>
            <div className="flex gap-2 flex-wrap">
              {LABEL_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setValue("label", l)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    formData.label === l
                      ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100"
                      : "bg-white text-gray-500 border-gray-200 hover:border-primary-200"
                  }`}
                >
                  {getLabelIcon(l)}
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Penerima & Telepon */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label
                htmlFor="penerima"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1 flex items-center gap-2"
              >
                <User size={16} className="text-gray-400" />
                Nama Penerima *
              </label>
              <input
                id="penerima"
                type="text"
                {...register("penerima")}
                placeholder="Contoh: Budi Santoso"
                className={`w-full border ${errors.penerima ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
              {errors.penerima && (
                <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                  {errors.penerima.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="telepon"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1 flex items-center gap-2"
              >
                <Phone size={16} className="text-gray-400" />
                No. HP / WA *
              </label>
              <input
                id="telepon"
                type="text"
                {...register("telepon")}
                onKeyDown={blockNonNumbers}
                placeholder="08xxxxxxxxxx"
                className={`w-full border ${errors.telepon ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
              {errors.telepon && (
                <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                  {errors.telepon.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="provinsi"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
              >
                Provinsi
              </label>
              <input
                id="provinsi"
                type="text"
                {...register("provinsi")}
                onKeyDown={blockNumbers}
                placeholder="Provinsi..."
                className={`w-full border ${errors.provinsi ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
              {errors.provinsi && (
                <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                  {errors.provinsi.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="kota"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
              >
                Kota/Kabupaten *
              </label>
              <input
                id="kota"
                type="text"
                {...register("kota")}
                onKeyDown={blockNumbers}
                placeholder="Kota/Kabupaten..."
                className={`w-full border ${errors.kota ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
              {errors.kota && (
                <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                  {errors.kota.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="kecamatan"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
              >
                Kecamatan
              </label>
              <input
                id="kecamatan"
                type="text"
                {...register("kecamatan")}
                onKeyDown={blockNumbers}
                placeholder="Kecamatan..."
                className={`w-full border ${errors.kecamatan ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
            </div>
            <div>
              <label
                htmlFor="kelurahan"
                className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
              >
                Kelurahan/Desa
              </label>
              <input
                id="kelurahan"
                type="text"
                {...register("kelurahan")}
                onKeyDown={blockNumbers}
                placeholder="Kelurahan..."
                className={`w-full border ${errors.kelurahan ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
              />
            </div>
          </div>

          <div className="w-1/2 pr-2.5">
            <label
              htmlFor="kodePos"
              className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
            >
              Kode Pos
            </label>
            <input
              id="kodePos"
              type="text"
              {...register("kodePos")}
              onKeyDown={blockNonNumbers}
              placeholder="Kode Pos..."
              maxLength={5}
              className={`w-full border ${errors.kodePos ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all`}
            />
            {errors.kodePos && (
              <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                {errors.kodePos.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="alamat"
              className="text-sm font-semibold text-gray-700 mb-2 block ml-1"
            >
              Detail Alamat (RT/RW, Patokan, dll) *
            </label>
            <textarea
              id="alamat"
              {...register("alamat")}
              placeholder="Contoh: Jl. Sudirman No. 12, RT 01/RW 02, pagar hitam"
              rows={3}
              className={`w-full border ${errors.alamat ? "border-red-300 ring-red-50" : "border-gray-200 focus:ring-primary-300"} rounded-2xl px-4 py-3.5 text-sm outline-none transition-all resize-none`}
            />
            {errors.alamat && (
              <p className="mt-1.5 text-[10px] text-red-500 italic font-medium ml-1">
                {errors.alamat.message}
              </p>
            )}
          </div>

          {/* Is Default */}
          <label
            htmlFor="isDefault"
            className={`flex items-center gap-4 p-4 border rounded-3xl transition-all cursor-pointer ${
              addressesLength === 0 && !editId
                ? "bg-gray-50 border-gray-100 opacity-80"
                : formData.isDefault
                  ? "bg-primary-50 border-primary-100 ring-1 ring-primary-100"
                  : "bg-white border-gray-100 hover:bg-gray-50"
            }`}
          >
            <input
              id="isDefault"
              type="checkbox"
              {...register("isDefault")}
              disabled={addressesLength === 0 && !editId}
              className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 focus:ring-primary-500 disabled:opacity-50 transition-all"
            />
            <div className="flex-1">
              <p
                className={`text-xs font-bold ${formData.isDefault ? "text-primary-700" : "text-gray-700"}`}
              >
                Jadikan alamat utama
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {addressesLength === 0 && !editId
                  ? "Alamat pertama otomatis menjadi alamat utama"
                  : "Alamat ini akan dipilih otomatis saat checkout"}
              </p>
            </div>
          </label>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-50 mt-8">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary-100 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {actionLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <CheckCircle2 size={20} />
              )}
              {editId ? "Simpan Perubahan" : "Simpan Alamat"}
            </button>
          </div>
        </form>
      </div>

      <ActionModal
        isOpen={!!cityWarning}
        onClose={clearCityWarning}
        title="Area Belum Tersedia"
        description={cityWarning}
        icon={<MapPin size={28} className="text-orange-500" />}
        primaryButton={{
          label: "Mengerti",
          onClick: clearCityWarning,
        }}
      />

      {/* Custom Success Modal (Manual HTML/CSS) untuk mobile safety */}
      {successOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setSuccessOpen(false);
              router.push(successUrl);
            }}
          />

          {/* Modal Content Card */}
          <div className="relative bg-white w-full max-w-[340px] rounded-[2rem] p-6 text-center shadow-2xl border border-gray-100 flex flex-col items-center justify-center transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2
                size={32}
                className="text-primary-600 animate-bounce"
              />
            </div>

            <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 leading-tight">
              Alamat Berhasil Disimpan
            </h3>

            <p className="text-gray-500 mb-6 text-[13px] px-2 leading-relaxed font-normal">
              Data alamat Anda telah berhasil disimpan.
            </p>

            <button
              onClick={() => {
                setSuccessOpen(false);
                router.push(successUrl);
              }}
              className="w-full bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white rounded-2xl font-semibold py-3.5 text-[13px] transition-colors shadow-none"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlamatFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      }
    >
      <AlamatFormPageContent />
    </Suspense>
  );
}
