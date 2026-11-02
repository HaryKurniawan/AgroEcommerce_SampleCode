import { z } from "zod";

// === Regex Patterns ===
const phoneRegex = /^(\+62|0)[0-9]{8,12}$/;
const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
const postalCodeRegex = /^\d{5}$/;
const nameOnlyStringRegex = /^[a-zA-Z\s'.,-]+$/; // Tidak boleh angka

// === Reusable Fields ===
export const phoneField = z
  .string()
  .min(9, "Nomor telepon minimal 9 karakter")
  .max(15, "Nomor telepon maksimal 14 karakter")
  .regex(phoneRegex, "Format: 08XXXXXXXXXX atau +62XXXXXXXXXX");

export const emailField = z.string().email("Format email tidak valid");

export const passwordField = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(100, "Password terlalu panjang");

export const nameField = z
  .string()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama terlalu panjang")
  .regex(nameOnlyStringRegex, "Nama hanya boleh berisi huruf dan spasi");

export const postalCodeField = z
  .string()
  .regex(postalCodeRegex, "Kode pos harus 5 digit angka")
  .optional()
  .or(z.literal(""));

// === Form Schemas ===
export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

export const editPhoneSchema = z.object({
  phone: phoneField,
});

export const alamatSchema = z.object({
  label: z.string().min(1, "Label wajib dipilih"),
  penerima: nameField,
  telepon: phoneField,
  alamat: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  kota: z
    .string()
    .min(2, "Kota/Kabupaten wajib diisi")
    .regex(/^[a-zA-Z\s]+$/, "Kota hanya boleh berisi huruf"),
  kecamatan: z.string().optional(),
  kelurahan: z.string().optional(),
  provinsi: z
    .string()
    .min(2, "Provinsi wajib diisi")
    .regex(/^[a-zA-Z\s]+$/, "Provinsi hanya boleh berisi huruf")
    .optional()
    .or(z.literal("")),
  kodePos: postalCodeField,
  isDefault: z.boolean().optional(),
});

export const b2bVerificationStep1Schema = z.object({
  namaPerusahaan: z
    .string()
    .min(2, "Nama perusahaan minimal 2 karakter")
    .max(200),
  bidangUsaha: z.string().min(1, "Bidang usaha wajib dipilih"),
  npwp: z
    .string()
    .regex(npwpRegex, "Format NPWP: XX.XXX.XXX.X-XXX.XXX")
    .optional()
    .or(z.literal("")),
});

export const b2bVerificationStep2Schema = z.object({
  jabatan: z
    .string()
    .min(2, "Jabatan minimal 2 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Jabatan hanya boleh berisi huruf"),
  alamatKantor: z.string().min(5, "Alamat kantor minimal 5 karakter"),
  teleponKantor: phoneField,
});

export const createSellerSchema = z.object({
  email: emailField,
  password: passwordField,
  storeName: z.string().min(2, "Nama toko minimal 2 karakter"),
  storeAddress: z.string().min(5, "Alamat toko minimal 5 karakter"),
  storeCity: z.string().min(2, "Kota wajib diisi"),
  storeProvince: z.string().min(2, "Provinsi wajib diisi"),
  storePhone: phoneField,
  storePostalCode: postalCodeField,
  storeDescription: z.string().max(500).optional(),
  storeLat: z.number().optional(),
  storeLng: z.number().optional(),
});

export const createCourierSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama terlalu panjang"),
  email: emailField,
  password: passwordField,
  phone: phoneField,
});
