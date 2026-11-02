import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { formatRupiah } from "@/lib/ecommerce-api";

interface PaymentDetailsProps {
  metode: { label: string; icon: string };
  vaNumber: string;
  total: number;
  copied: boolean;
  onCopy: () => void;
  metodeBayar?: string; // Mengetahui apakah ini QRIS, EWallet, VA, atau Xendit Invoice
  paymentUrl?: string; // URL Xendit Invoice
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  metode,
  vaNumber,
  total,
  copied,
  onCopy,
  metodeBayar,
  paymentUrl,
}) => {
  const isQRIS = metodeBayar?.toUpperCase() === "QRIS";
  const isVA = metodeBayar?.toUpperCase().endsWith("_VA") ?? false;
  const isEWallet = ["OVO", "DANA", "GOPAY", "LINKAJA", "SHOPEEPAY"].includes(
    metodeBayar?.toUpperCase() || "",
  );

  // Xendit Invoice URL tersedia → gunakan link invoice universal
  const hasXenditInvoice = !!paymentUrl && paymentUrl.startsWith("http");

  // E-wallet brand colors
  const ewalletInfo: Record<
    string,
    { color: string; bg: string; text: string; logo: string }
  > = {
    OVO: {
      color: "from-purple-600 to-purple-700",
      bg: "bg-purple-50",
      text: "text-purple-700",
      logo: "💜",
    },
    DANA: {
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      logo: "💙",
    },
    GOPAY: {
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-700",
      logo: "💚",
    },
    LINKAJA: {
      color: "from-red-500 to-red-600",
      bg: "bg-red-50",
      text: "text-red-700",
      logo: "❤️",
    },
    SHOPEEPAY: {
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-700",
      logo: "🛍️",
    },
  };

  const currentEwallet =
    ewalletInfo[metodeBayar?.toUpperCase() as keyof typeof ewalletInfo] || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Metode */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Metode Pembayaran</p>
        <div className="flex items-center">
          <span className="font-semibold text-gray-800">{metode.label}</span>
        </div>
      </div>

      {/* Payment Information Area */}
      <div className="p-4 bg-gray-50 flex flex-col items-center justify-center">
        {isQRIS && !hasXenditInvoice ? (
          /* Legacy QRIS QR Code */
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <QRCodeSVG value={vaNumber} size={200} />
            <p className="text-xs text-center text-gray-500 mt-3 font-medium">
              Scan QR Code ini untuk membayar
            </p>
          </div>
        ) : isVA && !hasXenditInvoice ? (
          /* Legacy VA Number display */
          <div className="w-full">
            <p className="text-xs text-gray-400 mb-2">Nomor Virtual Account</p>
            <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-gray-200 w-full overflow-hidden">
              <span className="font-mono font-bold text-sm text-gray-900 tracking-wider truncate flex-1">
                {vaNumber}
              </span>
              <button
                onClick={onCopy}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  copied
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={12} /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Salin
                  </>
                )}
              </button>
            </div>
          </div>
        ) : isEWallet && currentEwallet && !hasXenditInvoice ? (
          /* Legacy E-wallet info */
          <div className="w-full rounded-xl bg-gray-100 p-4 text-center">
            <div className="text-4xl mb-2">{currentEwallet.logo}</div>
            <p className="text-sm font-medium text-gray-600">
              {metodeBayar === "OVO"
                ? "Cek aplikasi OVO Anda untuk konfirmasi pembayaran."
                : `Gunakan link di bawah untuk membuka ${metode.label}.`}
            </p>
          </div>
        ) : hasXenditInvoice ? (
          /* Xendit Invoice Dummy VA */
          <div className="w-full">
            <p className="text-xs text-gray-400 mb-2">
              Nomor Pembayaran (Demo)
            </p>
            <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-gray-200 w-full overflow-hidden">
              <span className="font-mono font-bold text-sm text-gray-900 tracking-wider truncate flex-1">
                {vaNumber || "0000000000"}
              </span>
              <button
                onClick={onCopy}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  copied
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={12} /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Salin
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Fallback */
          <div className="w-full">
            <p className="text-xs text-gray-400 mb-2">Nomor Virtual Account</p>
            <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-gray-200 w-full overflow-hidden">
              <span className="font-mono font-bold text-sm text-gray-900 tracking-wider truncate flex-1">
                {vaNumber}
              </span>
              <button
                onClick={onCopy}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  copied
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={12} /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Salin
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Total Pembayaran</p>
        <p className="font-display font-bold text-2xl text-gray-900">
          {formatRupiah(Number(total))}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {hasXenditInvoice
            ? "Bayar via link Invoice di atas"
            : isQRIS || isEWallet
              ? "Lakukan pembayaran sesuai instruksi di atas"
              : "Transfer sesuai jumlah di atas agar pembayaran terverifikasi otomatis"}
        </p>
      </div>
    </div>
  );
};

export default PaymentDetails;
