"use client";

import { Upload, X, Camera } from "lucide-react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: Array<{ id: string; preview: string; file: File }>;
  maxPhotos?: number;
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (id: string) => void;
  error?: string | null;
}

export default function PhotoGallery({
  photos,
  maxPhotos = 3,
  onAddPhoto,
  onRemovePhoto,
  error,
}: PhotoGalleryProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddPhoto(file);
    }
    e.target.value = "";
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Bukti Foto Pengiriman
          <span className="text-red-500 ml-1">*</span>
        </label>
        <span className="text-xs text-slate-500">
          {photos.length} / {maxPhotos} foto
        </span>
      </div>

      {/* Photo Preview Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group">
            <Image
              src={photo.preview}
              alt="Bukti kirim"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Upload Options */}
        {canAddMore && (
          <>
            <label className="border-2 border-dashed border-primary-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition aspect-square">
              <Camera size={20} className="text-primary-400" />
              <span className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                Kamera
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <label className="border-2 border-dashed border-emerald-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition aspect-square">
              <Upload size={20} className="text-emerald-400" />
              <span className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                Galeri
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-slate-500">
        Format: JPG, PNG | Max: 5MB per foto | Min: 1 foto, Max: {maxPhotos}{" "}
        foto
      </p>
    </div>
  );
}
