"use client";

// =====================================================
// STATUS BADGE — BADGE STATUS BOOKING/ORDER
// =====================================================

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; color: string }> = {
  diajukan: {
    label: "Diajukan",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  diproses: {
    label: "Diproses",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  dikirim: {
    label: "Dikirim",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  selesai: {
    label: "Selesai",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  menunggu_bayar: {
    label: "Menunggu Bayar",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const config = Object.prototype.hasOwnProperty.call(statusConfig, status)
    ? statusConfig[status as keyof typeof statusConfig]
    : { label: status, color: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${config.color} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
