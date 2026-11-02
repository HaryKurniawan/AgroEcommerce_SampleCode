import { apiClient } from "../api-client";

export const chatApi = {
  createConversation: (
    data: {
      type: "SELLER_CHAT" | "ADMIN_CS";
      tokoId?: string;
      targetUserId?: string;
    },
    token?: string,
  ) =>
    apiClient.post(
      "/chat/conversations",
      {
        tipe: data.type === "SELLER_CHAT" ? "CHAT_PENJUAL" : data.type,
        tokoId: data.tokoId,
        targetUserId: data.targetUserId,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    ),
  getConversations: (params?: { type?: string }) =>
    apiClient.get("/chat/conversations", { params }),
  getConversation: (
    id: string,
    params?: { page?: number; limit?: number },
    token?: string,
  ) =>
    apiClient.get(`/chat/conversations/${id}`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  sendMessage: (conversationId: string, content: string, token?: string) =>
    apiClient.post(
      `/chat/conversations/${conversationId}/messages`,
      { isiPesan: content },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    ),
  markAsRead: (conversationId: string) =>
    apiClient.patch(`/chat/conversations/${conversationId}/read`),
  getUnreadCount: (params?: { type?: string }) =>
    apiClient.get("/chat/unread-count", { params }),
  adminGetConversations: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/chat/admin/conversations", { params }),
};
