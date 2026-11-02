/**
 * Currency Utilities
 * Fungsi-fungsi untuk formatting mata uang Rupiah
 */

/**
 * Format angka menjadi format Rupiah
 * @param amount - Jumlah dalam angka
 * @param options - Opsi formatting tambahan
 * @returns String dalam format Rupiah (contoh: "Rp 10.000")
 */
export function formatRupiah(
  amount: number,
  options?: {
    withPrefix?: boolean;
    maximumFractionDigits?: number;
  },
): string {
  const { withPrefix = true, maximumFractionDigits = 0 } = options || {};

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits,
  }).format(amount);

  // Jika tidak ingin prefix "Rp", hapus
  if (!withPrefix) {
    return formatted.replace(/Rp\s?/, "");
  }

  return formatted;
}

/**
 * Parse string Rupiah menjadi number
 * @param rupiahString - String dalam format Rupiah
 * @returns Number
 */
export function parseRupiah(rupiahString: string): number {
  // Hapus semua karakter non-digit
  const cleaned = rupiahString.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format angka dengan pemisah ribuan
 * @param amount - Jumlah dalam angka
 * @returns String dengan pemisah ribuan (contoh: "10.000")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Singkat format Rupiah untuk jumlah besar
 * @param amount - Jumlah dalam angka
 * @returns String singkat (contoh: "10 Jt", "1,5 M")
 */
export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(amount);
}
