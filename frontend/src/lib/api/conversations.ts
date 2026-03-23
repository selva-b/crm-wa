import apiClient from "./client";
import type {
  ConversationListResponse,
  ListConversationsParams,
} from "@/lib/types/inbox";

export const conversationsApi = {
  list: (params?: ListConversationsParams) =>
    apiClient
      .get<ConversationListResponse>("/messaging/conversations", { params })
      .then((r) => r.data),

  markAsRead: (conversationId: string) =>
    apiClient
      .post(`/messaging/conversations/${conversationId}/read`)
      .then((r) => r.data),
};
