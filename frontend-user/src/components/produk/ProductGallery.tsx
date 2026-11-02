"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProductGalleryProps {
  product: {
    gambarUrl?: string;
    fotoLainnya?: string[];
    nama: string;
  };
  activeImage?: number;
  setActiveImage?: (index: number) => void;
}

export default function ProductGallery({
  product,
  activeImage = 0,
  setActiveImage,
}: ProductGalleryProps) {
  // Combine all photos: main photo + additional photos (max 3 total)
  const allPhotos = [product.gambarUrl, ...(product.fotoLainnya || [])].filter(
    Boolean,
  ) as string[];
  const displayPhotos = allPhotos.slice(0, 3);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(activeImage);

  // Sync with parent if setActiveImage provided
  const updateIndex = (index: number) => {
    setCurrentPhotoIndex(index);
    setActiveImage?.(index);
  };

  if (displayPhotos.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto mb-3" />
          <p className="text-sm text-slate-400">Foto tidak tersedia</p>
        </div>
      </div>
    );
  }

  const currentPhoto = displayPhotos[currentPhotoIndex];

  const goToPrevious = () => {
    updateIndex(
      currentPhotoIndex === 0
        ? displayPhotos.length - 1
        : currentPhotoIndex - 1,
    );
  };

  const goToNext = () => {
    updateIndex(
      currentPhotoIndex === displayPhotos.length - 1
        ? 0
        : currentPhotoIndex + 1,
    );
  };

  return (
    <div className="space-y-4 px-4 lg:px-0 w-full shrink-0 mt-2">
      {/* Main Photo + Thumbnails Container */}
      <div className="flex flex-col gap-3">
        {/* Main Photo */}
        <div className="relative w-full aspect-[4/3] lg:aspect-square bg-slate-100 rounded-2xl overflow-hidden group mx-auto">
          <Image
            src={currentPhoto}
            alt={`${product.nama?.replace(" - ", " ")} - Foto ${currentPhotoIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* Thumbnail Gallery - Floating at bottom */}
          {displayPhotos.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex flex-row justify-center gap-2 z-20">
              {displayPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateIndex(index);
                  }}
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-[2.5px] transition-all flex-shrink-0 shadow-sm ${
                    index === currentPhotoIndex
                      ? "border-white scale-110 shadow-md ring-2 ring-black/5"
                      : "border-white/80 opacity-90 hover:opacity-100 hover:border-white hover:scale-105"
                  }`}
                >
                  <Image
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
