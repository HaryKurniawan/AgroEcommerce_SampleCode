import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CityState {
  selectedCity: string | null;
  hasSetCity: boolean;
  /** Set kota terpilih. null = "Semua Lokasi" (tampilkan semua produk). */
  setCity: (city: string | null) => void;
  clearCity: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      hasSetCity: false,
      setCity: (city) => {
        set({ selectedCity: city, hasSetCity: true });
      },
      clearCity: () => {
        set({ selectedCity: null, hasSetCity: false });
      },
    }),
    {
      name: "agro-selected-city",
    },
  ),
);
