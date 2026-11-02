import { Search, X, Navigation, Loader2 } from "lucide-react";

interface MapPickerHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (q: string) => void;
  searchLoading: boolean;
  gpsLoading: boolean;
  handleGps: () => void;
  placeholder?: string;
  setSearchResults: (
    res: Array<{
      lat: number;
      lng: number;
      display_name: string;
      address?: Record<string, string>;
    }>,
  ) => void;
}

export const MapPickerHeader = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchLoading,
  gpsLoading,
  handleGps,
  placeholder,
  setSearchResults,
}: MapPickerHeaderProps) => (
  <div className="flex gap-2 mb-3">
    <div className="relative flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-all"
      />
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
    <button
      type="button"
      onClick={() => handleSearch(searchQuery)}
      disabled={searchLoading || !searchQuery.trim()}
      className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
    >
      {searchLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Search size={14} />
      )}
    </button>
    <button
      type="button"
      onClick={handleGps}
      disabled={gpsLoading}
      title="Gunakan Lokasi GPS Saya"
      className="px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
    >
      {gpsLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Navigation size={16} />
      )}
    </button>
  </div>
);
