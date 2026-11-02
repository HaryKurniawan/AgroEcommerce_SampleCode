"use client";

import { useParams, useRouter } from "next/navigation";

import OperationalChat from "@/components/ecommerce/OperationalChat";
import { useAuthStore } from "@/store/auth-store";

export default function CourierChatSellerPage() {
  const router = useRouter();
  const params = useParams();
  const { user, _hasHydrated } = useAuthStore();
  const tokoId = params.tokoId as string;

  if (!_hasHydrated || !user) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* --- Chat Component --- */}
      <div className="flex-1 overflow-hidden">
        <OperationalChat
          currentUserId={user.id}
          chatType="SELLER_CHAT"
          tokoId={tokoId}
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}
