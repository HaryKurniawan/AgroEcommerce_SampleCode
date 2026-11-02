import { useQuery } from "@tanstack/react-query";

import { chatApi } from "@/lib/ecommerce-api";
import { queryKeys } from "@/hooks/query-keys";

interface ConversationData {
  id: string;
  type: "SELLER_CHAT" | "ADMIN_CS";
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  store: { id: string; nama: string; fotoUrl: string | null } | null;
  unreadCount: number;
}

export const useConversations = (
  isAuthenticated: boolean,
  _hasHydrated: boolean,
) => {
  const query = useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => chatApi.getConversations(),
    select: (res): ConversationData[] => {
      const data = res.data?.data || res.data || [];
      const convs = Array.isArray(data) ? data : [];
      return convs.filter(
        (c: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t.id === c.id),
      );
    },
    enabled: _hasHydrated && isAuthenticated,
    staleTime: 0,
  });

  return {
    conversations: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
