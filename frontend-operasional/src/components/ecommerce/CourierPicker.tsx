"use client";

import { useState, useMemo } from "react";

export interface CourierItem {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  courierStore?: {
    id: string;
    nama: string;
    kabupaten: string;
    wilayah: string;
  } | null;
}

interface CourierPickerProps {
  couriers: CourierItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
}

export function CourierPicker({
  couriers,
  selectedId,
  onSelect,
  loading = false,
}: CourierPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return couriers;
    const q = search.toLowerCase();
    return couriers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.courierStore?.nama.toLowerCase().includes(q) ||
        c.courierStore?.kabupaten.toLowerCase().includes(q),
    );
  }, [couriers, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mr-3" />
        Memuat daftar kurir...
      </div>
    );
  }

  if (couriers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Belum ada kurir yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Cari kurir berdasarkan nama, email, atau daerah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 transition-all"
        />
      </div>

      {/* Courier List */}
      <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            Tidak ada kurir yang cocok dengan pencarian.
          </div>
        ) : (
          filtered.map((courier) => {
            const isSelected = selectedId === courier.id;
            const isAffiliated = !!courier.courierStore;

            return (
              <button
                key={courier.id}
                type="button"
                onClick={() => onSelect(isSelected ? null : courier.id)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Selection indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {courier.name ? courier.name.charAt(0).toUpperCase() : "K"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-semibold text-sm truncate ${
                          isSelected ? "text-blue-900" : "text-slate-800"
                        }`}
                      >
                        {courier.name || "Nama belum diatur"}
                      </p>
                      {isAffiliated && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md flex-shrink-0">
                          TERAFILIASI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {courier.email}
                    </p>
                  </div>

                  {/* Region badge */}
                  {courier.courierStore && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-slate-600">
                        {courier.courierStore.nama}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        📍 {courier.courierStore.kabupaten}
                      </p>
                    </div>
                  )}
                  {!courier.courierStore && (
                    <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">
                      Tersedia
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selection summary */}
      {selectedId && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <svg
            className="w-4 h-4 text-blue-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Kurir dipilih:{" "}
            <strong>
              {filtered.find((c) => c.id === selectedId)?.name ||
                filtered.find((c) => c.id === selectedId)?.email}
            </strong>
            {filtered.find((c) => c.id === selectedId)?.courierStore && (
              <span className="text-amber-600 ml-1">
                (akan dipindahkan dari toko sebelumnya)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
