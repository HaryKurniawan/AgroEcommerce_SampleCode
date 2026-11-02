"use client";

import { useState } from "react";

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

export const usePhotoUpload = (maxPhotos = 3) => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addPhoto = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan");
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return false;
    }

    // Validate total photos
    if (photos.length >= maxPhotos) {
      setError(`Maksimal ${maxPhotos} foto`);
      return false;
    }

    const preview = URL.createObjectURL(file);
    const newPhoto: PhotoFile = {
      id: Date.now().toString(),
      file,
      preview,
    };

    setPhotos([...photos, newPhoto]);
    return true;
  };

  const removePhoto = (id: string) => {
    setPhotos((prevPhotos) => {
      const photo = prevPhotos.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prevPhotos.filter((p) => p.id !== id);
    });
  };

  const convertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getBase64Photos = async (): Promise<string[]> => {
    return Promise.all(photos.map((p) => convertToBase64(p.file)));
  };

  return {
    photos,
    error,
    addPhoto,
    removePhoto,
    getBase64Photos,
    reset: () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
    },
  };
};
