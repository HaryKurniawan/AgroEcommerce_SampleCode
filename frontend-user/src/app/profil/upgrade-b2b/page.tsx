"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "@/src/store/auth-store";
import { useProfile, useSyncProfile } from "@/hooks";
import { apiClient } from "@/src/lib/api-client";

export default function UpgradeB2bPage() {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const {
    profile,
    loading: profileLoading,
    refetch,
  } = useProfile(isAuthenticated, _hasHydrated);
  useSyncProfile();

  const [formData, setFormData] = useState({
    namaPerusahaan: "",
    npwpPerusahaan: "",
    nibPerusahaan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nibPerusahaan.length !== 13) {
      toast.error("NIB harus 13 digit");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch("/pengguna/profile/upgrade-b2b", formData);
      await refetch();
      toast.success("Pengajuan berhasil dikirim! Menunggu verifikasi admin.");
      router.push("/profil");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengirim pengajuan B2B",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!_hasHydrated || profileLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  }

  const p = profile as any;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="font-display font-semibold text-[17px] text-gray-900">
            Akun Perusahaan (B2B)
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {p?.statusVerifikasiPerusahaan === "PENDING" ||
        p?.statusVerifikasiPerusahaan === "DISETUJUI" ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Pengajuan{" "}
              {p.statusVerifikasiPerusahaan === "PENDING"
                ? "Sedang Diproses"
                : "Telah Disetujui"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {p.statusVerifikasiPerusahaan === "PENDING"
                ? "Admin kami sedang memverifikasi data perusahaan Anda. Anda akan segera mendapatkan akses ke harga grosir setelah disetujui."
                : "Akun Anda telah terverifikasi sebagai perusahaan. Anda kini dapat menikmati fitur pembelian grosir."}
            </p>
            <div className="text-left bg-gray-50 p-4 rounded-xl text-sm">
              <p>
                <strong>Nama Perusahaan:</strong> {p.namaPerusahaan}
              </p>
              <p>
                <strong>NPWP:</strong> {p.npwpPerusahaan}
              </p>
              <p>
                <strong>NIB:</strong> {p.nibPerusahaan}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-base">
                    Daftar Pembeli B2B
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Dapatkan akses ke harga grosir, kemasan khusus, dan
                    penawaran menarik lainnya dengan mendaftarkan perusahaan
                    Anda.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaPerusahaan"
                  value={formData.namaPerusahaan}
                  onChange={handleChange}
                  placeholder="Contoh: PT Agro Jabar Maju"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NPWP Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npwpPerusahaan"
                  value={formData.npwpPerusahaan}
                  onChange={handleChange}
                  placeholder="Masukkan Nomor NPWP"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Induk Berusaha (NIB){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nibPerusahaan"
                  value={formData.nibPerusahaan}
                  onChange={handleChange}
                  placeholder="13 Digit NIB"
                  maxLength={13}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  NIB wajib berisi 13 digit angka
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Save size={18} />
                      Ajukan Verifikasi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
