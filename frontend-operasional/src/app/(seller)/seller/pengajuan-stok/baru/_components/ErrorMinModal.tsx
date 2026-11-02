import { AlertCircle } from "lucide-react";

interface ErrorMinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorMinModal({ isOpen, onClose }: ErrorMinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-5"
        style={{ animation: "fadeScaleIn 0.3s ease-out" }}
      >
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center border-4 border-rose-100">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Gagal Mengajukan</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Pesanan Anda tidak mencukupi minimal yaitu{" "}
            <span className="font-semibold text-rose-600">300 kg</span>. Silakan
            tambah jumlah produk.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
        >
          Mengerti
        </button>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
