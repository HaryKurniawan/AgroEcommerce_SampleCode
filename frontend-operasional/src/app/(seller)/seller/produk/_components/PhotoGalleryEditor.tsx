"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Link as LinkIcon,
  X,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface PhotoGalleryEditorProps {
  initialPhotos?: string[];
  onSave: (photos: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function PhotoGalleryEditor({
  initialPhotos = [],
  onSave,
  isLoading = false,
}: PhotoGalleryEditorProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos.slice(0, 3));
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const MIN_PHOTOS = 2;
  const MAX_PHOTOS = 3;

  const isValid = photos.length >= MIN_PHOTOS && photos.length <= MAX_PHOTOS;

  const addPhotoFromLink = useCallback(() => {
    if (!linkInput.trim()) {
      setError("Masukkan URL foto");
      return;
    }

    // Basic URL validation
    try {
      new URL(linkInput);
    } catch {
      setError("URL tidak valid");
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      setError(`Maksimal ${MAX_PHOTOS} foto saja`);
      return;
    }

    setPhotos([...photos, linkInput]);
    setLinkInput("");
    setError("");
  }, [linkInput, photos]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      if (photos.length >= MAX_PHOTOS) {
        setError(`Maksimal ${MAX_PHOTOS} foto saja`);
        return;
      }

      // For now, we'll create a data URL (in production, upload to server)
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPhotos([...photos, dataUrl]);
        setError("");
      };

      reader.readAsDataURL(file);
    },
    [photos],
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = async () => {
    if (!isValid) {
      setError(`Foto harus minimal ${MIN_PHOTOS} dan maksimal ${MAX_PHOTOS}`);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      await onSave(photos);
      setSuccess("Foto berhasil disimpan");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan foto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-2xl border border-slate-200/60 p-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          Galeri Foto Produk
        </h3>
        <p className="text-xs text-slate-400">
          Minimal {MIN_PHOTOS} foto, maksimal {MAX_PHOTOS} foto. Foto pertama
          akan menjadi foto utama.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50/50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-start gap-3">
          <p className="text-xs">{success}</p>
        </div>
      )}

      {/* Current Photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Foto Saat Ini ({photos.length}/{MAX_PHOTOS})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Badge for main photo */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-medium">
                    Utama
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Photo Options */}
      {photos.length < MAX_PHOTOS && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700">Tambah Foto</p>

          {/* Upload from File */}
          <div>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
              <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600">
                Upload Foto
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Add from Link */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste URL foto..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addPhotoFromLink()}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={addPhotoFromLink}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 border-t border-slate-100 pt-4">
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving || isLoading}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isValid && !isSaving && !isLoading
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSaving || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Simpan Foto
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Foto pertama akan ditampilkan sebagai foto utama produk</li>
          <li>Gunakan foto berkualitas tinggi untuk hasil terbaik</li>
          <li>Format: JPG, PNG, WebP (max 5MB per foto)</li>
        </ul>
      </div>
    </div>
  );
}
