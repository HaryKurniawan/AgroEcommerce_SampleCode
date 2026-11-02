import {
  ShoppingBag,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
} from "lucide-react";

/** Urutan step roadmap pesanan dari awal hingga selesai. */
export const ORDER_ROADMAP = [
  {
    key: "MENUNGGU_BAYAR",
    label: "Pesanan Dibuat",
    desc: "Menunggu pembayaran",
    icon: ShoppingBag,
  },
  {
    key: "DIPROSES",
    label: "Diproses Seller",
    desc: "Pesanan sedang dikemas",
    icon: Package,
  },
  {
    key: "DIKIRIM",
    label: "Dalam Pengiriman",
    desc: "Paket sedang diantar",
    icon: Truck,
  },
  {
    key: "ARRIVED",
    label: "Tiba di Tujuan",
    desc: "Paket telah sampai",
    icon: MapPin,
  },
  {
    key: "SELESAI",
    label: "Selesai",
    desc: "Pesanan telah diterima",
    icon: CheckCircle2,
  },
] as const;

/** Peta warna Tailwind per status pesanan. */
export const ORDER_STATUS_COLORS = new Map<
  string,
  { text: string; bg: string; ring: string; dot: string }
>([
  [
    "MENUNGGU_KONFIRMASI_SELLER",
    {
      text: "text-orange-600",
      bg: "bg-orange-50",
      ring: "ring-orange-200",
      dot: "bg-orange-500",
    },
  ],
  [
    "MENUNGGU_BAYAR",
    {
      text: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      dot: "bg-amber-500",
    },
  ],
  [
    "DIPROSES",
    {
      text: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-200",
      dot: "bg-blue-500",
    },
  ],
  [
    "DIKIRIM",
    {
      text: "text-orange-600",
      bg: "bg-orange-50",
      ring: "ring-orange-200",
      dot: "bg-orange-500",
    },
  ],
  [
    "SELESAI",
    {
      text: "text-primary-600",
      bg: "bg-primary-50",
      ring: "ring-primary-200",
      dot: "bg-primary-500",
    },
  ],
  [
    "ARRIVED",
    {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-200",
      dot: "bg-emerald-500",
    },
  ],
  [
    "DIBATALKAN",
    {
      text: "text-red-600",
      bg: "bg-red-50",
      ring: "ring-red-200",
      dot: "bg-red-500",
    },
  ],
]);
