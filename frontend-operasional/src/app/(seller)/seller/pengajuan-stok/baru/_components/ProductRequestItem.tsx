import { Trash2, Layers, Split, Package } from "lucide-react";

import { FormItem, ProductData, RETAIL_KG, MEDIUM_KG } from "./types";

interface ProductRequestItemProps {
  index: number;
  item: FormItem;
  prod: ProductData;
  customMode: boolean;
  targetKg: number;
  onRemove: () => void;
  onToggleCustom: () => void;
  onPackChange: (field: "packRetail" | "packMedium", value: string) => void;
  onTargetKgChange: (val: number) => void;
  onBagiRata: () => void;
}

export function ProductRequestItem({
  index,
  item,
  prod,
  customMode,
  targetKg,
  onRemove,
  onToggleCustom,
  onPackChange,
  onTargetKgChange,
  onBagiRata,
}: ProductRequestItemProps) {
  const total =
    Math.round(
      (item.packRetail * RETAIL_KG + item.packMedium * MEDIUM_KG) * 10,
    ) / 10;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden transition-all border-slate-200/70">
      {/* Product Info */}
      <div className="px-4 pt-3.5 pb-3 border-b border-slate-100/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
          {prod.gambarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={prod.gambarUrl}
              alt={prod.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {prod.nama}
            {prod.varianProduk && ` ${prod.varianProduk}`}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rp {prod.hargaGudang.toLocaleString("id-ID")} / {prod.satuan}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-slate-300 hover:text-rose-500 transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main input: quantity or custom toggle */}
      <div className="px-4 pt-3.5 pb-3 bg-white border-b border-slate-100/70">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Jumlah Pesanan
          </label>
          <button
            type="button"
            onClick={onToggleCustom}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              customMode
                ? "bg-primary-50 border-primary-200 text-primary-600"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers className="w-4 h-4" />
            Multi Kemasan
            <span
              className={`w-9 h-5 rounded-full relative transition-all flex items-center shadow-inner ${customMode ? "bg-primary-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute w-4 h-4 rounded-full bg-white shadow-sm border border-black/5 transition-all ${customMode ? "left-[18px]" : "left-[2px]"}`}
              />
            </span>
          </button>
        </div>
        {!customMode && (
          <>
            <div className="relative">
              <input
                type="number"
                min={0}
                placeholder="mis. 1"
                value={item.packRetail || ""}
                onChange={(e) => onPackChange("packRetail", e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all bg-white"
              />
              <span className="absolute right-4 top-3 text-sm text-slate-400 font-medium">
                kg
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Default semua kemasan 1 kg. Aktifkan Multi Kemasan untuk membagi
              ke 2.5 kg.
            </p>
          </>
        )}
      </div>

      {/* 3 cards side-by-side — only when Multi Kemasan active */}
      {customMode && (
        <div className="px-4 py-4 bg-white grid grid-cols-3 gap-3">
          {/* Bagi Rata */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 overflow-hidden flex flex-col">
            <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-100/70">
              <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Split className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-700">Bagi Rata</p>
                <p className="text-[9px] text-slate-500">50:50</p>
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-center space-y-2">
              <input
                type="number"
                min={0}
                placeholder="Target kg"
                value={targetKg || ""}
                onChange={(e) =>
                  onTargetKgChange(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                type="button"
                onClick={onBagiRata}
                className="w-full px-2 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Split className="w-3.5 h-3.5" />
                Bagi 50:50
              </button>
            </div>
          </div>

          {/* Retail 1 kg */}
          <div className="rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-100/50 px-3 py-2 flex items-center gap-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-700">1 kg</p>
                <p className="text-[9px] text-slate-500">Retail</p>
              </div>
            </div>
            <div className="p-3 space-y-2 flex-1">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={item.packRetail || ""}
                  onChange={(e) => onPackChange("packRetail", e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-center"
                />
                <span className="absolute right-2.5 top-3 text-[10px] text-slate-400 font-medium">
                  pack
                </span>
              </div>
              <div className="bg-slate-100 rounded-lg py-1.5 text-center">
                <span className="text-xs font-bold text-slate-700">
                  {(item.packRetail * RETAIL_KG).toLocaleString("id-ID")} kg
                </span>
              </div>
            </div>
          </div>

          {/* Medium 2.5 kg */}
          <div className="rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-100/50 px-3 py-2 flex items-center gap-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-700">2.5 kg</p>
                <p className="text-[9px] text-slate-500">Medium</p>
              </div>
            </div>
            <div className="p-3 space-y-2 flex-1">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={item.packMedium || ""}
                  onChange={(e) => onPackChange("packMedium", e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-center"
                />
                <span className="absolute right-2.5 top-3 text-[10px] text-slate-400 font-medium">
                  pack
                </span>
              </div>
              <div className="bg-slate-100 rounded-lg py-1.5 text-center">
                <span className="text-xs font-bold text-slate-700">
                  {(item.packMedium * MEDIUM_KG).toLocaleString("id-ID")} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total per produk */}
      <div className="px-4 py-3 flex items-center justify-between text-xs border-t bg-white border-slate-100 text-slate-600">
        <span className="flex items-center gap-1.5">
          Total Produk:
          <span className="font-bold text-sm">
            {total.toLocaleString("id-ID")} kg
          </span>
        </span>
        <span className="font-bold text-slate-700 text-sm">
          Rp {(prod.hargaGudang * total).toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
