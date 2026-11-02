"use client";

import { useMapPicker, MapPickerValue } from "@/hooks/ui/useMapPicker";

import { MapPickerHeader } from "./MapPicker/MapPickerHeader";
import { MapPickerResults } from "./MapPicker/MapPickerResults";
import { MapPickerView } from "./MapPicker/MapPickerView";
import { MapPickerFooter } from "./MapPicker/MapPickerFooter";

interface MapPickerProps {
  value?: MapPickerValue;
  onChange: (val: MapPickerValue) => void;
  height?: string;
  placeholder?: string;
  className?: string;
}

export type { MapPickerValue };

export default function MapPicker({
  value,
  onChange,
  height = "300px",
  placeholder = "Cari alamat...",
  className = "",
}: MapPickerProps) {
  const {
    mapRef,
    gpsLoading,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    geocoding,
    displayName,
    handleGps,
    handleSearch,
    handleSelectResult,
    setSearchResults,
  } = useMapPicker(value, onChange);

  return (
    <div className={`relative ${className}`}>
      <MapPickerHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchLoading={searchLoading}
        gpsLoading={gpsLoading}
        handleGps={handleGps}
        placeholder={placeholder}
        setSearchResults={setSearchResults}
      />

      {searchResults.length > 0 && (
        <MapPickerResults
          searchResults={searchResults}
          handleSelectResult={handleSelectResult}
        />
      )}

      <MapPickerView
        mapRef={mapRef as React.RefObject<HTMLDivElement>}
        height={height}
      />

      <MapPickerFooter
        geocoding={geocoding}
        displayName={displayName}
        value={value}
      />
    </div>
  );
}
