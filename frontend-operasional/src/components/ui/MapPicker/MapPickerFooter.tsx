import { MapPin, Loader2 } from "lucide-react";

interface MapPickerFooterProps {
  geocoding: boolean;
  displayName: string;
  value?: { lat: number; lng: number };
}

export const MapPickerFooter = ({
  geocoding,
  displayName,
  value,
}: MapPickerFooterProps) => (
  <>
    <div className="mt-2.5 flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
      {geocoding ? (
        <Loader2
          size={14}
          className="text-primary-500 animate-spin mt-0.5 flex-shrink-0"
        />
      ) : (
        <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
      )}
      <span className="text-sm text-gray-600 leading-snug">
        {geocoding
          ? "Mencari alamat..."
          : displayName || "Belum ada lokasi dipilih"}
      </span>
    </div>
    <p className="text-[11px] text-gray-400 mt-1 text-center font-mono">
      {value ? `📍 ${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : ""}
    </p>
  </>
);
