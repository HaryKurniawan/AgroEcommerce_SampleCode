// Shipping status flow matches backend:
// PREPARING → PICKUP_CONFIRMATION → PICKED_UP → IN_TRANSIT → ARRIVED
// Seller controls: PREPARING → PICKUP_CONFIRMATION
// Courier controls: PICKUP_CONFIRMATION → PICKED_UP → IN_TRANSIT → ARRIVED

export const SHIPPING_STEPS = [
  "PREPARING",
  "PICKUP_CONFIRMATION",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
] as const;

export const getStatusLabel = (s: string) => {
  switch (s) {
    case "PREPARING":
      return "Disiapkan Seller";
    case "PICKUP_CONFIRMATION":
      return "Diserahkan ke Kurir";
    case "PICKED_UP":
      return "Diterima Kurir";
    case "IN_TRANSIT":
      return "Dalam Perjalanan";
    case "ARRIVED":
      return "Sampai di Tujuan";
    default:
      return s;
  }
};

export const getStatusIcon = (s: string) => {
  switch (s) {
    case "PREPARING":
      return "📦";
    case "PICKUP_CONFIRMATION":
      return "🤝";
    case "PICKED_UP":
      return "✅";
    case "IN_TRANSIT":
      return "🚚";
    case "ARRIVED":
      return "📍";
    default:
      return "";
  }
};

// Only seller can advance from PREPARING → PICKUP_CONFIRMATION
export const getNextStatus = (s: string) => {
  switch (s) {
    case "PREPARING":
      return "PICKUP_CONFIRMATION";
    // Courier handles the rest; seller only has one advance action
    default:
      return null;
  }
};

export const getStatusColor = (s: string) => {
  switch (s) {
    case "MENUNGGU_BAYAR":
      return "bg-slate-100 text-slate-600 border border-slate-200";
    case "DIPROSES":
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    case "DIKIRIM":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "SELESAI":
      return "bg-slate-50 text-slate-400 border border-slate-100";
    case "DIBATALKAN":
      return "bg-slate-100 text-slate-500 border border-slate-200";
    default:
      return "bg-slate-100 text-slate-500 border border-slate-200";
  }
};
