"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import { addressesApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";
import { alamatSchema } from "@/lib/validations/schemas";
import type { MapPickerValue } from "@/components/ui/MapPicker";
import type { ApiAddressData } from "@/types";

type AlamatFormData = z.infer<typeof alamatSchema>;

export function useAlamatForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const redirectTo = searchParams.get("redirect");
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(!!editId);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressesLength, setAddressesLength] = useState(0);
  const [mapValue, setMapValue] = useState<MapPickerValue | undefined>(
    undefined,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlamatFormData>({
    resolver: zodResolver(alamatSchema as never),
    defaultValues: {
      label: "Rumah",
      penerima: "",
      telepon: "",
      alamat: "",
      kota: "",
      kecamatan: "",
      kelurahan: "",
      provinsi: "",
      kodePos: "",
      isDefault: false,
    },
  });

  const formData = watch();

  useEffect(() => {
    const checkAddresses = async () => {
      try {
        const res = await addressesApi.getAll();
        const data = res?.data?.data || res?.data || [];
        setAddressesLength(Array.isArray(data) ? data.length : 0);

        if (editId) {
          const target = Array.isArray(data)
            ? data.find((a: ApiAddressData) => String(a.id) === String(editId))
            : null;

          if (target) {
            reset({
              label: target.label || "Rumah",
              penerima: target.penerima || "",
              telepon: target.telepon || "",
              alamat: target.alamat || "",
              kota: target.kota || "",
              kecamatan: target.kecamatan || "",
              kelurahan: target.kelurahan || "",
              provinsi: target.provinsi || "",
              kodePos: target.kodePos || "",
              isDefault: !!target.isDefault,
            });
            if (target.lat && target.lng) {
              setMapValue({
                lat: Number(target.lat),
                lng: Number(target.lng),
                displayName: target.alamat,
              });
            }
          }
        } else if (Array.isArray(data) && data.length === 0) {
          setValue("isDefault", true);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setLoading(false);
      }
    };
    checkAddresses();
  }, [editId, reset, setValue]);

  const handleMapChange = (val: MapPickerValue) => {
    setMapValue(val);
    if (val.displayName) setValue("alamat", val.displayName);

    const addr = val.address;
    if (addr) {
      if (addr.city || addr.town || addr.village) {
        setValue("kota", addr.city || addr.town || addr.village || "");
      }
      if (addr.city_district || addr.county) {
        setValue("kecamatan", addr.city_district || addr.county || "");
      }
      if (addr.state) {
        setValue("provinsi", addr.state);
      }
      if (addr.postcode) {
        setValue("kodePos", addr.postcode.substring(0, 5));
      }
    }
  };

  const onFormSubmit = async (data: AlamatFormData) => {
    setActionLoading(true);
    setError("");

    const payload = {
      ...data,
      provinsi: data.provinsi || "",
      lat: mapValue?.lat,
      lng: mapValue?.lng,
    };

    try {
      if (editId) {
        await addressesApi.update(editId, payload);
      } else {
        await addressesApi.create(payload);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });

      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
      } else {
        router.push("/profil/alamat");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message || "Gagal menyimpan alamat.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return {
    router,
    editId,
    loading,
    actionLoading,
    error,
    addressesLength,
    formData,
    setFormData: (fn: (prev: AlamatFormData) => AlamatFormData) => {
      // Compatibility wrapper for old setFormData usage if any
      const next = fn(formData);
      reset(next);
    },
    mapValue,
    handleMapChange,
    handleSubmit: handleSubmit(onFormSubmit),
    register,
    errors,
    setValue,
  };
}
