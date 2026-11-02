import { formatRupiah } from "@/lib/ecommerce-api";

interface PaymentInstructionsProps {
  vaNumber: string;
  total: number;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  vaNumber,
  total,
}) => {
  const displayVa = vaNumber?.startsWith("http")
    ? "https://checkout-staging..."
    : vaNumber;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">
        Cara Pembayaran
      </h3>
      <div className="space-y-3">
        {[
          "Buka aplikasi Mobile Banking / ATM bank Anda",
          "Pilih menu Transfer ke Virtual Account",
          `Masukkan nomor VA: ${displayVa}`,
          `Pastikan nominal ${formatRupiah(Number(total))} sudah sesuai`,
          "Konfirmasi dan selesaikan pembayaran",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-sm font-semibold text-gray-800 flex-shrink-0 mt-0.5 w-4">
              {i + 1}.
            </span>
            <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentInstructions;
