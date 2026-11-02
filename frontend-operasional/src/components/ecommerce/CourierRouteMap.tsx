"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Info, Loader2, AlertTriangle } from "lucide-react";

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CourierIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3195/3195878.png", // Delivery bike icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Apply aesthetic CSS filter to OSM tile pane only (markers stay full color)
function TileFilter() {
  const map = useMap();
  useEffect(() => {
    // CartoDB Positron already has good contrast, no filter needed
  }, [map]);
  return null;
}

interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  geometry: [number, number][];
}

interface CourierRouteMapProps {
  address: string;
  destinationOnly?: boolean;
  destLat?: number | null;
  destLng?: number | null;
}

// Internal component to handle view resizing/centering
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function CourierRouteMap({
  address,
  destinationOnly,
  destLat,
  destLng,
}: CourierRouteMapProps) {
  const [courierPos, setCourierPos] = useState<[number, number] | null>(null);
  const [destPos, setDestPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get Courier Position
        const getPos = () =>
          new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });

        let cPos: [number, number] = [-6.9175, 107.6191]; // Default Bandung

        if (!destinationOnly) {
          try {
            const pos = await getPos();
            cPos = [pos.coords.latitude, pos.coords.longitude];
            setCourierPos(cPos);
          } catch (e) {
            console.warn("Geolocation failed, using default Bandung pos");
            setCourierPos(cPos);
          }
        }

        // 2. Geocode Destination Address
        let dPos: [number, number];

        if (destLat && destLng) {
          dPos = [destLat, destLng];
        } else {
          const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Bandung, Indonesia")}&format=json&limit=1`;
          const geoRes = await fetch(geoUrl, {
            headers: { "Accept-Language": "id" },
          });
          const geoData = await geoRes.json();

          if (!geoData || geoData.length === 0) {
            throw new Error("Lokasi tujuan tidak ditemukan");
          }

          dPos = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
        }

        setDestPos(dPos);

        // 3. Get OSRM Route
        if (!destinationOnly) {
          const routeUrl = `https://router.project-osrm.org/route/v1/driving/${cPos[1]},${cPos[0]};${dPos[1]},${dPos[0]}?overview=full&geometries=geojson`;
          const routeRes = await fetch(routeUrl);
          const routeData = await routeRes.json();

          if (routeData.code !== "Ok") {
            throw new Error("Gagal menghitung rute");
          }

          const routeInfo: RouteInfo = {
            distance: routeData.routes[0].distance / 1000,
            duration: routeData.routes[0].duration / 60,
            geometry: routeData.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]],
            ),
          };
          setRoute(routeInfo);
        }
      } catch (err: any) {
        console.warn("Map Error:", err.message);
        setError(err.message || "Terjadi kesalahan pada peta");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, destinationOnly, destLat, destLng]);

  if (loading) {
    return (
      <div className="h-48 w-full bg-slate-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-medium italic">
          Menyiapkan rute pengiriman...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-800">
            Ops! Peta tidak tersedia
          </p>
          <p className="text-[10px] text-amber-600 leading-tight mt-0.5">
            {error}. Tetap gunakan Google Maps eksternal untuk navigasi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
        <MapContainer
          center={destPos || courierPos || [-6.9175, 107.6191]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
            maxZoom={19}
            keepBuffer={4}
          />
          <TileFilter />
          {courierPos && (
            <Marker position={courierPos} icon={CourierIcon}>
              <Popup>Posisi Anda</Popup>
            </Marker>
          )}
          {destPos && (
            <Marker position={destPos}>
              <Popup>Tujuan Pengiriman</Popup>
            </Marker>
          )}
          {route && (
            <Polyline
              positions={route.geometry}
              color="#5C7C54"
              weight={4}
              opacity={0.9}
              lineCap="round"
              lineJoin="round"
            />
          )}
          {destPos && <MapUpdater center={destPos} />}
        </MapContainer>

        {/* Floating Info Overlay */}
        {route && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-teal-100 flex justify-around items-center z-[1000]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                <Navigation size={14} className="text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">
                  Jarak
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {route.distance.toFixed(1)} km
                </p>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                <Info size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">
                  Estimasi
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {Math.ceil(route.duration)} menit
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400 italic text-center">
        Peta rute ini hanya estimasi. Gunakan navigasi utama untuk akurasi lalu
        lintas.
      </p>
    </div>
  );
}
