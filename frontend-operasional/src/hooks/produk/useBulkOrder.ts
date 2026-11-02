import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { ordersApi } from "@/lib/ecommerce-api";

export const useBulkOrder = (product: any) => {
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBulkOrderSubmit = async (data: {
    jumlah: number;
    grade: string;
    alamatKirim: string;
    catatan: string;
  }) => {
    if (!product) return;
    setLoading(true);

    try {
      const response = await ordersApi.createWholesale({
        tokoId: product.tokoId,
        produkId: product.id,
        grade: data.grade,
        jumlah: data.jumlah,
        alamatKirim: data.alamatKirim,
        catatan: data.catatan,
      });

      if (response.data) {
        toast.success(
          "Permintaan pesanan grosir berhasil dikirim ke Penjual. Menunggu konfirmasi.",
          { duration: 5000 },
        );
        setShowBulkOrderModal(false);
        // Optionally redirect to orders page
        router.push("/profil/pesanan");
      }
    } catch (error: any) {
      console.error("Error submitting bulk order:", error);
      toast.error(
        error.response?.data?.message || "Gagal mengirim permintaan grosir.",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    showBulkOrderModal,
    setShowBulkOrderModal,
    handleBulkOrderSubmit,
    bulkOrderLoading: loading,
  };
};
