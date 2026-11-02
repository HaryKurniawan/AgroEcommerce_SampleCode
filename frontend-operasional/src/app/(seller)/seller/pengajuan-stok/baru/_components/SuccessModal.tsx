import { CheckCircle2, ClipboardList } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  gudangNama: string;
  onClose: () => void;
  onViewStatus: () => void;
  onCreateNew: () => void;
}

export function SuccessModal({
  isOpen,
  gudangNama,
  onClose,
  onViewStatus,
  onCreateNew,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-5"
        style={{ animation: "fadeScaleIn 0.3s ease-out" }}
      >
        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center border-4 border-primary-100">
            <CheckCircle2 className="w-10 h-10 text-primary-500" />
          </div>
          <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">
            Pengajuan Berhasil!
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Pengajuan stok ke{" "}
            <span className="font-semibold text-primary-600">{gudangNama}</span>{" "}
            telah berhasil dikirim. Tim gudang akan segera memprosesnya.
          </p>
        </div>

        {/* Info Badge */}
        <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 text-left leading-relaxed">
            Pantau status pengajuan di halaman{" "}
            <strong>Status Pengajuan Stok</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onViewStatus}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Lihat Status Pengajuan
          </button>
          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-2xl text-sm font-medium hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Buat Pengajuan Baru
          </button>
        </div>
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
