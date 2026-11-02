"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface PackagingSpec {
  ukuranKg: number;
  jumlahBungkus: number;
}

interface BulkOrderStep2PackagingProps {
  jumlah: number;
  packagingSpecs: PackagingSpec[];
  onPackagingSpecsChange: (specs: PackagingSpec[]) => void;
  satuan?: string;
}

export const BulkOrderStep2Packaging: React.FC<
  BulkOrderStep2PackagingProps
> = ({ jumlah, packagingSpecs, onPackagingSpecsChange, satuan = "kg" }) => {
  const [isCustom, setIsCustom] = useState<boolean>(packagingSpecs.length > 0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputKg, setInputKg] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");

  const handleModeChange = (custom: boolean) => {
    setIsCustom(custom);
    if (!custom && packagingSpecs.length > 0) {
      onPackagingSpecsChange([]);
    }
  };

  const totalPacked = packagingSpecs.reduce(
    (sum, s) => sum + s.ukuranKg * s.jumlahBungkus,
    0,
  );
  const remaining = jumlah - totalPacked;
  const isExact = totalPacked === jumlah;
  const isOver = totalPacked > jumlah;

  const handleAddSize = () => {
    const size = parseFloat(inputKg);
    setInputError("");
    if (isNaN(size) || size <= 0) {
      setInputError("Masukkan ukuran kemasan yang valid.");
      return;
    }
    if (size < 1 || size > 10) {
      setInputError("Ukuran kemasan harus antara 1–10 kg.");
      return;
    }
    if (packagingSpecs.some((s) => s.ukuranKg === size)) {
      setInputError("Ukuran ini sudah ditambahkan.");
      return;
    }
    if (packagingSpecs.length >= 3) {
      setInputError("Maksimal 3 jenis kemasan.");
      return;
    }
    const maxBungkus = Math.max(1, Math.floor(jumlah / size));
    onPackagingSpecsChange([
      ...packagingSpecs,
      { ukuranKg: size, jumlahBungkus: maxBungkus },
    ]);
    setInputKg("");
    setIsModalOpen(false);
  };

  const handleRemoveSize = (size: number) => {
    onPackagingSpecsChange(packagingSpecs.filter((s) => s.ukuranKg !== size));
  };

  const handleSetBungkus = (size: number, delta: number) => {
    onPackagingSpecsChange(
      packagingSpecs.map((s) =>
        s.ukuranKg === size
          ? { ...s, jumlahBungkus: Math.max(1, s.jumlahBungkus + delta) }
          : s,
      ),
    );
  };

  const handleInputBungkus = (size: number, val: string) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 0) return;
    onPackagingSpecsChange(
      packagingSpecs.map((s) =>
        s.ukuranKg === size ? { ...s, jumlahBungkus: Math.max(1, n) } : s,
      ),
    );
  };

  const handleBagiRata = () => {
    if (packagingSpecs.length === 0) return;

    // Step 1: Distribusi merata pakai floor agar tidak overshoot
    const perSpec = jumlah / packagingSpecs.length;
    let updated = packagingSpecs.map((s) => ({
      ...s,
      jumlahBungkus: Math.max(1, Math.floor(perSpec / s.ukuranKg)),
    }));

    // Step 2: Hitung sisa setelah distribusi
    const totalSetelah = updated.reduce(
      (sum, s) => sum + s.ukuranKg * s.jumlahBungkus,
      0,
    );
    const sisa = jumlah - totalSetelah;

    if (sisa > 0) {
      // Step 3: Cari spec yang bisa menyerap sisa secara tepat (sisa % ukuran === 0)
      const sorted = [...updated].sort((a, b) => a.ukuranKg - b.ukuranKg);
      const exactFit = sorted.find((s) => sisa % s.ukuranKg === 0);
      const targetSpec = exactFit ?? sorted[0]; // fallback ke ukuran terkecil

      const tambahBungkus = exactFit
        ? sisa / targetSpec.ukuranKg
        : Math.ceil(sisa / targetSpec.ukuranKg);

      updated = updated.map((s) =>
        s.ukuranKg === targetSpec.ukuranKg
          ? { ...s, jumlahBungkus: s.jumlahBungkus + tambahBungkus }
          : s,
      );
    }

    onPackagingSpecsChange(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-5">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <Package size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight">
              Pilih Kemasan
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Total {jumlah.toLocaleString()} {satuan} perlu dikemas · maks. 3
              jenis
            </p>
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 mb-5">
          {(["Default", "Custom"] as const).map((label) => {
            const active = label === "Custom" ? isCustom : !isCustom;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleModeChange(label === "Custom")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  active
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Default Mode ── */}
        {!isCustom && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center shrink-0">
                <Package size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Standar Pengiriman
                </p>
                <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                  Kemasan 10 {satuan}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-700 leading-none">
                {Math.ceil(jumlah / 10)}
                <span className="text-sm font-semibold text-emerald-500 ml-1">
                  pcs
                </span>
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">
                Estimasi sistem
              </p>
            </div>
          </div>
        )}

        {/* ── Custom Mode ── */}
        {isCustom && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            {/* Empty state */}
            {packagingSpecs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <Package size={36} className="mb-3" />
                <p className="text-sm font-medium text-gray-400">
                  Belum ada kemasan ditambahkan
                </p>
              </div>
            )}

            {packagingSpecs.length > 0 && (
              <>
                {/* Status banner — di atas label */}
                <div
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
                    isExact
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : isOver
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {isExact ? (
                    <CheckCircle2 size={13} className="shrink-0" />
                  ) : (
                    <AlertCircle size={13} className="shrink-0" />
                  )}
                  <span>
                    {isExact
                      ? `Sempurna! Semua ${jumlah.toLocaleString()} ${satuan} terpenuhi.`
                      : isOver
                        ? `Kemasan melebihi pesanan (${(totalPacked - jumlah).toLocaleString()} ${satuan} berlebih).`
                        : `Masih ${remaining.toLocaleString()} ${satuan} belum terkemas.`}
                  </span>
                </div>

                {/* List header */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Daftar Kemasan
                  </p>
                  {packagingSpecs.length > 1 && (
                    <button
                      type="button"
                      onClick={handleBagiRata}
                      className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors active:scale-95 shadow-sm"
                    >
                      Bagi Rata
                    </button>
                  )}
                </div>

                {/* Packaging Cards */}
                <div className="space-y-2">
                  {packagingSpecs
                    .slice()
                    .sort((a, b) => a.ukuranKg - b.ukuranKg)
                    .map((spec) => {
                      const subtotalKg = spec.ukuranKg * spec.jumlahBungkus;
                      return (
                        <div
                          key={spec.ukuranKg}
                          className="relative group bg-emerald-50 border border-emerald-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                          {/* Card Body: Icon + Label + Stepper */}
                          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                            {/* Left: Icon + Label */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center shrink-0">
                                <Package
                                  size={16}
                                  className="text-emerald-500"
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                  Ukuran Kemasan
                                </p>
                                <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                                  {spec.ukuranKg} {satuan} / bungkus
                                </p>
                              </div>
                            </div>

                            {/* Right: Stepper */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetBungkus(spec.ukuranKg, -1)
                                }
                                disabled={spec.jumlahBungkus <= 1}
                                className="w-7 h-7 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 transition-all active:scale-95"
                              >
                                <Minus size={13} />
                              </button>

                              <div className="text-center w-10">
                                <input
                                  type="number"
                                  min="1"
                                  value={spec.jumlahBungkus}
                                  onChange={(e) =>
                                    handleInputBungkus(
                                      spec.ukuranKg,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full h-7 text-center text-base font-bold text-emerald-700 bg-transparent focus:outline-none"
                                />
                                <p className="text-[9px] text-emerald-500 -mt-1 font-medium">
                                  pcs
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSetBungkus(spec.ukuranKg, 1)
                                }
                                className="w-7 h-7 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Card Footer: garis + Total */}
                          <div className="border-t border-emerald-100 px-4 py-2 flex items-center justify-between">
                            <p className="text-[10px] text-emerald-500 font-medium">
                              Subtotal berat
                            </p>
                            <p className="text-sm font-bold text-emerald-800">
                              {subtotalKg.toLocaleString()}
                              <span className="text-[10px] font-semibold text-emerald-500 ml-1">
                                {satuan}
                              </span>
                            </p>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(spec.ukuranKg)}
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            {/* Add button */}
            {packagingSpecs.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setInputKg("");
                  setInputError("");
                  setIsModalOpen(true);
                }}
                className="w-full h-11 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 text-sm font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95"
              >
                <Plus size={15} />
                Tambah Kemasan
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Tambah Kemasan ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 text-lg">
                Tambah Kemasan
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Input */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Ukuran Kemasan (1–10 kg)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="Contoh: 5"
                  value={inputKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Hanya izinkan kosong, angka 1-9, atau pas 10
                    if (!/^(10|[1-9])?$/.test(val)) return;
                    setInputKg(val);
                    setInputError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSize();
                  }}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 pr-10 text-lg font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                  kg
                </span>
              </div>
              {inputError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5 font-medium">
                  <AlertCircle size={12} />
                  {inputError}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSize}
                className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
