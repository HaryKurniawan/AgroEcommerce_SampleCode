"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const nama = searchParams.get("nama");
    const email = searchParams.get("email");
    const peran = searchParams.get("peran");

    if (!token) {
      router.push(
        "/?error=google_failed&message=Login dengan Google gagal. Token tidak ditemukan.",
      );
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

        // Simpan data user ke Zustand store
        const decodedId = id ? decodeURIComponent(id) : "";
        const decodedNama = nama ? decodeURIComponent(nama) : "User";
        const decodedEmail = email ? decodeURIComponent(email) : "";

        setAuth({
          id: decodedId,
          email: decodedEmail,
          name: decodedNama === "undefined" ? "User" : decodedNama,
          role: peran || "PENJUAL",
        });

        // Redirect ke dashboard yang sesuai dengan peran user
        const role = peran || "";
        if (role === "SUPER_ADMIN") {
          router.replace("/admin/dashboard");
        } else if (role === "PENJUAL") {
          router.replace("/seller/dashboard");
        } else if (role === "KURIR") {
          router.replace("/kurir/pesanan");
        } else if (role === "ADMIN_CS") {
          router.replace("/cs/chat");
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        router.push(
          "/?error=google_failed&message=Login dengan Google gagal. Silakan coba lagi.",
        );
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          Menyelesaikan login dengan Google...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
