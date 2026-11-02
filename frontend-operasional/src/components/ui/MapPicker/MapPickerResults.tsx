import { MapPin } from "lucide-react";

interface MapPickerResultsProps {
  searchResults: Array<{
    lat: number;
    lng: number;
    display_name: string;
    address?: Record<string, string>;
  }>;
  handleSelectResult: (r: {
    lat: number;
    lng: number;
    display_name: string;
    address?: Record<string, string>;
  }) => void;
}

export const MapPickerResults = ({
  searchResults,
  handleSelectResult,
}: MapPickerResultsProps) => (
  <div className="absolute z-[9999] top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
    {searchResults.map((r, i) => (
      <button
        type="button"
        key={i}
        onClick={() => handleSelectResult(r)}
        className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 border-b border-gray-50 last:border-0 flex items-start gap-2 transition-colors"
      >
        <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2 text-gray-700">{r.display_name}</span>
      </button>
    ))}
  </div>
);
