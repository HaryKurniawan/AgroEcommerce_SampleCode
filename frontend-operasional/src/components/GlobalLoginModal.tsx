"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

import ActionModal from "./ActionModal";

export default function GlobalLoginModal() {
  const router = useRouter();
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();

  const handleLogin = () => {
    closeLoginModal();
    router.push("/login");
  };

  return (
    <ActionModal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      illustration="/login-now.svg"
      title="Login dulu yuk!"
      description="Yuk, masuk ke akunmu untuk pengalaman belanja yang lebih seru!"
      variant="horizontal"
      primaryButton={{
        label: "Login Sekarang",
        onClick: handleLogin,
      }}
      secondaryButton={{
        label: "Nanti",
        onClick: closeLoginModal,
      }}
    />
  );
}
