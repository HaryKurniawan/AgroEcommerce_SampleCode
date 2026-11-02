import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { storesApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import type { MapPickerValue } from "@/components/ui/MapPicker";
import type { ApiStoreData } from "@/types";

export const useProfilToko = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState("");
  const [mapValue, setMapValue] = useState<MapPickerValue | undefined>(
    undefined,
  );
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    alamat: "",
    kabupaten: "",
    wilayah: "",
    kodePos: "",
    telepon: "",
    jamOperasional: "",
    nomorSIUP: "",
    telegramBotToken: "",
    telegramChatId: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const storeQuery = useQuery({
    queryKey: queryKeys.stores.myStore(),
    queryFn: () => storesApi.getMyStore(),
    select: (res): ApiStoreData => res.data?.data || res.data,
    staleTime: 5 * 60 * 1000,
  });

  // Sync form saat data store berubah
  const store = storeQuery.data ?? null;
  if (store && formData.nama === "" && !isEditing) {
    setFormData({
      nama: store.nama || "",
      deskripsi: store.deskripsi || "",
      alamat: store.alamat || "",
      kabupaten: store.kabupaten || "",
      wilayah: store.wilayah || "",
      kodePos: store.kodePos || "",
      telepon: store.telepon || store.noHp || "",
      jamOperasional: store.jamOperasional || "",
      nomorSIUP: (store as any).nomorSIUP || "",
      telegramBotToken: (store as any).telegramBotToken || "",
      telegramChatId: (store as any).telegramChatId || "",
    });
    if (store.lat && store.lng) {
      setMapValue({
        lat: store.lat,
        lng: store.lng,
        displayName: store.alamat,
      });
    }
  }

  const updateMutation = useMutation({
    mutationFn: (payload: typeof formData & { lat?: number; lng?: number }) =>
      storesApi.update(store?.id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.myStore() });
      setIsEditing(false);
      showToast("Profil toko berhasil disimpan ✓");
    },
    onError: () => showToast("Gagal menyimpan perubahan. Coba lagi."),
  });

  const handleSave = async () => {
    if (!store?.id) return;
    updateMutation.mutate({
      ...formData,
      lat: mapValue?.lat,
      lng: mapValue?.lng,
    });
  };

  const handleCancel = () => {
    if (store) {
      setFormData({
        nama: store.nama || "",
        deskripsi: store.deskripsi || "",
        alamat: store.alamat || "",
        kabupaten: store.kabupaten || "",
        wilayah: store.wilayah || "",
        kodePos: store.kodePos || "",
        telepon: store.telepon || store.noHp || "",
        jamOperasional: store.jamOperasional || "",
        nomorSIUP: (store as any).nomorSIUP || "",
        telegramBotToken: (store as any).telegramBotToken || "",
        telegramChatId: (store as any).telegramChatId || "",
      });
      setMapValue(
        store.lat && store.lng
          ? { lat: store.lat, lng: store.lng, displayName: store.alamat }
          : undefined,
      );
    }
    setIsEditing(false);
  };

  return {
    store,
    loading: storeQuery.isLoading,
    errorText: storeQuery.error
      ? "Toko tidak ditemukan. Anda belum memiliki toko."
      : "",
    isEditing,
    setIsEditing,
    saving: updateMutation.isPending,
    toast,
    formData,
    setFormData,
    mapValue,
    setMapValue,
    handleSave,
    handleCancel,
  };
};
