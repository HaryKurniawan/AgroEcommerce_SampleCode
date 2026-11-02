"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Check, Globe } from "lucide-react";

import { ALL_CITIES, type AvailableCity } from "@/lib/location";

interface LocationSelectorProps {
  selectedCity: string | null;
  availableCities: AvailableCity[];
  onSelectCity: (city: string | null) => void;
  /** "dark" untuk header hijau (mobile), "light" untuk navbar putih (desktop). */
  variant?: "light" | "dark";
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedCity,
  availableCities,
  onSelectCity,
  variant = "light",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = variant === "dark";
  const label = selectedCity || "Pilih Lokasi";

  const triggerClass = isDark
    ? "text-white/90 hover:text-white"
    : "text-gray-700 hover:text-primary-700";

  const handleSelect = (city: string | null) => {
    onSelectCity(city);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1.5 transition-colors ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin size={isDark ? 13 : 18} className="flex-shrink-0" />
        <span
          className={`font-medium text-left ${isDark ? "text-xs tracking-wide whitespace-normal break-words" : "text-[15px] truncate max-w-[200px]"}`}
        >
          {label}
        </span>
        <ChevronDown
          size={isDark ? 13 : 16}
          className={`transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-[70] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500">
              Pilih Lokasi Pengiriman
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {availableCities.length > 0 ? (
              availableCities.map((city) => {
                const active = selectedCity === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelect(city.name)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors group border-t border-gray-50/50 ${
                      active ? "bg-primary-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-[15px] font-medium ${active ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                      >
                        {city.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {city.sellerCount} seller aktif
                      </p>
                    </div>
                    {active ? (
                      <Check size={16} className="text-primary-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-primary-300 transition-colors" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Belum ada lokasi tersedia
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Voucher: ALL_CITIES dipakai konsumen lain; re-export agar mudah diakses.
export { ALL_CITIES };
export default LocationSelector;
