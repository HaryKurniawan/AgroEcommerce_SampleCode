"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface MapViewProps {
  lat: number | string;
  lng: number | string;
  height?: string;
  className?: string;
}

let leafletCssLoaded = false;
function ensureLeafletCss() {
  if (leafletCssLoaded || typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

  const h1 = "p4NxAoJBhIIN+";
  const h2 = "hmNHrzRCf9tD/";
  const h3 = "miZyoHS5obTRR9BMY=";
  link.integrity = `sha256-${h1}${h2}${h3}`;

  link.crossOrigin = "";
  document.head.appendChild(link);
  leafletCssLoaded = true;
}

export default function MapView({
  lat,
  lng,
  height = "180px",
  className = "",
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [loadError, setLoadError] = useState(false);

  const latitude = typeof lat === "string" ? parseFloat(lat) : Number(lat);
  const longitude = typeof lng === "string" ? parseFloat(lng) : Number(lng);

  const isValid =
    !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0;

  useEffect(() => {
    if (!isValid || !mapContainerRef.current) return;

    ensureLeafletCss();

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      try {
        // Fix default icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapContainerRef.current!, {
          center: [latitude, longitude],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "",
          maxZoom: 19,
          keepBuffer: 4,
        }).addTo(map);

        const customIcon = L.divIcon({
          html: `
            <div style="width:36px;height:44px;position:relative;filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
              <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="#5C7C54"/>
                <circle cx="18" cy="18" r="8" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
          className: "",
        });

        const marker = L.marker([latitude, longitude], {
          icon: customIcon,
        }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;

        // Ensure tiles render correctly after container reaches its final size
        setTimeout(() => map.invalidateSize(), 100);
      } catch (err) {
        console.error("Error rendering Leaflet map:", err);
        setLoadError(true);
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, isValid]);

  if (!isValid || loadError) {
    return (
      <div
        className={`bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 text-gray-400 text-xs ${className}`}
        style={{ height }}
      >
        <span>
          Koordinat lokasi tidak valid ({lat}, {lng})
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative text-[11px] ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
