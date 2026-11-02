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
    <style
      dangerouslySetInnerHTML={{
        __html: `
      .leaflet-bar {
        border: none !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        border-radius: 12px !important;
        overflow: hidden;
        margin-top: 12px !important;
        margin-left: 12px !important;
      }
      .leaflet-bar a {
        background-color: white !important;
        color: #4b5563 !important;
        border-bottom: 1px solid #f3f4f6 !important;
        width: 36px !important;
        height: 36px !important;
        line-height: 36px !important;
        font-size: 18px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease;
      }
      .leaflet-bar a:hover {
        background-color: #f9fafb !important;
        color: #16a34a !important;
      }
      .leaflet-bar a:last-child {
        border-bottom: none !important;
      }
    `,
      }}
    />
    <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    <div className="absolute bottom-1 right-2 bg-black/40 text-white px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-[1000] flex items-center gap-1.5 whitespace-nowrap">
      <MapPin size={11} />
      Tap peta atau drag pin untuk set lokasi
    </div>
  </div>
);
