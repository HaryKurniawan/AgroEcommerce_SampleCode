import type {
  ApiAddressData,
  AddressSelectionData,
  FormattedAddressData,
} from "@/types";

/**
 * Formats address details into a readable string
 * @param address - Address data to format
 * @returns Formatted address string
 */
export function formatAddressDetails(
  address: ApiAddressData | AddressSelectionData,
): string {
  const components = [
    address.alamat,
    address.kelurahan,
    address.kecamatan,
    address.kota,
    address.provinsi,
    address.kodePos,
  ].filter(Boolean); // Remove empty/null components

  return components.join(", ");
}

/**
 * Gets display name for an address
 * @param address - Address data
 * @returns Display name for the address
 */
export function getAddressDisplayName(
  address: ApiAddressData | AddressSelectionData,
): string {
  return address.penerima || address.label || "Alamat Pengiriman";
}

/**
 * Converts ApiAddressData to AddressSelectionData
 * @param address - API address data
 * @returns Address selection data
 */
export function toAddressSelectionData(
  address: ApiAddressData,
): AddressSelectionData {
  return {
    id: String(address.id || ""),
    label: address.label || "",
    penerima: address.penerima,
    alamat: address.alamat || "",
    kota: address.kota || "",
    provinsi: address.provinsi,
    kecamatan: address.kecamatan,
    kelurahan: address.kelurahan,
    kodePos: address.kodePos,
    isDefault: address.isDefault || false,
  };
}

/**
 * Formats address data for display purposes
 * @param address - Address data to format
 * @returns Formatted address data
 */
export function formatAddressForDisplay(
  address: ApiAddressData | AddressSelectionData,
): FormattedAddressData {
  const addressName = getAddressDisplayName(address);
  const addressDetails = formatAddressDetails(address);
  const hasAddressName = Boolean(address.penerima || address.label);

  return {
    addressName,
    addressDetails,
    hasAddressName,
  };
}

/**
 * Validates if an address has required fields for wholesale order
 * @param address - Address data to validate
 * @returns True if address is valid for order submission
 */
export function isValidAddressForOrder(
  address: ApiAddressData | AddressSelectionData | null,
): boolean {
  if (!address) return false;
  return Boolean(address.alamat && address.kota);
}

/**
 * Gets the selected address from a list by ID
 * @param addresses - List of addresses
 * @param selectedId - Selected address ID
 * @returns Selected address or null
 */
export function getSelectedAddress(
  addresses: ApiAddressData[],
  selectedId: string,
): ApiAddressData | null {
  return addresses.find((addr) => String(addr.id) === selectedId) || null;
}
