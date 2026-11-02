"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import OperationalChat from "@/components/ecommerce/OperationalChat";
import { useAuthStore } from "@/store/auth-store";
import { chatApi } from "@/lib/ecommerce-api";

export default function SellerConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [convType, setConvType] = useState<"ADMIN_CS" | "SELLER_CHAT">(
    "SELLER_CHAT",
  );
  const [loading, setLoading] = useState(true);

  const conversationId = params.id as string;

  useEffect(() => {
    if (!conversationId) return;

    const fetchConvDetails = async () => {
      try {
        const res = await chatApi.getConversation(conversationId);
        const data = res.data?.data || res.data;
        // In the backend, CHAT_PENJUAL is the type for customer-to-seller chats
        if (data.tipe === "ADMIN_CS" || data.type === "ADMIN_CS") {
          setConvType("ADMIN_CS");
        } else {
          setConvType("SELLER_CHAT");
        }
      } catch (err) {
        console.error("Failed to fetch conversation details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConvDetails();
  }, [conversationId]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <OperationalChat
        currentUserId={user.id}
        chatType={convType}
        initialConversationId={conversationId}
      />
    </div>
  );
}
