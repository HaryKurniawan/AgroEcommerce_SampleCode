import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  QrCode,
  CreditCard,
  Wallet,
} from "lucide-react";

interface PaymentMockupActionProps {
  isProcessing: boolean;
  onSimulatePayment: () => void;
  paymentUrl?: string;
  metodeBayar?: string;
}

// Xendit Invoice App Mockup — mirip tampilan DANA, OVO, dsb.
const XenditAppMockup: React.FC<{
  paymentUrl: string;
  metodeBayar?: string;
}> = ({ paymentUrl, metodeBayar }) => {
  const isEwallet = ["OVO", "DANA", "GOPAY", "LINKAJA", "SHOPEEPAY"].includes(
    (metodeBayar || "").toUpperCase(),
  );
  const isQris = metodeBayar?.toUpperCase() === "QRIS";

  const appInfo = {
    DANA: { imgSrc: "/images/payment/DANA.png", name: "DANA" },
    OVO: { imgSrc: "/images/payment/OVO.png", name: "OVO" },
    GOPAY: { imgSrc: "/images/payment/GOPAY.png", name: "GoPay" },
    LINKAJA: { imgSrc: null, name: "LinkAja" },
    SHOPEEPAY: { imgSrc: "/images/payment/SPAY.png", name: "ShopeePay" },
  };

  const app =
    appInfo[metodeBayar?.toUpperCase() as keyof typeof appInfo] || null;

  // Baca nama bank untuk VA
  const bankName = (() => {
    const m = (metodeBayar || "").toUpperCase();
    if (m === "BCA_VA") return "BCA";
    if (m === "MANDIRI_VA") return "Mandiri";
    if (m === "BRI_VA") return "BRI";
    if (m === "BNI_VA") return "BNI";
    if (m === "PERMATA_VA") return "Permata";
    if (m.endsWith("_VA")) return m.replace("_VA", "");
    return null;
  })();
  const isVA = bankName !== null;

  // Jika metode adalah VA, tidak perlu menampilkan mockup app ini sama sekali
  // karena info VA sudah ada di PaymentDetails
  if (isVA) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      {/* Header */}
      <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
            <CreditCard size={14} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">
            {isEwallet && app
              ? app.name
              : isQris
                ? "QRIS"
                : "Invoice Pembayaran"}
          </span>
        </div>
        <span className="text-primary-100 text-[10px]">Secure Payment</span>
      </div>

      {/* Content sesuai metode yang dipilih */}
      <div className="p-4">
        {isEwallet && app ? (
          /* E-Wallet spesifik */
          <div className="bg-gray-50 p-4 rounded-xl text-center flex flex-col items-center">
            {app.imgSrc ? (
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-2 p-1.5 border border-gray-100 shadow-sm">
                <Image
                  src={app.imgSrc}
                  alt={app.name}
                  width={48}
                  height={48}
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="text-3xl mb-1">💳</div>
            )}
            <p className="text-xs font-semibold text-gray-700">{app.name}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Klik tombol di bawah untuk membuka aplikasi
            </p>
          </div>
        ) : isQris ? (
          /* QRIS */
          <div className="flex flex-col items-center py-3">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
              <QrCode size={48} className="text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Scan QR via aplikasi apapun
            </p>
          </div>
        ) : (
          /* Fallback generic */
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Buka Invoice Pembayaran
              </p>
              <p className="text-[10px] text-gray-400">
                Selesaikan pembayaran melalui link di bawah
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentMockupAction: React.FC<PaymentMockupActionProps> = ({
  isProcessing,
  onSimulatePayment,
  paymentUrl,
  metodeBayar,
}) => {
  return (
    <div className="space-y-3">
      {/* Real Xendit Payment Action */}
      {paymentUrl ? (
        <XenditAppMockup paymentUrl={paymentUrl} metodeBayar={metodeBayar} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Wallet size={15} className="text-gray-400" />
            <p className="text-xs text-gray-600 font-medium">Link pembayaran</p>
          </div>
          <p className="text-[11px] text-gray-400">
            Link akan tersedia setelah pesanan dikonfirmasi. Periksa halaman
            pesanan Anda.
          </p>
        </div>
      )}

      {/* Mockup/Demo Buttons Container */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-500 font-medium mb-3">
          Mode Development
        </p>

        <div className="space-y-3">
          {/* Real Xendit CTA */}
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-200 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Bayar Sekarang via Xendit
            </a>
          )}

          {/* Simulation CTA */}
          <button
            onClick={onSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3 bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? "Memproses..." : "Simulasi: Berhasil Dibayar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMockupAction;
