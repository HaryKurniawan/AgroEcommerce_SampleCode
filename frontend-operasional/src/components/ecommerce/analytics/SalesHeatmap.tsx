"use client";

import React from "react";

import type { HeatmapDataItem } from "@/lib/api/analytics";

const SESI_ORDER: Array<"PAGI" | "SIANG" | "SORE" | "MALAM"> = [
  "PAGI",
  "SIANG",
  "SORE",
  "MALAM",
];
const SESI_LABEL: Record<string, string> = {
  PAGI: "Pagi",
  SIANG: "Siang",
  SORE: "Sore",
  MALAM: "Malam",
};
const SESI_TIME: Record<string, string> = {
  PAGI: "06–12",
  SIANG: "12–17",
  SORE: "17–21",
  MALAM: "21–06",
};
const HARI_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function intensitasToColor(intensitas: number): string {
  if (intensitas === 0) return "bg-gray-50 text-gray-200";
  if (intensitas <= 20) return "bg-emerald-50 text-emerald-300";
  if (intensitas <= 40) return "bg-emerald-100 text-emerald-500";
  if (intensitas <= 60) return "bg-emerald-200 text-emerald-600";
  if (intensitas <= 80) return "bg-emerald-400 text-white";
  return "bg-emerald-600 text-white";
}

interface SalesHeatmapProps {
  heatmap: HeatmapDataItem[];
  totalPesanan: number;
}

export default function SalesHeatmap({
  heatmap,
  totalPesanan,
}: SalesHeatmapProps) {
  // Build lookup: [hari][sesi] => item
  const lookup = new Map<string, HeatmapDataItem>();
  heatmap.forEach((item) => {
    lookup.set(`${item.hariMinggu}-${item.sesi}`, item);
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[400px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-400 font-medium pb-1 w-20">
              Sesi / Hari
            </th>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <th
                key={d}
                className="text-center text-xs text-gray-500 font-semibold pb-1"
              >
                {HARI_SHORT[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SESI_ORDER.map((sesi) => (
            <tr key={sesi}>
              <td className="py-1 pr-2">
                <div className="text-xs font-medium text-gray-700">
                  {SESI_LABEL[sesi]}
                </div>
                <div className="text-[10px] text-gray-400">
                  {SESI_TIME[sesi]}
                </div>
              </td>
              {[0, 1, 2, 3, 4, 5, 6].map((hari) => {
                const item = lookup.get(`${hari}-${sesi}`);
                const intensitas = item?.intensitas ?? 0;
                const count = item?.jumlahPesanan ?? 0;
                return (
                  <td key={hari} className="text-center">
                    <div
                      className={`relative group mx-auto w-9 h-9 rounded-lg flex items-center justify-center
                        text-xs font-bold transition-transform hover:scale-110 cursor-default
                        ${intensitasToColor(intensitas)}`}
                      title={`${item?.hariLabel ?? ""} ${SESI_LABEL[sesi]}: ${count} pesanan`}
                    >
                      {count > 0 ? count : ""}
                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px]
                        rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity
                        pointer-events-none whitespace-nowrap z-20 shadow-lg"
                      >
                        {count} pesanan
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <span>Intensitas:</span>
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <div
            key={v}
            className={`w-5 h-5 rounded ${intensitasToColor(v).split(" ")[0]}`}
          />
        ))}
        <span className="ml-1">Tinggi</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Total {totalPesanan} pesanan dianalisis
      </p>
    </div>
  );
}
