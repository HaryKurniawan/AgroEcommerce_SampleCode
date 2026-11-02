"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/src/store/auth-store";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth, triggerOnboarding } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const nama = searchParams.get("nama");
    const email = searchParams.get("email");
    const peran = searchParams.get("peran");
    const isNew = searchParams.get("isNew");

    if (!token) {
      router.push("/login?error=google_failed");
      return;
    }

    if (peran && peran !== "KONSUMEN") {
      router.push("/login?error=unauthorized_role");
      return;
    }

    // Simpan token sebagai httpOnly cookie melalui API route (server-side)
    // agar proxy-handler bisa membacanya. document.cookie tidak bisa buat httpOnly.
    fetch("/api/auth/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal menyimpan token");

        // Simpan data user ke Zustand store (non-sensitive, no token stored here)
        const decodedId = id ? decodeURIComponent(id) : "";
        const decodedNama = nama ? decodeURIComponent(nama) : "User";
        const decodedEmail = email ? decodeURIComponent(email) : "";
        setAuth({
          id: decodedId,
          email: decodedEmail,
          name: decodedNama === "undefined" ? "User" : decodedNama,
          role: peran || "KONSUMEN",
        });

        // Jika user baru, trigger onboarding modal
        if (isNew === "1") {
          triggerOnboarding();
        }

        // Redirect ke halaman utama
        router.push("/");
      })
      .catch(() => {
        router.push("/login?error=google_failed");
      });
  }, [searchParams, router, setAuth, triggerOnboarding]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          Menyelesaikan login dengan Google...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
