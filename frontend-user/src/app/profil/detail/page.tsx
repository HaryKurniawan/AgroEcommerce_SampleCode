"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Loader2,
  Edit2,
  CheckCircle2,
  ShieldAlert,
  X,
  Check,
} from "lucide-react";

import { useProfile } from "@/src/hooks/profil/useProfile";
import { useDefaultAddress } from "@/src/hooks/profil/useDefaultAddress";
import { useProfileActions } from "@/src/hooks/profil/useProfileActions";
import { useAuthStore } from "@/src/store/auth-store";

const ProfileDetailPage: React.FC = () => {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const {
    profile,
    loading: profileLoading,
    refetch,
  } = useProfile(isAuthenticated, _hasHydrated);
  const { loading: addressLoading } = useDefaultAddress(
    isAuthenticated,
    _hasHydrated,
  );
  const { updateProfile, actionLoading, toast, setToast } = useProfileActions();

  const loading = profileLoading || addressLoading;

  // Edit name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  // Edit phone state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated && _hasHydrated) {
      router.push("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (profile?.name) setNameValue(profile.name);
    if (profile?.phone) setPhoneValue(profile.phone);
  }, [profile?.name, profile?.phone]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    const { success } = await updateProfile({ name: nameValue.trim() });
    if (success) {
      setIsEditingName(false);
      refetch();
    }
  };

  const handleSavePhone = async () => {
    const cleaned = phoneValue.trim();
    if (!cleaned) return;
    if (cleaned.length < 9) {
      setToast("Nomor telepon minimal 9 digit");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const { success } = await updateProfile({ phoneNumber: cleaned });
    if (success) {
      setIsEditingPhone(false);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat Detail Profil...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
          <CheckCircle2
            size={16}
            className={
              toast.includes("berhasil") ? "text-green-400" : "text-red-400"
            }
          />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 lg:top-16 z-30">
        <div className="max-w-2xl mx-auto flex items-center relative">
          <button
            onClick={() => router.push("/profil")}
            className="absolute left-0 p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-base text-gray-800 w-full text-center">
            Detail Profil
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Nama Lengkap */}
          <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-100">
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0 mt-0.5">
              <User size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Nama Lengkap
              </p>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={actionLoading || !nameValue.trim()}
                    className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNameValue(profile.name || "");
                    }}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={actionLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {profile.name || (
                      <span className="italic text-gray-400 font-normal">
                        Belum diatur
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                  >
                    <Edit2 size={13} />
                    Ubah
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-100">
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0 mt-0.5">
              <Mail size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Email
              </p>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {profile.email || "-"}
              </p>
            </div>
          </div>

          {/* Nomor Telepon */}
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0 mt-0.5">
              <Phone size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Nomor Telepon
                </p>
              </div>
              {isEditingPhone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    maxLength={15}
                    value={phoneValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPhoneValue(val);
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
                    autoFocus
                    placeholder="Contoh: 08123456789"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePhone();
                      if (e.key === "Escape") setIsEditingPhone(false);
                    }}
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleSavePhone}
                    disabled={actionLoading || !phoneValue.trim()}
                    className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneValue(profile.phone || "");
                    }}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={actionLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {profile.phone || (
                      <span className="italic text-gray-400 font-normal">
                        Belum diatur
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                  >
                    <Edit2 size={13} />
                    Ubah
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
