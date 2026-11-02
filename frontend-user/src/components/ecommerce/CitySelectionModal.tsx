"use client";

import React, { useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import Image from "next/image";

interface CitySelectionModalProps {
  isOpen: boolean;
  availableCities: { name: string; sellerCount: number }[];
  onSelectCity: (city: string) => void;
}

const CitySelectionModal: React.FC<CitySelectionModalProps> = ({
  isOpen,
  availableCities,
  onSelectCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const selectedCityData = availableCities.find((c) => c.name === selectedCity);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-6 text-center border-b border-gray-100">
            <div className="flex justify-center -mt-10 -mb-10">
              <Image
                src="/dimana-lokasi.svg"
                alt="Location Illustration"
                width={280}
                height={280}
                className="object-contain w-[280px] h-[280px]"
                priority
              />
            </div>
            <h2 className="font-display text-xl font-medium text-gray-900 mb-2 leading-tight">
              Di mana kotamu?
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed px-2">
              Tentukan lokasi terdekat untuk mulai berbelanja.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  selectedCity
                    ? "border-primary-400 bg-primary-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span
                  className={`font-medium text-sm ${selectedCity ? "text-primary-700" : "text-gray-400"}`}
                >
                  {selectedCity ? selectedCity : "Pilih kota..."}
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""} ${selectedCity ? "text-primary-500" : "text-gray-400"}`}
                />
              </button>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 overflow-hidden max-h-52 overflow-y-auto">
                  {availableCities.length > 0 ? (
                    availableCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          setSelectedCity(city.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors group ${
                          selectedCity === city.name
                            ? "bg-primary-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-medium text-sm ${selectedCity === city.name ? "text-primary-700" : "text-gray-800"}`}
                          >
                            {city.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {city.sellerCount} seller aktif
                          </p>
                        </div>
                        {selectedCity === city.name ? (
                          <Check size={14} className="text-primary-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-primary-300 transition-colors" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      Belum ada kota tersedia
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => selectedCity && onSelectCity(selectedCity)}
              disabled={!selectedCity}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                selectedCity
                  ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Mulai Belanja
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Kamu bisa ganti lokasi kapan saja melalui halaman profil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelectionModal;
