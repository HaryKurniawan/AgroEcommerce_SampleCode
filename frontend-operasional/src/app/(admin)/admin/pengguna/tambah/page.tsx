"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  Truck,
  Headphones,
  User,
  Mail,
  Lock,
  Phone,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { message } from "antd";
import Link from "next/link";

import { adminApi } from "@/lib/ecommerce-api";
import { CreateSellerForm } from "@/components/ecommerce/CreateSellerForm";
import PageHeader from "@/components/ui/PageHeader";

export default function AddUserPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"SELLER" | "COURIER" | "CS">(
    "SELLER",
  );

  // Seller state — use CreateSellerForm overlay
  const [showSellerForm, setShowSellerForm] = useState(false);

  // Courier / CS state
  const [stores, setStores] = useState<
    { id: string; storeName: string; ownerName: string }[]
  >([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesLoaded, setStoresLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCourierPassword, setShowCourierPassword] = useState(false);
  const [showCSPassword, setShowCSPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    courierOwnName: "",
    courierOwnEmail: "",
    courierOwnPassword: "",
    courierOwnPhone: "",
    selectedStoreId: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = async (role: "SELLER" | "COURIER" | "CS") => {
    setSelectedRole(role);
    if (role === "COURIER" && !storesLoaded) {
      setLoadingStores(true);
      try {
        const res = await adminApi.getSellerCourierAffiliations();
        const data: any[] =
          res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        const activeStores = data
          .filter((item: any) => item.sellerProfile?.store)
          .map((item: any) => ({
            id: item.sellerProfile.store.id,
            storeName: item.sellerProfile.storeName,
            ownerName: item.name,
          }));
        setStores(activeStores);
        setStoresLoaded(true);
      } catch (err) {
        console.error("Gagal mengambil data toko:", err);
      } finally {
        setLoadingStores(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedRole === "CS") {
        if (
          !formData.name ||
          !formData.email ||
          !formData.password ||
          !formData.phone
        ) {
          message.error("Semua kolom wajib diisi!");
          return;
        }
        if (formData.password.length < 6) {
          message.error("Password minimal 6 karakter!");
          return;
        }
        await adminApi.createUser({
          nama: formData.name,
          email: formData.email,
          kataSandi: formData.password,
          peran: "ADMIN_CS",
          noTelepon: formData.phone,
        });
        message.success("Akun Customer Service berhasil dibuat!");
        setTimeout(() => router.push("/admin/pengguna"), 1500);
      } else if (selectedRole === "COURIER") {
        if (
          !formData.courierOwnName ||
          !formData.courierOwnEmail ||
          !formData.courierOwnPassword ||
          !formData.courierOwnPhone ||
          !formData.selectedStoreId
        ) {
          message.error("Semua kolom wajib diisi!");
          return;
        }
        if (formData.courierOwnPassword.length < 6) {
          message.error("Password minimal 6 karakter!");
          return;
        }
        await adminApi.updateSellerCourierAffiliation(
          formData.selectedStoreId,
          {
            action: "create_new",
            courierName: formData.courierOwnName,
            courierEmail: formData.courierOwnEmail,
            courierPassword: formData.courierOwnPassword,
            courierPhone: formData.courierOwnPhone,
          },
        );
        message.success("Akun Kurir berhasil dibuat dan diafiliasikan!");
        setTimeout(() => router.push("/admin/pengguna"), 1500);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Gagal membuat akun.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto min-h-screen bg-gray-50/30">
      <div className="mb-8">
        <PageHeader
          title="Tambah Akun Pengguna Baru"
          description="Pilih jenis peran akun yang ingin didaftarkan."
          icon={User}
          iconColor="text-primary-600"
        />
      </div>

      {/* ── Role Selector ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Seller */}
        <button
          type="button"
          onClick={() => handleRoleSelect("SELLER")}
          className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative ${
            selectedRole === "SELLER"
              ? "border-primary-600 bg-primary-50/40"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          {selectedRole === "SELLER" && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
              <Check size={12} strokeWidth={3} className="text-white" />
            </div>
          )}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
              selectedRole === "SELLER"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-600"
            }`}
          >
            <Store size={22} />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Seller (Penjual)
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Akun penjual dengan toko dan kurir afiliasi.
          </p>
        </button>

        {/* Courier */}
        <button
          type="button"
          onClick={() => handleRoleSelect("COURIER")}
          className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative ${
            selectedRole === "COURIER"
              ? "border-primary-600 bg-primary-50/40"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          {selectedRole === "COURIER" && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
              <Check size={12} strokeWidth={3} className="text-white" />
            </div>
          )}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
              selectedRole === "COURIER"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-600"
            }`}
          >
            <Truck size={22} />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Kurir Internal
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Akun kurir yang diafiliasikan ke toko seller.
          </p>
        </button>

        {/* CS */}
        <button
          type="button"
          onClick={() => handleRoleSelect("CS")}
          className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative ${
            selectedRole === "CS"
              ? "border-primary-600 bg-primary-50/40"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          {selectedRole === "CS" && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
              <Check size={12} strokeWidth={3} className="text-white" />
            </div>
          )}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
              selectedRole === "CS"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-600"
            }`}
          >
            <Headphones size={22} />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Customer Service
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Akun admin operasional untuk layanan konsumen.
          </p>
        </button>
      </div>

      {/* ── SELLER: buka CreateSellerForm yang sama dengan toko/seller ── */}
      {selectedRole === "SELLER" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-[1.5rem] flex items-center justify-center">
            <Store size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base">
              Buat Akun Seller Baru
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm leading-relaxed">
              Form lengkap: akun seller, detail toko, pin lokasi di peta, dan
              afiliasi kurir.
            </p>
          </div>
          <button
            onClick={() => setShowSellerForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white text-sm font-medium rounded-2xl hover:bg-primary-700 transition-all"
          >
            <Store size={16} />
            Buka Form Buat Seller
          </button>
          <p className="text-xs text-gray-400">
            Atau langsung ke{" "}
            <Link
              href="/admin/toko/seller"
              className="text-primary-600 hover:underline"
            >
              halaman Manajemen Seller
            </Link>
          </p>
        </div>
      )}

      {/* ── COURIER & CS: inline form ── */}
      {selectedRole !== "SELLER" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* COURIER */}
            {selectedRole === "COURIER" && (
              <div className="space-y-6">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Truck size={16} className="text-primary-500" /> Informasi
                  Akun Kurir Baru
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(
                    [
                      {
                        label: "Nama Kurir",
                        name: "courierOwnName",
                        type: "text",
                        Icon: User,
                        placeholder: "Budi Kurir Internal",
                      },
                      {
                        label: "Email Kurir",
                        name: "courierOwnEmail",
                        type: "email",
                        Icon: Mail,
                        placeholder: "kurir@agrojabar.id",
                      },
                      {
                        label: "No Telepon",
                        name: "courierOwnPhone",
                        type: "tel",
                        Icon: Phone,
                        placeholder: "08XXXXXXXXXX",
                      },
                    ] as const
                  ).map(({ label, name, type, Icon, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                        {label} *
                      </label>
                      <div className="relative">
                        <Icon
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type={type}
                          name={name}
                          value={(formData as any)[name]}
                          onChange={handleInputChange}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400/50 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showCourierPassword ? "text" : "password"}
                        name="courierOwnPassword"
                        value={formData.courierOwnPassword}
                        onChange={handleInputChange}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400/50 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCourierPassword(!showCourierPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCourierPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Store selector */}
                <div className="border border-primary-100 bg-primary-50/30 rounded-2xl p-5">
                  <h5 className="text-xs text-primary-700 font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Store size={13} /> Afiliasi ke Toko Seller *
                  </h5>
                  {loadingStores ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                      <Loader2
                        size={16}
                        className="animate-spin text-primary-500"
                      />{" "}
                      Memuat data toko...
                    </div>
                  ) : (
                    <select
                      name="selectedStoreId"
                      value={formData.selectedStoreId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-400/50 outline-none"
                      required
                    >
                      <option value="">— Pilih Toko Seller —</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.storeName} (Pemilik: {s.ownerName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* CS */}
            {selectedRole === "CS" && (
              <div className="space-y-6">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Headphones size={16} className="text-primary-600" />{" "}
                  Informasi Akun Customer Service
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(
                    [
                      {
                        label: "Nama Lengkap",
                        name: "name",
                        type: "text",
                        Icon: User,
                        placeholder: "Ahmad CS",
                      },
                      {
                        label: "Email",
                        name: "email",
                        type: "email",
                        Icon: Mail,
                        placeholder: "cs@agrojabar.id",
                      },
                      {
                        label: "No Telepon",
                        name: "phone",
                        type: "tel",
                        Icon: Phone,
                        placeholder: "08XXXXXXXXXX",
                      },
                    ] as const
                  ).map(({ label, name, type, Icon, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                        {label} *
                      </label>
                      <div className="relative">
                        <Icon
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type={type}
                          name={name}
                          value={(formData as any)[name]}
                          onChange={handleInputChange}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400/50 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showCSPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400/50 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCSPassword(!showCSPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCSPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Link
                href="/admin/pengguna"
                className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                <ArrowLeft size={15} />
                Kembali
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium rounded-2xl transition-all disabled:opacity-50 bg-primary-600 hover:bg-primary-700"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Buat Akun{" "}
                    {selectedRole === "CS" ? "CS" : "Kurir"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CreateSellerForm overlay — same component as toko/seller page */}
      {showSellerForm && (
        <CreateSellerForm
          onSuccess={() => {
            setShowSellerForm(false);
            message.success("Seller baru berhasil dibuat!");
            setTimeout(() => router.push("/admin/toko/seller"), 1500);
          }}
          onCancel={() => setShowSellerForm(false)}
        />
      )}
    </div>
  );
}
