// Enum Peran sesuai backend Prisma schema (core.prisma)
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN_GUDANG = "ADMIN_GUDANG",
  GUDANG = "GUDANG",
  PENJUAL = "PENJUAL",
  KONSUMEN = "KONSUMEN",
  KURIR = "KURIR",
  ADMIN_CS = "ADMIN_CS",
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole | string; // string fallback untuk kompatibilitas
  isVerifiedB2B?: boolean;
  b2bVerification?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfilPetani {
  id: string;
  penggunaId: string;
  nik: string;
  namaKebun: string;
  noTelepon: string;
  alamat: string;
  lokasiKebun: string;
  luasLahan: number;
  satuanLuas: string;
  fotoWajahUrl: string;
  dataWajahUrl?: string;
  status: "PENDING" | "DISETUJUI" | "DITOLAK" | "DITANGGUHKAN";
  terverifikasiPada?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilPenjual {
  id: string;
  penggunaId: string;
  namaToko: string;
  slugToko: string;
  deskripsiToko?: string;
  logoTokoUrl?: string;
  bannerTokoUrl?: string;
  noTelepon: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  namaBank: string;
  noRekening: string;
  namaPemilikRekening: string;
  noKtp: string;
  fotoKtpUrl: string;
  status: "PENDING" | "DISETUJUI" | "DITOLAK" | "DITANGGUHKAN";
  terverifikasiPada?: string;
  rating: number;
  totalProduk: number;
  totalPenjualan: number;
  createdAt: string;
  updatedAt: string;
}

// Backward-compat aliases (jangan hapus — dipakai komponen lama)
export type FarmerProfile = ProfilPetani;
export type SellerProfile = ProfilPenjual;
