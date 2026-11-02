"use client";

import { useRouter } from "next/navigation";

import OperationalChat from "@/components/ecommerce/OperationalChat";
import { useAuthStore } from "@/store/auth-store";

export default function CourierChatAdminPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated || !user) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* --- Chat Component --- */}
      <div className="flex-1 overflow-hidden">
        <OperationalChat
          currentUserId={user.id}
          chatType="ADMIN_CS"
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}
