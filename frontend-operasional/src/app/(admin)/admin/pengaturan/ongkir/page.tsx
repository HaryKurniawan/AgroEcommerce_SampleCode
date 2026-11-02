"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { logisticsApi } from "@/lib/ecommerce-api";

export default function PengaturanOngkirPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Local Courier (Rafisu) configs
  const [ongkirFlat, setOngkirFlat] = useState(15000);
  const [gratisBawahKm, setGratisBawahKm] = useState(5);
  const [gratisAboveKg, setGratisAboveKg] = useState(300);
  const [jarakMaksKm, setJarakMaksKm] = useState(50);

  // Basic logistics parameters
  const [jarakDasarKm, setJarakDasarKm] = useState(5);
  const [hargaDasar, setHargaDasar] = useState(10000);
  const [hargaPerKmExtra, setHargaPerKmExtra] = useState(2000);
  const [beratDasarKg, setBeratDasarKg] = useState(5);
  const [hargaPerKgExtra, setHargaPerKgExtra] = useState(5000);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await logisticsApi.getConfig();
      const config = res.data?.data;
      if (config) {
        setOngkirFlat(config.ongkirFlat ?? 15000);
        setGratisBawahKm(config.gratisBawahKm ?? 5);
        setGratisAboveKg(config.gratisAboveKg ?? 300);
        setJarakMaksKm(config.jarakMaksKm ?? 50);

        setJarakDasarKm(config.jarakDasarKm ?? 5);
        setHargaDasar(config.hargaDasar ?? 10000);
        setHargaPerKmExtra(config.hargaPerKmExtra ?? 2000);
        setBeratDasarKg(config.beratDasarKg ?? 5);
        setHargaPerKgExtra(config.hargaPerKgExtra ?? 5000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal mengambil data konfigurasi pengiriman.");
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
        ongkirFlat: Number(ongkirFlat),
        gratisBawahKm: Number(gratisBawahKm),
        gratisAboveKg: Number(gratisAboveKg),
        jarakMaksKm: Number(jarakMaksKm),
        jarakDasarKm: Number(jarakDasarKm),
        hargaDasar: Number(hargaDasar),
        hargaPerKmExtra: Number(hargaPerKmExtra),
        beratDasarKg: Number(beratDasarKg),
        hargaPerKgExtra: Number(hargaPerKgExtra),
      };

      await logisticsApi.updateConfig(payload);
      setSuccessMsg("Konfigurasi pengiriman berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal menyimpan konfigurasi pengiriman.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center gap-3 font-medium text-gray-500">
        <Loader2 size={32} className="animate-spin text-primary-600" />
        <span className="font-medium text-sm">
          Memuat konfigurasi pengiriman...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl font-medium text-gray-700">
      <div>
        <h1 className="text-xl text-gray-900 leading-tight font-medium">
          Pengaturan Ongkos Kirim
        </h1>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">
          Konfigurasi opsi pengiriman kurir lokal Rafisu.
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
        {/* Kurir Lokal Rafisu */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 font-medium">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 font-medium">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-200 font-medium">
              <Truck size={16} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-md text-gray-900 font-medium">
                Kurir Lokal (Rafisu)
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Pengiriman flat & gratis dalam area kota aktif
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
            <div className="font-medium">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                Ongkos Kirim Flat (Rupiah)
              </label>
              <div className="relative font-medium">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={ongkirFlat}
                  onChange={(e) => setOngkirFlat(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Tarif datar jika jarak & berat di luar kategori gratis
              </p>
            </div>

            <div className="font-medium">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                Batas Jarak Gratis (Kilometer)
              </label>
              <div className="relative font-medium">
                <input
                  type="number"
                  step="0.1"
                  value={gratisBawahKm}
                  onChange={(e) => setGratisBawahKm(Number(e.target.value))}
                  className="w-full pr-12 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  km
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Gratis ongkir jika jarak dari toko kurang dari batas ini
              </p>
            </div>

            <div className="font-medium">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                Batas Berat B2B / Grosir (Kilogram)
              </label>
              <div className="relative font-medium">
                <input
                  type="number"
                  step="0.1"
                  value={gratisAboveKg}
                  onChange={(e) => setGratisAboveKg(Number(e.target.value))}
                  className="w-full pr-12 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  kg
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Gratis ongkir jika berat pesanan mencapai batas ini. Pesanan ini
                dianggap Grosir/B2B dan dikirim langsung dari Gudang (SBU).
              </p>
            </div>

            <div className="font-medium">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                Jarak Maximum Jangkauan (Kilometer)
              </label>
              <div className="relative font-medium">
                <input
                  type="number"
                  step="0.1"
                  value={jarakMaksKm}
                  onChange={(e) => setJarakMaksKm(Number(e.target.value))}
                  className="w-full pr-12 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  km
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Batas terjauh yang dapat dilayani oleh kurir lokal
              </p>
            </div>
          </div>
        </div>

        {/* Konfigurasi Dasar Logistik */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 font-medium">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 font-medium">
            <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 font-medium">
              <MapPin size={16} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-md text-gray-900 font-medium">
                Konfigurasi Logistik Dasar (Fallbacks)
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Skema default penghitungan jarak dan berat fallback sistem
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-medium">
            <div className="font-medium col-span-2 md:col-span-1">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">
                Jarak Dasar (Km)
              </label>
              <input
                type="number"
                step="0.1"
                value={jarakDasarKm}
                onChange={(e) => setJarakDasarKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                required
              />
            </div>
            <div className="font-medium">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">
                Harga Dasar (Rp)
              </label>
              <input
                type="number"
                value={hargaDasar}
                onChange={(e) => setHargaDasar(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                required
              />
            </div>
            <div className="font-medium">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">
                Harga Km Extra (Rp)
              </label>
              <input
                type="number"
                value={hargaPerKmExtra}
                onChange={(e) => setHargaPerKmExtra(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                required
              />
            </div>
            <div className="font-medium">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">
                Berat Dasar (Kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={beratDasarKg}
                onChange={(e) => setBeratDasarKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                required
              />
            </div>
            <div className="font-medium">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">
                Harga Kg Extra (Rp)
              </label>
              <input
                type="number"
                value={hargaPerKgExtra}
                onChange={(e) => setHargaPerKgExtra(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-medium bg-white"
                required
              />
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
            Reset Data
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
