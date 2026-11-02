/**
 * String Utilities
 * Fungsi-fungsi untuk manipulasi string
 */

/**
 * Truncate string dengan ellipsis
 * @param text - Text yang akan di-truncate
 * @param maxLength - Panjang maksimal
 * @returns String yang sudah di-truncate
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalize first letter
 * @param text - Text yang akan di-capitalize
 * @returns String dengan huruf pertama kapital
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize setiap kata
 * @param text - Text yang akan di-capitalize
 * @returns String dengan setiap kata diawali huruf kapital
 */
export function capitalizeWords(text: string): string {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert string ke slug (URL-friendly)
 * @param text - Text yang akan diconvert
 * @returns String slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get initials dari nama
 * @param name - Nama lengkap
 * @param maxLength - Panjang maksimal initial (default: 2)
 * @returns Initial (contoh: "John Doe" -> "JD")
 */
export function getInitials(name: string, maxLength = 2): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);
  const initials = words
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, maxLength);

  return initials;
}

/**
 * Format nomor telepon Indonesia
 * @param phone - Nomor telepon
 * @returns Nomor telepon terformat (contoh: "0812-3456-7890")
 */
export function formatPhoneNumber(phone: string): string {
  // Hapus semua karakter non-digit
  const cleaned = phone.replace(/\D/g, "");

  // Format: 0812-3456-7890
  if (cleaned.length === 11 || cleaned.length === 12) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }

  // Format: 0812-345-6789
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d+)/, "$1-$2-$3");
  }

  return phone;
}

/**
 * Mask email (contoh: "john@example.com" -> "j***@example.com")
 * @param email - Email address
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  if (!email) return "";

  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  const maskedLocal =
    localPart.charAt(0) +
    "***" +
    (localPart.length > 1 ? localPart.slice(-1) : "");

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number (contoh: "081234567890" -> "0812****7890")
 * @param phone - Phone number
 * @returns Masked phone
 */
export function maskPhone(phone: string): string {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 8) return phone;

  return cleaned.slice(0, 4) + "****" + cleaned.slice(-4);
}

/**
 * Remove HTML tags dari string
 * @param html - HTML string
 * @returns Plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML special characters
 * @param text - Text yang akan di-escape
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  // eslint-disable-next-line security/detect-object-injection
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Generate random string
 * @param length - Panjang string
 * @returns Random string
 */
export function randomString(length: number): string {
  // Karakter alfanumerik untuk generate string acak
  /* eslint-disable no-secrets/no-secrets */
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  /* eslint-enable no-secrets/no-secrets */
  const digits = "0123456789";
  const chars = upper + lower + digits;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
