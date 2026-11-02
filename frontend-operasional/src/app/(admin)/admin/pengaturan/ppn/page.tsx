"use client";

import { useState, useEffect } from "react";
import {
  Percent,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Calculator,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { pajakApi } from "@/lib/ecommerce-api";

export default function PengaturanPajakPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Configuration States
  const [isAktif, setIsAktif] = useState(false);
  const [persenPPN, setPersenPPN] = useState(11.0);

  // Simulation States
  const [simulationAmount, setSimulationAmount] = useState(100000);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await pajakApi.getConfig();
      const config = res.data?.data;
      if (config) {
        setIsAktif(config.isAktif ?? false);
        setPersenPPN(config.persenPPN ?? 11.0);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal mengambil data konfigurasi PPN.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg("");
      setErrorMsg("");

      const payload = {
        isAktif,
        persenPPN: Number(persenPPN),
      };

      await pajakApi.updateConfig(payload);
      setSuccessMsg("Konfigurasi PPN berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal menyimpan konfigurasi PPN.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for simulation
  const simulatedTax = isAktif ? (simulationAmount * persenPPN) / 100 : 0;
  const simulatedTotal = simulationAmount + simulatedTax;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center gap-3 font-medium text-gray-500">
        <Loader2 size={32} className="animate-spin text-primary-600" />
        <span className="font-medium text-sm">Memuat konfigurasi PPN...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl font-medium text-gray-700">
      <div>
        <h1 className="text-xl text-gray-900 leading-tight font-medium">
          Pengaturan Pajak (PPN)
        </h1>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">
          Konfigurasi Pajak Pertambahan Nilai (PPN) untuk setiap transaksi
          pesanan retail & grosir.
        </p>
      </div>

      {successMsg && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center gap-3 text-primary-700 text-sm font-medium transition-all duration-300">
          <ShieldCheck size={20} className="text-primary-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm font-medium transition-all duration-300">
          <AlertTriangle size={20} className="text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 font-medium">
        {/* PPN Configuration Settings */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 font-medium">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 font-medium">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-200 font-medium">
              <Percent size={16} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-md text-gray-900 font-medium">
                Konfigurasi PPN
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Tentukan persentase pajak dan status keaktifan PPN.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
            {/* Status Aktif Toggle */}
            <div className="flex flex-col justify-center border border-gray-200 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-xs text-gray-500 mb-2 font-medium">
                Status Pajak Pertambahan Nilai
              </span>
              <button
                type="button"
                onClick={() => setIsAktif(!isAktif)}
                className="flex items-center gap-3 text-left focus:outline-none"
              >
                {isAktif ? (
                  <ToggleRight
                    size={44}
                    className="text-primary-600 cursor-pointer"
                  />
                ) : (
                  <ToggleLeft
                    size={44}
                    className="text-gray-300 cursor-pointer"
                  />
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 leading-tight">
                    {isAktif ? "PPN Aktif" : "PPN Dinonaktifkan"}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isAktif
                      ? "Pajak akan dikenakan pada setiap pesanan baru"
                      : "Tidak ada tambahan pajak pada pesanan"}
                  </p>
                </div>
              </button>
            </div>

            {/* Persentase PPN */}
            <div className="flex flex-col justify-center border border-gray-200 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <label className="block text-xs text-gray-500 mb-2 font-medium">
                Persentase PPN (%)
              </label>
              <div className="relative font-medium">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={persenPPN}
                  onChange={(e) => setPersenPPN(Number(e.target.value))}
                  className="w-full pr-12 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                  required
                  disabled={!isAktif}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 font-medium">
                  %
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Persentase pajak yang dibebankan (standar nasional 11%)
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Simulator Panel */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 font-medium">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 font-medium">
            <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 font-medium">
              <Calculator size={16} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-md text-gray-900 font-medium">
                Simulasi Perhitungan PPN
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Visualisasikan bagaimana PPN memengaruhi total belanja barang
                (ongkir tidak dikenakan pajak).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
            <div className="font-medium">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                Masukkan Nominal Belanja Barang (Rp)
              </label>
              <div className="relative font-medium">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl font-medium space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Harga Barang:</span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(simulationAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  PPN ({isAktif ? `${persenPPN}%` : "Nonaktif"}):
                </span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(simulatedTax)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="font-medium text-gray-900">Total Akhir:</span>
                <span className="font-medium text-primary-600">
                  {formatRupiah(simulatedTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 font-medium">
          <button
            type="button"
            onClick={fetchConfig}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-2 font-medium"
            disabled={submitting}
          >
            <RotateCcw size={16} />
            Batal
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-sm text-white hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 font-medium"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
