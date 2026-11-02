import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 * Komponen reusable untuk menampilkan empty state
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={ShoppingCart}
 *   title="Keranjang Kosong"
 *   message="Belum ada produk di keranjang Anda"
 *   action={<Button>Mulai Belanja</Button>}
 * />
 * ```
 */
export default function EmptyState({
  icon: Icon,
  title = "Tidak ada data",
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon size={32} className="text-gray-400" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}

      {message && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{message}</p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
