import { ClipboardList, Loader2 } from "lucide-react";

import { FormItem, ProductData, RETAIL_KG, MEDIUM_KG } from "./types";

interface SummarySidebarProps {
  items: FormItem[];
  availableProducts: ProductData[];
  totalKgAll: number;
  totalHargaAll: number;
  hasValid: boolean;
  tipePengiriman: "DEFAULT" | "CUSTOM";
  setTipePengiriman: (val: "DEFAULT" | "CUSTOM") => void;
  tanggalPermintaanKirim: string;
  setTanggalPermintaanKirim: (val: string) => void;
  catatan: string;
  setCatatan: (val: string) => void;
  submitting: boolean;
}

export function SummarySidebar({
  items,
  availableProducts,
  totalKgAll,
  totalHargaAll,
  hasValid,
  tipePengiriman,
  setTipePengiriman,
  tanggalPermintaanKirim,
  setTanggalPermintaanKirim,
  catatan,
  setCatatan,
  submitting,
}: SummarySidebarProps) {
  const totalKgOf = (it: FormItem) =>
    Math.round((it.packRetail * RETAIL_KG + it.packMedium * MEDIUM_KG) * 10) /
    10;

  return (
    <div className="hidden lg:flex flex-col bg-white h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 w-80 border-l border-gray-100 opacity-100">
      <div className="w-80 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary-600" />
            Ringkasan Pengajuan
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5">
          {/* Grand Total */}
          {hasValid ? (
            <div
              className={`flex flex-col rounded-xl px-4 py-3 ${totalKgAll >= 300 ? "bg-primary-700 text-white" : "bg-rose-600 text-white"}`}
            >
              <p
                className={`text-[9.5px] uppercase tracking-wider mb-1 ${totalKgAll >= 300 ? "text-primary-200/60" : "text-rose-200/60"}`}
              >
                Total Pengajuan
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2">
                  {totalKgAll.toLocaleString("id-ID")} kg
                </p>
                {totalKgAll < 300 && (
                  <span className="text-[9px] bg-rose-500 border border-rose-400 px-1.5 py-0.5 rounded-md text-white font-bold tracking-wide">
                    Min. 300 kg
                  </span>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="font-bold text-lg">
                  Rp {totalHargaAll.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-center text-slate-400 text-xs font-medium">
              Belum ada produk valid
            </div>
          )}

          {/* Product Summary List */}
          {hasValid && (
            <div className="space-y-3 pb-3 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-900">
                Detail Produk
              </h4>
              <div className="space-y-2">
                {items
                  .filter((it) => totalKgOf(it) > 0)
                  .map((item, idx) => {
                    const prod = availableProducts.find(
                      (p) => p.id === item.produkGudangId,
                    );
                    if (!prod) return null;
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-start text-xs"
                      >
                        <span className="text-gray-600 pr-2 line-clamp-2">
                          {prod.nama}
                          {prod.varianProduk && ` ${prod.varianProduk}`}
                        </span>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          {totalKgOf(item).toLocaleString("id-ID")} kg
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Pengiriman */}
          <div className="space-y-3">
            <label className="block text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
              Pilihan Pengiriman
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipePengiriman("DEFAULT")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex flex-col items-center justify-center transition-all ${
                  tipePengiriman === "DEFAULT"
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="block font-bold">Standard</span>
                <span className="text-[9px] opacity-80 font-normal">
                  1-2 Hari
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTipePengiriman("CUSTOM")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex flex-col items-center justify-center transition-all ${
                  tipePengiriman === "CUSTOM"
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="block font-bold">Terjadwal</span>
                <span className="text-[9px] opacity-80 font-normal">
                  Pilih Tanggal
                </span>
              </button>
            </div>

            {tipePengiriman === "CUSTOM" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10.5px] font-medium text-slate-500 mb-1">
                  Tanggal Pengiriman (Min H+2)
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPermintaanKirim}
                  min={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    return d.toISOString().split("T")[0];
                  })()}
                  onChange={(e) => setTanggalPermintaanKirim(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all text-slate-700"
                />
              </div>
            )}
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
              Catatan (Opsional)
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kirim via ekspedisi pickup..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:bg-white text-xs transition-all"
            />
          </div>
        </div>

        {/* Bottom Actions - Sticky */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            type="submit"
            form="pengajuan-form"
            disabled={submitting || !hasValid}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              totalKgAll < 300
                ? "bg-slate-200 text-slate-500 hover:bg-slate-300"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            }`}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim Pengajuan
          </button>
        </div>
      </div>
    </div>
  );
}
