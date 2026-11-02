/**
 * Date Utilities
 * Fungsi-fungsi untuk formatting tanggal dan waktu
 */

/**
 * Format tanggal dengan berbagai style
 * @param date - Date object atau string ISO
 * @param style - Style formatting
 * @returns String tanggal terformat
 */
export function formatDate(
  date: Date | string,
  style: "short" | "medium" | "long" | "full" = "medium",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
    medium: {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
    long: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    full: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  // eslint-disable-next-line security/detect-object-injection
  return dateObj.toLocaleDateString("id-ID", options[style]);
}

/**
 * Format waktu
 * @param date - Date object atau string ISO
 * @param withSeconds - Tampilkan detik atau tidak
 * @returns String waktu terformat (contoh: "14:30" atau "14:30:45")
 */
export function formatTime(date: Date | string, withSeconds = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds && { second: "2-digit" }),
  });
}

/**
 * Format tanggal dan waktu
 * @param date - Date object atau string ISO
 * @returns String tanggal dan waktu terformat
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (contoh: "2 jam yang lalu", "3 hari yang lalu")
 * @param date - Date object atau string ISO
 * @returns String relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} minggu yang lalu`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} tahun yang lalu`;
}

/**
 * Check apakah tanggal adalah hari ini
 * @param date - Date object atau string ISO
 * @returns Boolean
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check apakah tanggal adalah kemarin
 * @param date - Date object atau string ISO
 * @returns Boolean
 */
export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get nama hari dalam bahasa Indonesia
 * @param date - Date object atau string ISO
 * @returns Nama hari
 */
export function getDayName(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("id-ID", { weekday: "long" });
}

/**
 * Get nama bulan dalam bahasa Indonesia
 * @param date - Date object atau string ISO
 * @returns Nama bulan
 */
export function getMonthName(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("id-ID", { month: "long" });
}
