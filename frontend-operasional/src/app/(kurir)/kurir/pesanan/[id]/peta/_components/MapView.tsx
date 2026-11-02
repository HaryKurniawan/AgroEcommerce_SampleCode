"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LatLng {
  lat: number;
  lng: number;
}
interface MapViewProps {
  destination: LatLng;
  currentPos: LatLng | null;
  onRouteStateChange?: (state: "loading" | "done" | "no-gps" | "error") => void;
  onMapReady?: (map: L.Map) => void;
}

/* ─── Custom marker icons ─── */
// Icon TUJUAN - Grab/Google Maps style drop pin (hijau tua)
const destIcon = L.divIcon({
  html: `
    <div style="width:32px;height:42px;position:relative;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#3d5a35"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    </div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
  className: "",
});

// Icon KURIR/POSISI - Circle pulsing hijau (style sebelumnya)
const courierIcon = L.divIcon({
  html: `
    <div style="
      width: 36px; height: 36px;
      background-color: rgba(92, 124, 84, 0.25);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 16px; height: 16px;
        background-color: #5C7C54;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

/* ─── OSRM routing ─── */
async function fetchRoute(
  from: LatLng,
  to: LatLng,
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
      );
    }
  } catch {
    /* fallback: no route */
  }
  return null;
}

export default function MapView({
  destination,
  currentPos,
  onRouteStateChange,
  onMapReady,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayRef = useRef<L.Polyline | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const routeFetchedRef = useRef(false);

  /* ── Init map ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = currentPos
      ? [currentPos.lat, currentPos.lng]
      : [destination.lat, destination.lng];

    const map = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 19,
      keepBuffer: 4,
    }).addTo(map);

    // Ensure map renders tiles correctly after container has final size
    setTimeout(() => map.invalidateSize(), 100);

    // No built-in zoom control — custom buttons used in parent

    // Destination marker
    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif; font-size:13px; font-weight:600; color:#3d5a35;">🎯 Tujuan Pengiriman</div>`,
        { closeButton: false },
      );

    // Courier marker (if GPS available)
    if (currentPos) {
      const m = L.marker([currentPos.lat, currentPos.lng], {
        icon: courierIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif; font-size:13px; font-weight:600; color:#5C7C54;">📍 Posisi Anda Sekarang</div>`,
          { closeButton: false },
        );
      courierMarkerRef.current = m;
    }

    mapRef.current = map;
    onMapReady?.(map);

    // Fit bounds if both points available
    if (currentPos) {
      const bounds = L.latLngBounds(
        [currentPos.lat, currentPos.lng],
        [destination.lat, destination.lng],
      );
      map.fitBounds(bounds, { padding: [80, 80] });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Update courier marker + draw route when GPS changes ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentPos) return;

    // Update / add courier marker
    if (courierMarkerRef.current) {
      courierMarkerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
    } else {
      courierMarkerRef.current = L.marker([currentPos.lat, currentPos.lng], {
        icon: courierIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif; font-size:13px; font-weight:600; color:#5C7C54;">📍 Posisi Anda Sekarang</div>`,
          { closeButton: false },
        );
    }

    // Fetch route only once when currentPos first appears
    if (!routeFetchedRef.current) {
      routeFetchedRef.current = true;
      onRouteStateChange?.("loading");
      fetchRoute(currentPos, destination).then((coords) => {
        if (!coords || !mapRef.current) {
          onRouteStateChange?.("error");
          return;
        }

        // Remove old route if any
        routeLayRef.current?.remove();

        // Draw route polyline
        routeLayRef.current = L.polyline(coords, {
          color: "#5C7C54",
          weight: 4,
          opacity: 0.9,
          lineJoin: "round",
        }).addTo(mapRef.current!);

        // Fit route
        mapRef.current!.fitBounds(routeLayRef.current.getBounds(), {
          padding: [80, 80],
        });

        onRouteStateChange?.("done");
      });
    }
  }, [currentPos, destination, onRouteStateChange]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Map legend */}
      <div className="absolute top-20 left-3 z-[500] bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#5C7C54]/25 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#5C7C54] border border-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-gray-700">
            Posisi Anda
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg
              viewBox="0 0 32 42"
              fill="none"
              className="w-[14px] h-[18px] drop-shadow-sm"
            >
              <path
                d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
                fill="#3d5a35"
              />
              <circle cx="16" cy="16" r="6" fill="white" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-gray-700">
            Tujuan
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 flex items-center justify-center">
            <div
              className="w-4 h-1.5 rounded-full"
              style={{ backgroundColor: "#5C7C54" }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-700">Rute</span>
        </div>
      </div>
    </div>
  );
}
