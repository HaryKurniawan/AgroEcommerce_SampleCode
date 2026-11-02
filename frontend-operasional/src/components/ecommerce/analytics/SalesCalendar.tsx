"use client";

import React from "react";

function intensitasToColor(intensitas: number): string {
  if (intensitas === 0) return "bg-gray-50 border border-gray-100";
  if (intensitas <= 20) return "bg-emerald-100 border border-emerald-200";
  if (intensitas <= 40) return "bg-emerald-300 border border-emerald-400";
  if (intensitas <= 60) return "bg-emerald-500 border border-emerald-600";
  if (intensitas <= 80) return "bg-emerald-700 border border-emerald-800";
  return "bg-emerald-900 border border-emerald-950";
}

interface SalesCalendarProps {
  kalender: { date: string; count: number; intensitas: number }[];
  totalPesanan: number;
  selectedDate?: string;
  onDateClick?: (date: string) => void;
}

export default function SalesCalendar({
  kalender,
  totalPesanan,
  selectedDate,
  onDateClick,
}: SalesCalendarProps) {
  // Sort by date just in case
  const sorted = [...kalender].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // We want to group by month for rendering 12 monthly blocks
  const months: Record<string, typeof kalender> = {};

  sorted.forEach((day) => {
    const d = new Date(day.date);
    const m = d.getMonth();
    if (!months[m]) months[m] = [];
    months[m].push(day);
  });

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthKeys = Object.keys(months);
  const isSingleMonth = monthKeys.length === 1;

  return (
    <div className="w-full space-y-6">
      <div
        className={
          isSingleMonth
            ? "max-w-xl mx-auto"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        }
      >
        {monthKeys.map((mKey) => {
          const m = Number(mKey);
          const daysInMonth = months[m];

          // Padding empty days for the first row to match the day of week (0 = Sunday)
          const firstDayDate = new Date(daysInMonth[0].date);
          const firstDayOfWeek = firstDayDate.getDay();

          const blanks = Array.from({ length: firstDayOfWeek }).map(
            (_, i) => i,
          );

          return (
            <div
              key={m}
              className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${isSingleMonth ? "p-6 md:p-8" : "p-4"}`}
            >
              <h3
                className={`${isSingleMonth ? "text-lg md:text-xl mb-6 text-center" : "text-sm mb-3"} font-bold text-gray-800`}
              >
                {monthNames[m]}
              </h3>
              <div
                className={`grid grid-cols-7 ${isSingleMonth ? "gap-2 md:gap-3" : "gap-1"}`}
              >
                {["M", "S", "S", "R", "K", "J", "S"].map((dayName, i) => (
                  <div
                    key={i}
                    className={`${isSingleMonth ? "text-xs md:text-sm pb-2" : "text-[10px] pb-1"} text-center text-gray-400 font-medium`}
                  >
                    {dayName}
                  </div>
                ))}

                {blanks.map((b) => (
                  <div
                    key={`blank-${b}`}
                    className={`w-full aspect-square bg-gray-50/30 ${isSingleMonth ? "rounded-xl" : "rounded-sm"}`}
                  />
                ))}

                {daysInMonth.map((day) => {
                  const d = new Date(day.date);
                  const isSelected = selectedDate === day.date;
                  return (
                    <div
                      key={day.date}
                      onClick={() => onDateClick && onDateClick(day.date)}
                      className={`group relative w-full aspect-square ${isSingleMonth ? "rounded-xl p-2" : "rounded-sm p-1"} ${intensitasToColor(day.intensitas)} transition-all hover:scale-105 cursor-pointer flex flex-col ${isSelected ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                    >
                      <span
                        className={`${isSingleMonth ? "text-sm md:text-base font-semibold" : "text-[10px] font-medium"} leading-none ${day.intensitas > 0 ? "text-white/90" : "text-gray-400"}`}
                      >
                        {d.getDate()}
                      </span>
                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px]
                        rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity
                        pointer-events-none whitespace-nowrap z-20 shadow-lg"
                      >
                        {d.getDate()} {monthNames[m]}: {day.count} pesanan
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 bg-gray-50/50 p-3 rounded-lg border border-gray-100 w-fit">
        <span className="font-medium mr-1">Tingkat Penjualan:</span>
        <span className="text-[10px]">Sepi</span>
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <div
            key={v}
            className={`w-4 h-4 rounded-sm ${intensitasToColor(v)}`}
          />
        ))}
        <span className="text-[10px] ml-1">Ramai</span>
      </div>
    </div>
  );
}
