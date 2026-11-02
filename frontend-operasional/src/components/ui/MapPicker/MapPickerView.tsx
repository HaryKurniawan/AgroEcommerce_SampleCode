import { MapPin } from "lucide-react";

interface MapPickerViewProps {
  mapRef: React.RefObject<HTMLDivElement>;
  height: string;
}

export const MapPickerView = ({ mapRef, height }: MapPickerViewProps) => (
  <div
    className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative text-[11px]"
    style={{ height }}
  >
    <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-[1000] flex items-center gap-1.5 whitespace-nowrap">
      <MapPin size={11} />
      Tap peta atau drag pin untuk set lokasi
    </div>
  </div>
);
