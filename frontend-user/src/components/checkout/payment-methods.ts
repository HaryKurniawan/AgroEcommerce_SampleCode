// Logo path dari /public/images/payment/
// Gunakan string path agar bisa dipakai di file .ts biasa

export interface PaymentMethod {
  id: string;
  label: string;
  logo?: string; // path ke /public/images/payment/...
  badge?: string; // teks singkat fallback untuk bank (BCA, BRI, dst.)
  bgColor: string; // warna background icon container
  sublabel: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "QRIS",
    label: "QRIS",
    logo: "/images/payment/QRIS.png",
    bgColor: "bg-white border border-gray-200",
    sublabel: "E-Wallet / QR Code",
  },
  {
    id: "OVO",
    label: "OVO",
    logo: "/images/payment/OVO.png",
    bgColor: "bg-[#4C3494]",
    sublabel: "E-Wallet",
  },
  {
    id: "DANA",
    label: "DANA",
    logo: "/images/payment/DANA.png",
    bgColor: "bg-[#108BE3]",
    sublabel: "E-Wallet",
  },
  {
    id: "GOPAY",
    label: "GoPay",
    logo: "/images/payment/GOPAY.png",
    bgColor: "bg-[#00AED6]",
    sublabel: "E-Wallet",
  },
  {
    id: "SHOPEEPAY",
    label: "ShopeePay",
    logo: "/images/payment/SPAY.png",
    bgColor: "bg-[#EE4D2D]",
    sublabel: "E-Wallet",
  },
  {
    id: "BCA_VA",
    label: "BCA Virtual Account",
    logo: "/images/payment/bca.png",
    bgColor: "bg-white border border-gray-200",
    sublabel: "Transfer Bank",
  },
  {
    id: "BRI_VA",
    label: "BRI Virtual Account",
    logo: "/images/payment/bri.png",
    bgColor: "bg-white border border-gray-200",
    sublabel: "Transfer Bank",
  },
  {
    id: "BNI_VA",
    label: "BNI Virtual Account",
    logo: "/images/payment/bni.png",
    bgColor: "bg-white border border-gray-200",
    sublabel: "Transfer Bank",
  },
  {
    id: "MANDIRI_VA",
    label: "Mandiri Virtual Account",
    logo: "/images/payment/mandiri.png",
    bgColor: "bg-white border border-gray-200",
    sublabel: "Transfer Bank",
  },
];
