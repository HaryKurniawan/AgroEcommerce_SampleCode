/**
 * useCheckoutSubmit Hook
 * Handle order submission logic
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";

import { useAuthStore } from "@/src/store/auth-store";
import { useProfile } from "@/src/hooks/profil/useProfile";
import { ordersApi, cartApi } from "@/lib/ecommerce-api";
import type { ApiShippingInfo } from "@/types";

import type { StoreGroup } from "./checkout-helpers";
import { useCheckoutData } from "./useCheckoutData";

export function useCheckoutSubmit(
  selectedAddressId: string,
  paymentMethod: string,
  groupedByStore: StoreGroup[],
  shippingInfos: ApiShippingInfo[],
  catatanPerStore: { tokoId: string; text: string }[],
  allDeliverable: boolean,
  addresses: any[],
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    orderIdsParam: "",
  });
  const { isAuthenticated, _hasHydrated, openPhoneVerificationModal } =
    useAuthStore();
  const { profile } = useProfile(isAuthenticated, _hasHydrated);

  const handleSubmit = useCallback(async () => {
    if (!selectedAddressId) {
      setErrorModal({
        isOpen: true,
        title: "Alamat Pengiriman Kosong",
        message: "Silakan pilih alamat pengiriman terlebih dahulu.",
      });
      return;
    }

    if (!allDeliverable) {
      setErrorModal({
        isOpen: true,
        title: "Di Luar Jangkauan",
        message:
          "Beberapa toko berada di luar jangkauan pengiriman. Silakan pilih alamat lain atau sesuaikan keranjang Anda.",
      });
      return;
    }

    setLoading(true);
    try {
      const ordersPayload = groupedByStore.map((group) => {
        const info = shippingInfos.find((s) => s.tokoId === group.tokoId);
        const ongkir = info?.isAvailable ? (info.ongkir ?? 0) : 0;

        return {
          tokoId: group.tokoId,
          ongkir,
          metodeKirim: "LOKAL",
          catatan:
            catatanPerStore.find((c) => c.tokoId === group.tokoId)?.text || "",
          item: group.items.map((i) => ({
            produkId: i.produkId || "",
            jumlah: Number(i.jumlah),
            harga: Number(i.harga),
            varianKemasanId: i.varianKemasanId || undefined,
          })),
        };
      });

      let finalMobileNumber = undefined;
      if (paymentMethod === "OVO") {
        const hp = prompt(
          "Masukkan No HP OVO Anda (awali dengan 08, contoh: 0812...):",
        );
        if (!hp) {
          setLoading(false);
          return;
        }
        finalMobileNumber = hp.startsWith("0") ? `+62${hp.substring(1)}` : hp;
        if (!finalMobileNumber.startsWith("+62"))
          finalMobileNumber = `+62${finalMobileNumber}`;
      } else {
        // Fallback to address phone number if profile doesn't have one
        const addr = addresses.find((a) => a.id === selectedAddressId);
        if (!profile?.phone && addr?.telepon) {
          finalMobileNumber = addr.telepon;
        }
      }

      const payload = {
        metodeBayar: paymentMethod,
        alamatKirim: selectedAddressId,
        jadwalKirim: undefined,
        mobileNumber: finalMobileNumber,
        pesanan: ordersPayload,
      };

      const res = await ordersApi.create(payload);

      const orderData = res.data?.data || res.data;
      const orders = Array.isArray(orderData) ? orderData : [orderData];

      if (orders.length > 0) {
        // Keranjang sudah otomatis dibersihkan oleh backend (create-pesanan.usecase.ts)
        // Jadi kita tidak perlu memanggil API delete item lagi di frontend.

        // Ambil semua order ID untuk multi-checkout support di halaman pembayaran
        const orderIdsParam = orders
          .map((o: any) => o.id_pesanan || o.id)
          .join(",");
        setSuccessModal({
          isOpen: true,
          orderIdsParam,
        });
        return;
      }

      router.replace("/pesanan");
    } catch (err: any) {
      console.error("Checkout failed", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat membuat pesanan";

      setErrorModal({
        isOpen: true,
        title: "Gagal Checkout",
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedAddressId,
    allDeliverable,
    groupedByStore,
    shippingInfos,
    catatanPerStore,
    paymentMethod,
    router,
    profile,
    openPhoneVerificationModal,
  ]);

  return {
    loading,
    handleSubmit,
    errorModal,
    closeErrorModal: () => setErrorModal((p) => ({ ...p, isOpen: false })),
    successModal,
  };
}
