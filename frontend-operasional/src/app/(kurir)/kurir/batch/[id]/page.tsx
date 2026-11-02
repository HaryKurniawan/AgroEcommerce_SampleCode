"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  CheckCircle2,
  Navigation2,
  Phone,
  Loader2,
  Info,
} from "lucide-react";

import { deliveryBatchApi } from "@/lib/ecommerce-api";

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBatch = async () => {
    try {
      const res = await deliveryBatchApi.getBatchDetail(params.id);
      setBatch(res.data?.data);
    } catch (err: any) {
      alert("Gagal memuat detail batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [params.id]);

  const handleStartBatch = async () => {
    try {
      setActionLoading("start");
      await deliveryBatchApi.startBatch(batch.id);
      await fetchBatch();
    } catch (err: any) {
      alert(err.message || "Gagal memulai batch");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (pesananId: string) => {
    try {
      setActionLoading(`deliver-${pesananId}`);
      await deliveryBatchApi.markItemDelivered(batch.id, pesananId);
      await fetchBatch();
    } catch (err: any) {
      alert(err.message || "Gagal menandai terkirim");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigation = () => {
    if (!batch || !batch.items) return;

    // Titik awal adalah toko
    const origin = `${batch.toko.lat},${batch.toko.lng}`;

    // Titik akhir adalah tujuan terakhir yang belum terkirim
    const uncompletedItems = batch.items.filter(
      (i: any) => i.status !== "TERKIRIM",
    );
    if (uncompletedItems.length === 0) {
      alert("Semua pesanan dalam batch ini sudah terkirim!");
      return;
    }

    const destinationItem = uncompletedItems[uncompletedItems.length - 1];
    const destination = `${destinationItem.lat},${destinationItem.lng}`;

    // Waypoints adalah tujuan di antaranya (maks 9 di Google Maps via URL)
    const waypoints = uncompletedItems
      .slice(0, -1)
      .map((i: any) => `${i.lat},${i.lng}`)
      .join("|");

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=driving`;

    window.open(mapsUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Batch Tidak Ditemukan
        </h2>
        <button
          onClick={() => router.back()}
          className="text-emerald-600 font-semibold mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar
        </button>
      </div>
    );
  }

  const isPagi = batch.tipeBatch === "PAGI";
  const isStarted = batch.status === "DALAM_PERJALANAN";
  const isCompleted = batch.status === "SELESAI";

  const completedCount = batch.items.filter(
    (i: any) => i.status === "TERKIRIM",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">
              Detail Batch {batch.tipeBatch}
            </h1>
            <p className="text-xs text-gray-500 font-mono">{batch.kodeResi}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Info Card */}
        <div
          className={`rounded-xl border p-4 bg-white
          ${isCompleted ? "border-gray-200" : isPagi ? "border-emerald-200 shadow-emerald-50" : "border-blue-200 shadow-blue-50"} shadow-sm`}
        >
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2.5 flex flex-col justify-center items-center">
              <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
                PROGRESS
              </span>
              <span className="font-bold text-gray-800">
                {completedCount}/{batch.items.length}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 flex flex-col justify-center items-center">
              <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
                EST. JARAK
              </span>
              <span className="font-bold text-gray-800">
                {batch.estimasiJarakKm || "-"} km
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 flex flex-col justify-center items-center">
              <span className="text-[10px] text-gray-500 font-semibold mb-0.5">
                BERAT
              </span>
              <span className="font-bold text-gray-800">
                {batch.totalBeratKg} kg
              </span>
            </div>
          </div>

          {!isCompleted && (
            <div className="flex flex-col gap-2">
              {!isStarted ? (
                <button
                  onClick={handleStartBatch}
                  disabled={actionLoading === "start"}
                  className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors
                    ${isPagi ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {actionLoading === "start" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                      strokeWidth={2.5}
                    />
                  ) : (
                    "Mulai Kirim Batch Ini"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNavigation}
                  className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Navigation2 size={18} strokeWidth={2.5} />
                  Buka Navigasi Rute (Google Maps)
                </button>
              )}
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-900 px-1 pt-2 flex items-center gap-2">
          Urutan Rute Pengiriman
        </h3>

        {/* List of orders in optimal route order */}
        <div className="space-y-3 relative">
          {/* Vertical line connecting nodes */}
          <div className="absolute top-6 bottom-6 left-[21px] w-0.5 bg-gray-200 z-0" />

          {batch.items.map((item: any, idx: number) => {
            const isDone = item.status === "TERKIRIM";
            const isNext =
              !isDone &&
              (idx === 0 || batch.items[idx - 1].status === "TERKIRIM");

            return (
              <div key={item.id} className="relative z-10 flex gap-3">
                <div
                  className={`w-[44px] h-[44px] rounded-full border-4 border-gray-50 flex items-center justify-center flex-shrink-0 font-bold text-sm
                  ${isDone ? "bg-emerald-500 text-white" : isNext ? "bg-blue-500 text-white" : "bg-white border-gray-200 text-gray-400"}`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                </div>

                <div
                  className={`flex-1 rounded-xl border p-4 bg-white transition-opacity ${isDone ? "opacity-60 bg-gray-50" : "shadow-sm"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p
                        className={`font-bold ${isDone ? "text-gray-600" : "text-gray-900"} leading-tight`}
                      >
                        {item.penerima}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.pesanan?.item?.length || 0} barang
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-3 bg-gray-50 p-2 rounded-lg">
                    <MapPin
                      size={14}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-gray-700">{item.alamat}</p>
                  </div>

                  {!isDone && isStarted && (
                    <button
                      onClick={() => handleMarkDelivered(item.pesananId)}
                      disabled={actionLoading === `deliver-${item.pesananId}`}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `deliver-${item.pesananId}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                          Tandai Selesai Dikirim
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
